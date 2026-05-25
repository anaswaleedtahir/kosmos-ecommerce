from typing import Callable, Protocol

from app.audit.domain.events import CatalogAuditEvent
from app.inventory.domain.events import InventoryEvent
from app.inventory.domain.ports.inventory_repository import InventoryRepository


class InventoryUnitOfWork(Protocol):
    inventory: InventoryRepository

    async def __aenter__(self) -> "InventoryUnitOfWork": ...

    async def __aexit__(self, *args: object) -> None: ...

    async def commit(self) -> None: ...

    async def rollback(self) -> None: ...

    def add_event(self, event: InventoryEvent) -> None: ...

    def add_audit_event(self, event: CatalogAuditEvent) -> None: ...

    def collect_events(self) -> list[InventoryEvent]: ...

    def collect_audit_events(self) -> list[CatalogAuditEvent]: ...


InventoryUnitOfWorkFactory = Callable[[], InventoryUnitOfWork]
