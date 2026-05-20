from app.catalog.domain.entities.product import Product
from app.catalog.domain.exceptions import ProductNotFoundError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class GetProductBySlugUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, slug: str) -> Product:
        async with self._uow_factory() as uow:
            product = await uow.products.find_by_slug(slug)
            if not product:
                raise ProductNotFoundError()

        return product
