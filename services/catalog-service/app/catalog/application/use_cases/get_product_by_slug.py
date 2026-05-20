from app.catalog.application.dto import ProductResult, product_to_result
from app.catalog.domain.exceptions import ProductNotFoundError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class GetProductBySlugUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, slug: str) -> ProductResult:
        async with self._uow_factory() as uow:
            product = await uow.products.find_by_slug(slug)
            if not product:
                raise ProductNotFoundError()

        return product_to_result(product)
