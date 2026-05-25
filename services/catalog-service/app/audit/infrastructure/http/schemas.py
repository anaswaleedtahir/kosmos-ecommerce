import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    actor_id: uuid.UUID | None
    actor_username: str | None
    action: str
    entity_type: str
    entity_id: uuid.UUID
    payload: dict[str, Any]
    request_id: str
    created_at: datetime | None
