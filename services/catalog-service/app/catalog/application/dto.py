import uuid
from dataclasses import dataclass, field
from datetime import datetime

from app.catalog.domain.entities.product import Product, ProductStatus, ProductVariant


@dataclass
class CreateProductInput:
    name: str
    description: str | None
    category_id: uuid.UUID
    actor_id: uuid.UUID
    slug: str = ""
    storefront_metadata: dict = field(default_factory=dict)


@dataclass
class ProductVariantResult:
    id: uuid.UUID
    sku: str
    price: float
    attributes: dict
    is_active: bool


@dataclass
class ProductResult:
    id: uuid.UUID
    name: str
    description: str | None
    category_id: uuid.UUID
    status: ProductStatus
    created_by: uuid.UUID
    slug: str = ""
    storefront_metadata: dict = field(default_factory=dict)
    variants: list[ProductVariantResult] = field(default_factory=list)
    created_at: datetime | None = None
    updated_at: datetime | None = None


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


def variant_to_result(v: ProductVariant) -> "ProductVariantResult":
    return ProductVariantResult(
        id=v.id,
        sku=v.sku,
        price=v.price,
        attributes=v.attributes,
        is_active=v.is_active,
    )


def product_to_result(p: Product) -> "ProductResult":
    return ProductResult(
        id=p.id,
        name=p.name,
        description=p.description,
        category_id=p.category_id,
        status=p.status,
        created_by=p.created_by,
        slug=p.slug,
        storefront_metadata=p.storefront_metadata,
        variants=[variant_to_result(v) for v in p.variants],
        created_at=p.created_at,
        updated_at=p.updated_at,
    )


@dataclass
class CreateCategoryInput:
    name: str
    slug: str
    parent_id: uuid.UUID | None
    actor_id: uuid.UUID


@dataclass
class CategoryResult:
    id: uuid.UUID
    name: str
    slug: str
    parent_id: uuid.UUID | None
    created_at: datetime | None = None
