from typing import Any

from app.audit.domain.events import ProductMetadataChanged
from app.catalog.application.dto import UpdateProductInput
from app.catalog.domain.entities.product import Product
from app.catalog.domain.exceptions import CategoryNotFoundError, ProductNotFoundError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class UpdateProductUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: UpdateProductInput) -> Product:
        async with self._uow_factory() as uow:
            product = await uow.products.find_by_id(input.product_id)
            if not product:
                raise ProductNotFoundError()

            changes: dict[str, dict[str, Any]] = {}

            if input.category_id and input.category_id != product.category_id:
                if not await uow.categories.find_by_id(input.category_id):
                    raise CategoryNotFoundError()
                changes["category_id"] = {
                    "old": str(product.category_id),
                    "new": str(input.category_id),
                }
                product.category_id = input.category_id

            if input.name is not None and input.name != product.name:
                changes["name"] = {"old": product.name, "new": input.name}
                product.name = input.name
            if (
                input.description is not None
                and input.description != product.description
            ):
                changes["description"] = {
                    "old": product.description,
                    "new": input.description,
                }
                product.description = input.description
            if (
                input.storefront_metadata is not None
                and input.storefront_metadata != product.storefront_metadata
            ):
                changes["storefront_metadata"] = {
                    "old": product.storefront_metadata,
                    "new": input.storefront_metadata,
                }
                product.storefront_metadata = input.storefront_metadata

            await uow.products.save(product)
            if changes:
                uow.add_audit_event(
                    ProductMetadataChanged(
                        actor=input.actor,
                        product_id=product.id,
                        changes=changes,
                    )
                )
            await uow.commit()

        return product
