from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.domain.events import CatalogAuditEvent
from app.audit.infrastructure.orm.audit_log import AuditLog


class SqlAlchemyAuditLogger:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def log_many(self, events: list[CatalogAuditEvent]) -> None:
        for event in events:
            context = event.to_audit_context()
            self._session.add(
                AuditLog(
                    actor_id=context.actor_id,
                    actor_username=context.actor_username,
                    action=context.action,
                    entity_type=context.entity_type,
                    entity_id=context.entity_id,
                    payload=context.payload,
                    request_id=context.request_id,
                    created_at=context.occurred_at,
                )
            )
