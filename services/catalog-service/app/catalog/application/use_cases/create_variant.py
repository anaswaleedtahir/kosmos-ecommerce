from app.audit.domain.events import VariantCreated
from app.catalog.application.dto import CreateVariantInput
from app.catalog.domain.entities.product import ProductVariant
from app.catalog.domain.exceptions import ProductNotFoundError, SkuAlreadyExistsError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class CreateVariantUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: CreateVariantInput) -> ProductVariant:
        async with self._uow_factory() as uow:
            product = await uow.products.find_by_id(input.product_id)
            if not product:
                raise ProductNotFoundError()

            if await uow.products.sku_exists(input.sku):
                raise SkuAlreadyExistsError(input.sku)

            variant = await uow.products.add_variant(
                product_id=input.product_id,
                sku=input.sku,
                price=input.price,
                attributes=input.attributes,
            )
            product.add_variant(variant)
            await uow.products.save(product)
            uow.add_audit_event(
                VariantCreated(
                    actor=input.actor,
                    variant_id=variant.id,
                    product_id=variant.product_id,
                    sku=variant.sku,
                    price=variant.price,
                )
            )
            await uow.commit()

        return variant
