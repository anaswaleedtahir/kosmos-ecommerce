from typing import Callable, Protocol

from app.audit.domain.events import CatalogAuditEvent
from app.catalog.domain.events import CatalogEvent
from app.catalog.domain.ports.category_repository import CategoryRepository
from app.catalog.domain.ports.product_repository import ProductRepository


class CatalogUnitOfWork(Protocol):
    products: ProductRepository
    categories: CategoryRepository

    async def __aenter__(self) -> "CatalogUnitOfWork": ...

    async def __aexit__(self, *args: object) -> None: ...

    async def commit(self) -> None: ...

    async def rollback(self) -> None: ...

    def add_event(self, event: CatalogEvent) -> None: ...

    def add_audit_event(self, event: CatalogAuditEvent) -> None: ...

    def collect_events(self) -> list[CatalogEvent]: ...

    def collect_audit_events(self) -> list[CatalogAuditEvent]: ...


CatalogUnitOfWorkFactory = Callable[[], CatalogUnitOfWork]
