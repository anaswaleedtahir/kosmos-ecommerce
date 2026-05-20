from app.catalog.domain.entities.product import Product
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class ListProductsUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, limit: int = 20, offset: int = 0) -> list[Product]:
        async with self._uow_factory() as uow:
            return await uow.products.list_active(limit=limit, offset=offset)
