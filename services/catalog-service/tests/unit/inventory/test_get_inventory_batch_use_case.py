import uuid

from app.inventory.application.use_cases.get_inventory_batch import (
    GetInventoryBatchUseCase,
)
from tests.unit.inventory.fakes import (
    FakeInventoryRepository,
    FakeInventoryUnitOfWork,
    make_inventory,
)


async def test_returns_available_for_each_variant():
    vid1, vid2 = uuid.uuid4(), uuid.uuid4()
    inv1 = make_inventory(variant_id=vid1, on_hand=10, reserved=3)
    inv2 = make_inventory(variant_id=vid2, on_hand=5, reserved=5)
    uow = FakeInventoryUnitOfWork(
        inventory=FakeInventoryRepository(records=[inv1, inv2])
    )
    use_case = GetInventoryBatchUseCase(uow_factory=lambda: uow)

    results = await use_case.execute([vid1, vid2])

    by_variant = {r.variant_id: r for r in results}
    assert by_variant[vid1].available == 7
    assert by_variant[vid2].available == 0


async def test_returns_empty_for_no_ids():
    uow = FakeInventoryUnitOfWork()
    use_case = GetInventoryBatchUseCase(uow_factory=lambda: uow)

    results = await use_case.execute([])

    assert results == []


async def test_skips_missing_variants():
    vid = uuid.uuid4()
    inv = make_inventory(variant_id=vid, on_hand=8, reserved=0)
    uow = FakeInventoryUnitOfWork(inventory=FakeInventoryRepository(records=[inv]))
    use_case = GetInventoryBatchUseCase(uow_factory=lambda: uow)

    results = await use_case.execute([vid, uuid.uuid4()])

    assert len(results) == 1
    assert results[0].variant_id == vid
