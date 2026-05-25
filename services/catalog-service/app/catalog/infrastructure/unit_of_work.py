from collections.abc import Callable
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.audit.domain.events import CatalogAuditEvent
from app.audit.domain.ports.audit_logger import AuditLogger
from app.catalog.domain.events import CatalogEvent
from app.catalog.infrastructure.repositories.sqlalchemy_category_repository import (
    SqlAlchemyCategoryRepository,
)
from app.catalog.infrastructure.repositories.sqlalchemy_product_repository import (
    SqlAlchemyProductRepository,
)


class SqlAlchemyCatalogUnitOfWork:
    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        dispatchers: list[Any] | None = None,
        audit_logger_factory: Callable[[AsyncSession], AuditLogger] | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._dispatchers = dispatchers or []
        self._audit_logger_factory = audit_logger_factory
        self._events: list[CatalogEvent] = []
        self._audit_events: list[CatalogAuditEvent] = []

    async def __aenter__(self) -> "SqlAlchemyCatalogUnitOfWork":
        self._session = self._session_factory()
        self.products = SqlAlchemyProductRepository(self._session)
        self.categories = SqlAlchemyCategoryRepository(self._session)
        self._events = []
        self._audit_events = []
        return self

    async def __aexit__(self, exc_type: object, *args: object) -> None:
        if exc_type:
            await self.rollback()
        await self._session.close()

    async def commit(self) -> None:
        audit_events = self.collect_audit_events()
        if self._audit_logger_factory and audit_events:
            await self._audit_logger_factory(self._session).log_many(audit_events)
        await self._session.commit()
        events = self.collect_events()
        for dispatcher in self._dispatchers:
            await dispatcher.dispatch(events)

    async def rollback(self) -> None:
        await self._session.rollback()
        self._events.clear()
        self._audit_events.clear()

    def add_event(self, event: CatalogEvent) -> None:
        self._events.append(event)

    def add_audit_event(self, event: CatalogAuditEvent) -> None:
        self._audit_events.append(event)

    def collect_events(self) -> list[CatalogEvent]:
        events = self._events[:]
        self._events.clear()
        return events

    def collect_audit_events(self) -> list[CatalogAuditEvent]:
        events = self._audit_events[:]
        self._audit_events.clear()
        return events
