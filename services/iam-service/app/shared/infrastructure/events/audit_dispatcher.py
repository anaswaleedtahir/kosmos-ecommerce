from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.domain.events import DomainEvent
from app.shared.domain.ports.audit_logger import AuditLogger
from app.shared.infrastructure.events.audit_handler import AuditLoggingHandler


class PostCommitAuditDispatcher:
    """Writes audit log entries after the business commit and flushes a second
    transaction (ADR-003: audit post-commit, separate from the business write)."""

    def __init__(self, audit_logger: AuditLogger, session: AsyncSession) -> None:
        self._handler = AuditLoggingHandler(audit_logger)
        self._session = session

    async def dispatch(self, events: list[DomainEvent]) -> None:
        if not events:
            return
        await self._handler.handle_many(events)
        await self._session.commit()
