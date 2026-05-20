import uuid
from dataclasses import dataclass, field


@dataclass
class CreateProductInput:
    name: str
    description: str | None
    category_id: uuid.UUID
    actor_id: uuid.UUID
    slug: str = ""
    storefront_metadata: dict = field(default_factory=dict)


@dataclass
class UpdateProductInput:
    product_id: uuid.UUID
    name: str | None
    description: str | None
    category_id: uuid.UUID | None
    actor_id: uuid.UUID
    storefront_metadata: dict | None = None


@dataclass
class SetProductStatusInput:
    product_id: uuid.UUID
    active: bool
    actor_id: uuid.UUID


@dataclass
class CreateVariantInput:
    product_id: uuid.UUID
    sku: str
    price: float
    attributes: dict
    actor_id: uuid.UUID


@dataclass
class UpdateVariantInput:
    variant_id: uuid.UUID
    price: float | None
    attributes: dict | None
    is_active: bool | None
    actor_id: uuid.UUID


@dataclass
class CreateCategoryInput:
    name: str
    slug: str
    parent_id: uuid.UUID | None
    actor_id: uuid.UUID
