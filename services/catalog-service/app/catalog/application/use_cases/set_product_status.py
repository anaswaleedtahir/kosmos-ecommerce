from app.catalog.application.dto import SetProductStatusInput
from app.catalog.domain.entities.product import Product
from app.catalog.domain.events import ProductPublished
from app.catalog.domain.exceptions import ProductNotFoundError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class SetProductStatusUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: SetProductStatusInput) -> Product:
        async with self._uow_factory() as uow:
            product = await uow.products.find_by_id(input.product_id)
            if not product:
                raise ProductNotFoundError()

            if input.active:
                newly_activated = product.activate()
                if newly_activated:
                    uow.add_event(
                        ProductPublished(
                            actor_id=input.actor.actor_id,
                            product_id=product.id,
                            name=product.name,
                            category_id=product.category_id,
                        )
                    )
            else:
                product.deactivate()

            await uow.products.save(product)
            await uow.commit()

        return product
