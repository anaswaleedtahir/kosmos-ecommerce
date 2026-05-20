from app.catalog.application.dto import (
    CreateVariantInput,
    ProductVariantResult,
    variant_to_result,
)
from app.catalog.domain.exceptions import ProductNotFoundError, SkuAlreadyExistsError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class CreateVariantUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: CreateVariantInput) -> ProductVariantResult:
        async with self._uow_factory() as uow:
            if not await uow.products.find_by_id(input.product_id):
                raise ProductNotFoundError()

            if await uow.products.sku_exists(input.sku):
                raise SkuAlreadyExistsError(input.sku)

            variant = await uow.products.add_variant(
                product_id=input.product_id,
                sku=input.sku,
                price=input.price,
                attributes=input.attributes,
            )
            await uow.commit()

        return variant_to_result(variant)
