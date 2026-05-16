from app.inventory.application.dto import InventoryResult, RestockInput
from app.inventory.domain.ports.unit_of_work import InventoryUnitOfWorkFactory


class RestockUseCase:
    def __init__(self, uow_factory: InventoryUnitOfWorkFactory) -> None:
        self._uow_factory = uow_factory

    async def execute(self, input: RestockInput) -> InventoryResult:
        async with self._uow_factory() as uow:
            inv = await uow.inventory.find_by_variant_id(input.variant_id)
            if not inv:
                inv = await uow.inventory.add(variant_id=input.variant_id)

            inv.restock(input.quantity, actor_id=input.actor_id)
            await uow.inventory.save(inv)
            await uow.commit()

        return InventoryResult(
            id=inv.id,
            variant_id=inv.variant_id,
            quantity_on_hand=inv.quantity_on_hand,
            quantity_reserved=inv.quantity_reserved,
            available=inv.available,
            updated_at=inv.updated_at,
        )
