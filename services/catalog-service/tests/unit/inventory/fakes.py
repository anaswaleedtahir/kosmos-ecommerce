"""In-memory fakes for inventory ports — use in unit tests."""

import uuid
from datetime import datetime, timezone
from typing import Callable

from app.inventory.domain.entities.inventory import Inventory
from app.inventory.domain.events import InventoryEvent


def make_inventory(
    variant_id: uuid.UUID | None = None,
    on_hand: int = 10,
    reserved: int = 0,
) -> Inventory:
    return Inventory(
        id=uuid.uuid4(),
        variant_id=variant_id or uuid.uuid4(),
        quantity_on_hand=on_hand,
        quantity_reserved=reserved,
        updated_at=datetime.now(timezone.utc),
    )


def _noop_track(_: Inventory) -> None:
    pass


class FakeInventoryRepository:
    def __init__(
        self,
        records: list[Inventory] | None = None,
        on_save: Callable[[Inventory], None] = _noop_track,
    ) -> None:
        self._store: dict[uuid.UUID, Inventory] = {
            inv.variant_id: inv for inv in (records or [])
        }
        self._on_save = on_save

    async def find_by_variant_id(self, variant_id: uuid.UUID) -> Inventory | None:
        return self._store.get(variant_id)

    async def find_by_variant_ids(
        self, variant_ids: list[uuid.UUID]
    ) -> list[Inventory]:
        return [self._store[vid] for vid in variant_ids if vid in self._store]

    async def add(self, *, variant_id: uuid.UUID) -> Inventory:
        inv = make_inventory(variant_id=variant_id, on_hand=0, reserved=0)
        self._store[variant_id] = inv
        return inv

    async def save(self, inventory: Inventory) -> None:
        self._store[inventory.variant_id] = inventory
        self._on_save(inventory)


class FakeInventoryUnitOfWork:
    def __init__(self, inventory: FakeInventoryRepository | None = None) -> None:
        self.inventory = inventory or FakeInventoryRepository()
        self.inventory._on_save = self._track
        self.committed = False
        self._events: list[InventoryEvent] = []
        self._tracked: list[Inventory] = []
        self.emitted_events: list[InventoryEvent] = []

    async def __aenter__(self) -> "FakeInventoryUnitOfWork":
        self._events = []
        self._tracked = []
        return self

    async def __aexit__(self, exc_type: object, *args: object) -> None:
        if exc_type:
            for entity in self._tracked:
                entity.collect_events()
            self._tracked.clear()
            self._events.clear()

    async def commit(self) -> None:
        for entity in self._tracked:
            self._events.extend(entity.collect_events())
        self._tracked.clear()
        self.committed = True
        self.emitted_events.extend(self._events)
        self._events.clear()

    async def rollback(self) -> None:
        for entity in self._tracked:
            entity.collect_events()
        self._tracked.clear()
        self._events.clear()

    def add_event(self, event: InventoryEvent) -> None:
        self._events.append(event)

    def collect_events(self) -> list[InventoryEvent]:
        events = self._events[:]
        self._events.clear()
        return events

    def _track(self, entity: Inventory) -> None:
        if not any(e is entity for e in self._tracked):
            self._tracked.append(entity)
