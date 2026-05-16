import uuid

import pytest

from app.inventory.application.dto import RestockInput
from app.inventory.application.use_cases.restock import RestockUseCase
from app.inventory.domain.events import InventoryRestocked
from tests.unit.inventory.fakes import (
    FakeInventoryRepository,
    FakeInventoryUnitOfWork,
    make_inventory,
)


@pytest.fixture
def depleted_inventory():
    return make_inventory(on_hand=0, reserved=0)


async def test_restock_emits_restocked_when_inventory_was_depleted(depleted_inventory):
    uow = FakeInventoryUnitOfWork(
        inventory=FakeInventoryRepository(records=[depleted_inventory])
    )
    use_case = RestockUseCase(uow_factory=lambda: uow)

    await use_case.execute(
        RestockInput(
            variant_id=depleted_inventory.variant_id,
            quantity=10,
            actor_id=uuid.uuid4(),
        )
    )

    assert uow.committed
    assert len(uow.emitted_events) == 1
    assert isinstance(uow.emitted_events[0], InventoryRestocked)
    assert uow.emitted_events[0].quantity_on_hand == 10


async def test_restock_does_not_emit_when_already_in_stock():
    in_stock = make_inventory(on_hand=5, reserved=0)
    uow = FakeInventoryUnitOfWork(inventory=FakeInventoryRepository(records=[in_stock]))
    use_case = RestockUseCase(uow_factory=lambda: uow)

    await use_case.execute(
        RestockInput(
            variant_id=in_stock.variant_id,
            quantity=3,
            actor_id=uuid.uuid4(),
        )
    )

    assert uow.emitted_events == []


async def test_restock_creates_inventory_when_missing():
    uow = FakeInventoryUnitOfWork()
    variant_id = uuid.uuid4()
    use_case = RestockUseCase(uow_factory=lambda: uow)

    result = await use_case.execute(
        RestockInput(variant_id=variant_id, quantity=4, actor_id=uuid.uuid4())
    )

    assert result.quantity_on_hand == 4
    assert len(uow.emitted_events) == 1
    assert isinstance(uow.emitted_events[0], InventoryRestocked)
