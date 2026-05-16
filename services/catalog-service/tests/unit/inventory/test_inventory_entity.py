import uuid

import pytest

from app.inventory.domain.events import InventoryDepleted, InventoryRestocked
from app.inventory.domain.exceptions import InsufficientStockError
from tests.unit.inventory.fakes import make_inventory


def test_commit_reservation_decrements_both_quantities():
    inv = make_inventory(on_hand=10, reserved=3)

    inv.commit_reservation(3)

    assert inv.quantity_on_hand == 7
    assert inv.quantity_reserved == 0


def test_commit_reservation_clamps_to_reserved():
    inv = make_inventory(on_hand=10, reserved=2)

    inv.commit_reservation(5)

    assert inv.quantity_reserved == 0
    assert inv.quantity_on_hand == 8


def test_commit_reservation_emits_depleted_when_on_hand_hits_zero():
    inv = make_inventory(on_hand=3, reserved=3)
    actor_id = uuid.uuid4()

    inv.commit_reservation(3, actor_id=actor_id)

    events = inv.collect_events()
    assert len(events) == 1
    assert isinstance(events[0], InventoryDepleted)
    assert events[0].variant_id == inv.variant_id
    assert events[0].actor_id == actor_id


def test_commit_reservation_does_not_emit_when_on_hand_remains_positive():
    inv = make_inventory(on_hand=10, reserved=3)

    inv.commit_reservation(3)

    assert inv.collect_events() == []


def test_commit_reservation_does_not_double_emit_when_already_at_zero():
    inv = make_inventory(on_hand=0, reserved=0)

    inv.commit_reservation(5)

    assert inv.collect_events() == []


def test_collect_events_drains_buffer():
    inv = make_inventory(on_hand=1, reserved=1)
    inv.commit_reservation(1)

    first = inv.collect_events()
    second = inv.collect_events()

    assert len(first) == 1
    assert second == []


def test_reserve_does_not_emit_depleted_even_when_available_hits_zero():
    inv = make_inventory(on_hand=5, reserved=0)

    inv.reserve(5)

    assert inv.available == 0
    assert inv.quantity_on_hand == 5
    assert inv.collect_events() == []


def test_reserve_raises_typed_insufficient_stock_error():
    inv = make_inventory(on_hand=5, reserved=2)

    with pytest.raises(InsufficientStockError) as exc_info:
        inv.reserve(4)

    assert exc_info.value.available == 3
    assert exc_info.value.requested == 4


def test_restock_rejects_non_positive():
    inv = make_inventory(on_hand=0, reserved=0)

    with pytest.raises(ValueError):
        inv.restock(0)


def test_restock_emits_restocked_when_rising_from_zero():
    inv = make_inventory(on_hand=0, reserved=0)
    actor_id = uuid.uuid4()

    inv.restock(7, actor_id=actor_id)

    events = inv.collect_events()
    assert len(events) == 1
    assert isinstance(events[0], InventoryRestocked)
    assert events[0].quantity_added == 7
    assert events[0].quantity_on_hand == 7
    assert events[0].actor_id == actor_id
    assert events[0].variant_id == inv.variant_id


def test_restock_does_not_emit_when_already_in_stock():
    inv = make_inventory(on_hand=5, reserved=0)

    inv.restock(3)

    assert inv.collect_events() == []
