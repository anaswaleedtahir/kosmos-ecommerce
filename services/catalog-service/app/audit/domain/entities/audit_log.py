import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class AuditLog:
    id: uuid.UUID
    actor_id: uuid.UUID | None
    actor_username: str | None
    action: str
    entity_type: str
    entity_id: uuid.UUID
    payload: dict[str, Any] = field(default_factory=dict)
    request_id: str = "-"
    created_at: datetime | None = None
