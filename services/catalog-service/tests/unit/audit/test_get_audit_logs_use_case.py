import uuid
from datetime import datetime, timezone

from app.audit.application.dto import GetAuditLogsInput
from app.audit.application.use_cases.get_audit_logs import GetAuditLogsUseCase
from app.audit.domain.entities.audit_log import AuditLog


class FakeAuditLogReader:
    def __init__(self, items: list[AuditLog]) -> None:
        self.items = items
        self.page: int | None = None
        self.page_size: int | None = None

    async def list_paginated(self, *, page: int, page_size: int) -> list[AuditLog]:
        self.page = page
        self.page_size = page_size
        return self.items


async def test_get_audit_logs_returns_reader_items():
    item = AuditLog(
        id=uuid.uuid4(),
        actor_id=uuid.uuid4(),
        actor_username="admin@example.test",
        action="product_created",
        entity_type="product",
        entity_id=uuid.uuid4(),
        payload={"name": "Noir"},
        request_id="req-1",
        created_at=datetime.now(timezone.utc),
    )
    reader = FakeAuditLogReader(items=[item])
    use_case = GetAuditLogsUseCase(reader=reader)

    result = await use_case.execute(GetAuditLogsInput(page=2, page_size=10))

    assert result.items == [item]
    assert reader.page == 2
    assert reader.page_size == 10
