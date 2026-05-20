from app.catalog.application.dto import (
    CreateProductInput,
    ProductResult,
    product_to_result,
)
from app.catalog.domain.exceptions import (
    CategoryNotFoundError,
    ProductSlugAlreadyExistsError,
)
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class CreateProductUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: CreateProductInput) -> ProductResult:
        async with self._uow_factory() as uow:
            if not await uow.categories.find_by_id(input.category_id):
                raise CategoryNotFoundError()

            if await uow.products.slug_exists(input.slug):
                raise ProductSlugAlreadyExistsError()

            product = await uow.products.add(
                name=input.name,
                description=input.description,
                category_id=input.category_id,
                created_by=input.actor_id,
                slug=input.slug,
                storefront_metadata=input.storefront_metadata,
            )
            await uow.commit()

        return product_to_result(product)
