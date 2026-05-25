import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

from app.catalog.domain.events import CatalogEvent, ProductPriceChanged


class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


@dataclass
class ProductVariant:
    id: uuid.UUID
    product_id: uuid.UUID
    sku: str
    price: float
    attributes: dict = field(default_factory=dict)
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    @property
    def is_default(self) -> bool:
        return bool(self.attributes.get("is_default", False))

    def set_default(self, is_default: bool) -> None:
        self.attributes = {**self.attributes, "is_default": is_default}


@dataclass
class Product:
    id: uuid.UUID
    name: str
    description: str | None
    category_id: uuid.UUID
    status: ProductStatus
    created_by: uuid.UUID
    slug: str = ""
    storefront_metadata: dict = field(default_factory=dict)
    variants: list[ProductVariant] = field(default_factory=list)
    created_at: datetime | None = None
    updated_at: datetime | None = None

    def activate(self) -> bool:
        was_inactive = self.status == ProductStatus.INACTIVE
        self.status = ProductStatus.ACTIVE
        return was_inactive

    def deactivate(self) -> None:
        self.status = ProductStatus.INACTIVE

    def find_variant(self, variant_id: uuid.UUID) -> ProductVariant | None:
        return next(
            (variant for variant in self.variants if variant.id == variant_id), None
        )

    def add_variant(self, variant: ProductVariant) -> None:
        if variant.product_id != self.id:
            raise ValueError("Variant does not belong to product")

        self.variants.append(variant)
        if variant.is_default or not self._has_active_default(excluding=variant.id):
            self._make_default(variant)

    def update_variant_price(
        self,
        variant: "ProductVariant",
        new_price: float,
        *,
        actor_id: uuid.UUID | None = None,
    ) -> CatalogEvent | None:
        if new_price == variant.price:
            return None
        old_price = variant.price
        variant.price = new_price
        if self.status == ProductStatus.ACTIVE:
            return ProductPriceChanged(
                actor_id=actor_id,
                product_id=self.id,
                variant_id=variant.id,
                sku=variant.sku,
                old_price=old_price,
                new_price=new_price,
            )
        return None

    def update_variant_attributes(
        self,
        variant: ProductVariant,
        attributes: dict,
    ) -> bool:
        if attributes == variant.attributes:
            return False
        variant.attributes = attributes
        if variant.is_active and variant.is_default:
            self._make_default(variant)
        elif not self._has_active_default():
            self._select_fallback_default()
        return True

    def set_variant_active(self, variant: ProductVariant, is_active: bool) -> bool:
        if variant.is_active == is_active:
            return False
        was_default = variant.is_default
        variant.is_active = is_active
        if not is_active:
            variant.set_default(False)
            if was_default:
                self._select_fallback_default()
        elif not self._has_active_default():
            self._make_default(variant)
        return True

    def soft_delete_variant(self, variant: ProductVariant) -> bool:
        return self.set_variant_active(variant, False)

    def _has_active_default(self, *, excluding: uuid.UUID | None = None) -> bool:
        return any(
            variant.is_active
            and variant.is_default
            and (excluding is None or variant.id != excluding)
            for variant in self.variants
        )

    def _make_default(self, default_variant: ProductVariant) -> None:
        for variant in self.variants:
            variant.set_default(variant.id == default_variant.id and variant.is_active)

    def _select_fallback_default(self) -> None:
        fallback = next(
            (variant for variant in self.variants if variant.is_active), None
        )
        if fallback:
            self._make_default(fallback)
