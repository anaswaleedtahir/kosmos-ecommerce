from app.catalog.application.dto import ProductResult, product_to_result
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class ListProductsUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, limit: int = 20, offset: int = 0) -> list[ProductResult]:
        async with self._uow_factory() as uow:
            products = await uow.products.list_active(limit=limit, offset=offset)

        return [product_to_result(p) for p in products]
