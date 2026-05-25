import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from shared.actor import ActorContext


@dataclass(frozen=True, kw_only=True)
class AuditContext:
    actor_id: uuid.UUID | None
    actor_username: str | None
    action: str
    entity_type: str
    entity_id: uuid.UUID
    payload: dict[str, Any]
    request_id: str
    occurred_at: datetime


@dataclass(frozen=True, kw_only=True)
class CatalogAuditEvent:
    actor: ActorContext
    occurred_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def action(self) -> str:
        raise NotImplementedError

    @property
    def entity_type(self) -> str:
        raise NotImplementedError

    @property
    def entity_id(self) -> uuid.UUID:
        raise NotImplementedError

    def payload(self) -> dict[str, Any]:
        return {}

    def to_audit_context(self) -> AuditContext:
        return AuditContext(
            actor_id=self.actor.actor_id,
            actor_username=self.actor.actor_email,
            action=self.action,
            entity_type=self.entity_type,
            entity_id=self.entity_id,
            payload=self.payload(),
            request_id=self.actor.request_id,
            occurred_at=self.occurred_at,
        )


@dataclass(frozen=True, kw_only=True)
class ProductCreated(CatalogAuditEvent):
    product_id: uuid.UUID
    name: str
    category_id: uuid.UUID
    slug: str

    @property
    def action(self) -> str:
        return "product_created"

    @property
    def entity_type(self) -> str:
        return "product"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.product_id

    def payload(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "category_id": str(self.category_id),
            "slug": self.slug,
        }


@dataclass(frozen=True, kw_only=True)
class ProductMetadataChanged(CatalogAuditEvent):
    product_id: uuid.UUID
    changes: dict[str, Any]

    @property
    def action(self) -> str:
        return "product_metadata_changed"

    @property
    def entity_type(self) -> str:
        return "product"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.product_id

    def payload(self) -> dict[str, Any]:
        return {"changes": self.changes}


@dataclass(frozen=True, kw_only=True)
class ProductActivated(CatalogAuditEvent):
    product_id: uuid.UUID

    @property
    def action(self) -> str:
        return "product_activated"

    @property
    def entity_type(self) -> str:
        return "product"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.product_id


@dataclass(frozen=True, kw_only=True)
class ProductDeactivated(CatalogAuditEvent):
    product_id: uuid.UUID

    @property
    def action(self) -> str:
        return "product_deactivated"

    @property
    def entity_type(self) -> str:
        return "product"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.product_id


@dataclass(frozen=True, kw_only=True)
class CategoryCreated(CatalogAuditEvent):
    category_id: uuid.UUID
    name: str
    slug: str
    parent_id: uuid.UUID | None

    @property
    def action(self) -> str:
        return "category_created"

    @property
    def entity_type(self) -> str:
        return "category"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.category_id

    def payload(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "slug": self.slug,
            "parent_id": str(self.parent_id) if self.parent_id else None,
        }


@dataclass(frozen=True, kw_only=True)
class VariantCreated(CatalogAuditEvent):
    variant_id: uuid.UUID
    product_id: uuid.UUID
    sku: str
    price: float

    @property
    def action(self) -> str:
        return "variant_created"

    @property
    def entity_type(self) -> str:
        return "product_variant"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.variant_id

    def payload(self) -> dict[str, Any]:
        return {
            "product_id": str(self.product_id),
            "sku": self.sku,
            "price": self.price,
        }


@dataclass(frozen=True, kw_only=True)
class VariantPriceChanged(CatalogAuditEvent):
    variant_id: uuid.UUID
    old_price: float
    new_price: float

    @property
    def action(self) -> str:
        return "variant_price_changed"

    @property
    def entity_type(self) -> str:
        return "product_variant"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.variant_id

    def payload(self) -> dict[str, Any]:
        return {"old_price": self.old_price, "new_price": self.new_price}


@dataclass(frozen=True, kw_only=True)
class VariantAttributesChanged(CatalogAuditEvent):
    variant_id: uuid.UUID
    attributes: dict[str, Any]

    @property
    def action(self) -> str:
        return "variant_attributes_changed"

    @property
    def entity_type(self) -> str:
        return "product_variant"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.variant_id

    def payload(self) -> dict[str, Any]:
        return {"attributes": self.attributes}


@dataclass(frozen=True, kw_only=True)
class VariantSoftDeleted(CatalogAuditEvent):
    variant_id: uuid.UUID

    @property
    def action(self) -> str:
        return "variant_soft_deleted"

    @property
    def entity_type(self) -> str:
        return "product_variant"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.variant_id


@dataclass(frozen=True, kw_only=True)
class InventoryRestocked(CatalogAuditEvent):
    inventory_id: uuid.UUID
    variant_id: uuid.UUID
    quantity_added: int
    quantity_on_hand: int

    @property
    def action(self) -> str:
        return "inventory_restocked"

    @property
    def entity_type(self) -> str:
        return "inventory"

    @property
    def entity_id(self) -> uuid.UUID:
        return self.inventory_id

    def payload(self) -> dict[str, Any]:
        return {
            "variant_id": str(self.variant_id),
            "quantity_added": self.quantity_added,
            "quantity_on_hand": self.quantity_on_hand,
        }
