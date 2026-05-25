from app.audit.domain.events import (
    VariantAttributesChanged,
    VariantPriceChanged,
    VariantSoftDeleted,
)
from app.catalog.application.dto import UpdateVariantInput
from app.catalog.domain.entities.product import ProductVariant
from app.catalog.domain.exceptions import (
    ProductNotFoundError,
    ProductVariantNotFoundError,
)
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class UpdateVariantUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: UpdateVariantInput) -> ProductVariant:
        async with self._uow_factory() as uow:
            variant = await uow.products.find_variant_by_id(input.variant_id)
            if not variant:
                raise ProductVariantNotFoundError()

            product = await uow.products.find_by_id(variant.product_id)
            if not product:
                raise ProductNotFoundError()

            if input.price is not None:
                old_price = variant.price
                event = product.update_variant_price(
                    variant, input.price, actor_id=input.actor.actor_id
                )
                if event:
                    uow.add_event(event)
                if input.price != old_price:
                    uow.add_audit_event(
                        VariantPriceChanged(
                            actor=input.actor,
                            variant_id=variant.id,
                            old_price=old_price,
                            new_price=input.price,
                        )
                    )

            if input.attributes is not None and input.attributes != variant.attributes:
                variant.attributes = input.attributes
                uow.add_audit_event(
                    VariantAttributesChanged(
                        actor=input.actor,
                        variant_id=variant.id,
                        attributes=input.attributes,
                    )
                )
            if input.is_active is not None and input.is_active != variant.is_active:
                if variant.is_active and not input.is_active:
                    uow.add_audit_event(
                        VariantSoftDeleted(actor=input.actor, variant_id=variant.id)
                    )
                variant.is_active = input.is_active

            await uow.products.save_variant(variant)
            await uow.commit()

        return variant
