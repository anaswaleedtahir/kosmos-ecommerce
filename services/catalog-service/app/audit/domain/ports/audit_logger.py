from typing import Protocol

from app.audit.domain.events import CatalogAuditEvent


class AuditLogger(Protocol):
    async def log_many(self, events: list[CatalogAuditEvent]) -> None: ...
