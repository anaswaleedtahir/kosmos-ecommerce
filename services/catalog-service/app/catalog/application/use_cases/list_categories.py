from app.catalog.domain.entities.category import Category
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class ListCategoriesUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self) -> list[Category]:
        async with self._uow_factory() as uow:
            return await uow.categories.list_all()
