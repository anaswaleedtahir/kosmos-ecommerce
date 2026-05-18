"""Integration tests for Pub/Sub event publishing against the local emulator.

Requires PUBSUB_EMULATOR_HOST to be set (e.g. localhost:8085).
Run docker-compose up pubsub-emulator before executing.
"""

import json
import os
import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from google.api_core.exceptions import NotFound
from google.cloud.pubsub_v1 import SubscriberClient
from httpx import ASGITransport, AsyncClient

from app.shared.infrastructure.events.pubsub_publisher import _topic_path, ensure_topic

EMULATOR_HOST = os.getenv("PUBSUB_EMULATOR_HOST")
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "kosmos-local")

pytestmark = pytest.mark.skipif(
    not EMULATOR_HOST,
    reason="PUBSUB_EMULATOR_HOST not set — skipping pubsub integration tests",
)


# ── fixtures ────────────────────────────────────────────────────────────────


@pytest.fixture(scope="module")
def pubsub_topic():
    """Ensure the catalog-events topic exists once per module."""
    ensure_topic()
    yield _topic_path()


@pytest.fixture
def subscription(pubsub_topic):
    """Fresh pull subscription per test.

    Only receives messages published after the subscription is created.
    """
    sub_id = f"catalog-events-test-{uuid.uuid4().hex[:8]}"
    sub_path = f"projects/{PROJECT_ID}/subscriptions/{sub_id}"
    sub_client = SubscriberClient()

    sub_client.create_subscription(
        request={"name": sub_path, "topic": pubsub_topic}
    )
    yield sub_path, sub_client

    try:
        sub_client.delete_subscription(request={"subscription": sub_path})
    except NotFound:
        pass
    sub_client.close()


@pytest_asyncio.fixture
async def real_client(db) -> AsyncGenerator[AsyncClient, None]:
    """httpx client with real Pub/Sub but JWT auth bypassed via dependency override."""
    from app.main import app
    from app.shared.infrastructure.http.dependencies import require_catalog_write

    async def _mock_auth() -> dict:
        return {"sub": str(uuid.uuid4()), "permissions": ["catalog:write"]}

    app.dependency_overrides[require_catalog_write] = _mock_auth

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c

    app.dependency_overrides.pop(require_catalog_write, None)


# ── helpers ─────────────────────────────────────────────────────────────────


def pull_one(
    sub_client: SubscriberClient, sub_path: str, timeout: float = 5.0
) -> dict | None:
    """Pull up to 10 messages, ack all, return the first."""
    response = sub_client.pull(
        request={"subscription": sub_path, "max_messages": 10},
        timeout=timeout,
    )
    if not response.received_messages:
        return None
    ack_ids = [m.ack_id for m in response.received_messages]
    sub_client.acknowledge(request={"subscription": sub_path, "ack_ids": ack_ids})
    msg = response.received_messages[0].message
    return {
        "data": json.loads(msg.data.decode()),
        "attributes": dict(msg.attributes),
    }


async def _create_category(client: AsyncClient, name: str = "Shirts") -> str:
    slug = name.lower().replace(" ", "-")
    r = await client.post(
        "/api/v1/catalog/categories", json={"name": name, "slug": slug}
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]


async def _create_product(
    client: AsyncClient, category_id: str, name: str = "T-Shirt"
) -> str:
    r = await client.post(
        "/api/v1/catalog/products",
        json={"name": name, "category_id": category_id},
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]


async def _activate(client: AsyncClient, product_id: str) -> None:
    r = await client.patch(
        f"/api/v1/catalog/products/{product_id}/status",
        json={"active": True},
    )
    assert r.status_code == 200, r.text


async def _add_variant(
    client: AsyncClient, product_id: str, price: float = 49.99
) -> str:
    sku = f"SKU-{uuid.uuid4().hex[:8].upper()}"
    r = await client.post(
        f"/api/v1/catalog/products/{product_id}/variants",
        json={"sku": sku, "price": price, "attributes": {}},
    )
    assert r.status_code == 201, r.text
    return r.json()["id"]


# ── tests ────────────────────────────────────────────────────────────────────


@pytest.mark.integration
async def test_product_published_event(real_client, subscription):
    sub_path, sub_client = subscription

    cat_id = await _create_category(real_client)
    product_id = await _create_product(real_client, cat_id)
    await _activate(real_client, product_id)

    msg = pull_one(sub_client, sub_path)

    assert msg is not None, "No message received from Pub/Sub"
    assert msg["attributes"]["event_type"] == "ProductPublished"
    assert msg["data"]["product_id"] == product_id
    assert msg["data"]["service"] == "catalog-service"


@pytest.mark.integration
async def test_product_published_only_on_inactive_to_active(real_client, subscription):
    """Re-activating an already-active product must NOT emit a second event."""
    sub_path, sub_client = subscription

    cat_id = await _create_category(real_client, "Trousers")
    product_id = await _create_product(real_client, cat_id, "Jeans")
    await _activate(real_client, product_id)
    pull_one(sub_client, sub_path)  # drain first activation

    await _activate(real_client, product_id)  # idempotent — no new event

    msg = pull_one(sub_client, sub_path, timeout=2.0)
    assert msg is None, "Unexpected second ProductPublished event"


@pytest.mark.integration
async def test_price_changed_event(real_client, subscription):
    sub_path, sub_client = subscription

    cat_id = await _create_category(real_client, "Hoodies")
    product_id = await _create_product(real_client, cat_id, "Hoodie")
    await _activate(real_client, product_id)
    pull_one(sub_client, sub_path)  # drain ProductPublished

    variant_id = await _add_variant(real_client, product_id, price=49.99)

    r = await real_client.patch(
        f"/api/v1/catalog/variants/{variant_id}", json={"price": 39.99}
    )
    assert r.status_code == 200, r.text

    msg = pull_one(sub_client, sub_path)

    assert msg is not None, "No message received from Pub/Sub"
    assert msg["attributes"]["event_type"] == "ProductPriceChanged"
    assert msg["data"]["variant_id"] == variant_id
    assert msg["data"]["old_price"] == 49.99
    assert msg["data"]["new_price"] == 39.99


@pytest.mark.integration
async def test_inventory_restocked_event(real_client, subscription):
    sub_path, sub_client = subscription

    cat_id = await _create_category(real_client, "Caps")
    product_id = await _create_product(real_client, cat_id, "Cap")
    await _activate(real_client, product_id)
    pull_one(sub_client, sub_path)  # drain ProductPublished

    variant_id = await _add_variant(real_client, product_id)

    r = await real_client.post(
        f"/api/v1/inventory/variants/{variant_id}/restock",
        json={"quantity": 50},
    )
    assert r.status_code == 200, r.text

    msg = pull_one(sub_client, sub_path)

    assert msg is not None, "No message received from Pub/Sub"
    assert msg["attributes"]["event_type"] == "InventoryRestocked"
    assert msg["data"]["variant_id"] == variant_id
    assert msg["data"]["quantity_added"] == 50
    assert msg["data"]["quantity_on_hand"] == 50
