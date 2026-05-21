from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.inventory.domain.entities.inventory import Inventory
from app.inventory.domain.events import InventoryEvent
from app.inventory.infrastructure.repositories.sqlalchemy_inventory_repository import (
    SqlAlchemyInventoryRepository,
)


class SqlAlchemyInventoryUnitOfWork:
    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        dispatchers: list[Any] | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._dispatchers = dispatchers or []
        self._events: list[InventoryEvent] = []
        self._tracked: list[Inventory] = []

    async def __aenter__(self) -> "SqlAlchemyInventoryUnitOfWork":
        self._session = self._session_factory()
        self.inventory = SqlAlchemyInventoryRepository(
            self._session, on_save=self._track
        )
        self._events = []
        self._tracked = []
        return self

    async def __aexit__(self, exc_type: object, *args: object) -> None:
        if exc_type:
            await self.rollback()
        await self._session.close()

    async def commit(self) -> None:
        await self._session.commit()
        for entity in self._tracked:
            self._events.extend(entity.collect_events())
        self._tracked.clear()
        events = self.collect_events()
        for dispatcher in self._dispatchers:
            await dispatcher.dispatch(events)

    async def rollback(self) -> None:
        await self._session.rollback()
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
