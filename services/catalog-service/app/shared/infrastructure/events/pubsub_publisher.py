"""Pub/Sub publisher for cross-service domain events."""

import json
import logging
import os
from concurrent.futures import Future

from google.api_core.exceptions import NotFound
from google.cloud.pubsub_v1 import PublisherClient

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> PublisherClient:
    if not hasattr(_get_client, "_client"):
        if settings.pubsub_emulator_host:
            # Set before client construction so the SDK uses grpc.insecure_channel
            # and AnonymousCredentials automatically — ClientOptions alone does not
            # suppress TLS.
            os.environ["PUBSUB_EMULATOR_HOST"] = settings.pubsub_emulator_host
        _get_client._client = PublisherClient()
    return _get_client._client


def _topic_path() -> str:
    return _get_client().topic_path(settings.gcp_project_id, settings.pubsub_topic_id)


def _on_publish_done(future: Future, event_type: str) -> None:
    try:
        future.result()
    except Exception:
        logger.exception("Pub/Sub delivery failed for event %s", event_type)


def ensure_topic() -> None:
    """Create the Pub/Sub topic if it doesn't exist (idempotent)."""
    client = _get_client()
    path = _topic_path()
    try:
        client.get_topic(request={"topic": path})
        logger.info("Pub/Sub topic ready: %s", path)
    except NotFound:
        client.create_topic(request={"name": path})
        logger.info("Pub/Sub topic created: %s", path)


async def publish_event(event_type: str, payload: dict) -> None:
    data = json.dumps(
        {"event_type": event_type, "service": "catalog-service", **payload}
    ).encode("utf-8")
    future = _get_client().publish(
        _topic_path(),
        data,
        event_type=event_type,
    )
    future.add_done_callback(lambda f: _on_publish_done(f, event_type))
