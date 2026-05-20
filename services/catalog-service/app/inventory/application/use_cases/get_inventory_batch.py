import uuid

from app.inventory.application.dto import InventoryResult
from app.inventory.domain.ports.unit_of_work import InventoryUnitOfWorkFactory


class GetInventoryBatchUseCase:
    def __init__(self, uow_factory: InventoryUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, variant_ids: list[uuid.UUID]) -> list[InventoryResult]:
        async with self._uow_factory() as uow:
            records = await uow.inventory.find_by_variant_ids(variant_ids)

        return [
            InventoryResult(
                id=inv.id,
                variant_id=inv.variant_id,
                quantity_on_hand=inv.quantity_on_hand,
                quantity_reserved=inv.quantity_reserved,
                available=inv.available,
                updated_at=inv.updated_at,
            )
            for inv in records
        ]
