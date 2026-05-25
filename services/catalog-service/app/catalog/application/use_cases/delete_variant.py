import uuid

from shared.actor import ActorContext

from app.audit.domain.events import VariantSoftDeleted
from app.catalog.domain.exceptions import ProductVariantNotFoundError
from app.catalog.domain.ports.unit_of_work import CatalogUnitOfWorkFactory


class DeleteVariantUseCase:
    def __init__(self, uow_factory: CatalogUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, variant_id: uuid.UUID, actor: ActorContext) -> None:
        async with self._uow_factory() as uow:
            variant = await uow.products.find_variant_by_id(variant_id)
            if not variant:
                raise ProductVariantNotFoundError()
            product = await uow.products.find_by_id(variant.product_id)
            if not product:
                raise ProductVariantNotFoundError()
            product_variant = product.find_variant(variant_id)
            if not product_variant:
                raise ProductVariantNotFoundError()
            if product.soft_delete_variant(product_variant):
                uow.add_audit_event(
                    VariantSoftDeleted(actor=actor, variant_id=variant_id)
                )
            await uow.products.save(product)
            await uow.commit()
