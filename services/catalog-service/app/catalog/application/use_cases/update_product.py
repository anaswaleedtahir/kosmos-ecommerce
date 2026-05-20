from app.catalog.application.dto import (
    ProductResult,
    UpdateProductInput,
    product_to_result,
)
from app.catalog.domain.exceptions import CategoryNotFoundError, ProductNotFoundError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class UpdateProductUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: UpdateProductInput) -> ProductResult:
        async with self._uow_factory() as uow:
            product = await uow.products.find_by_id(input.product_id)
            if not product:
                raise ProductNotFoundError()

            if input.category_id and input.category_id != product.category_id:
                if not await uow.categories.find_by_id(input.category_id):
                    raise CategoryNotFoundError()
                product.category_id = input.category_id

            if input.name is not None:
                product.name = input.name
            if input.description is not None:
                product.description = input.description
            if input.storefront_metadata is not None:
                product.storefront_metadata = input.storefront_metadata

            await uow.products.save(product)
            await uow.commit()

        return product_to_result(product)
