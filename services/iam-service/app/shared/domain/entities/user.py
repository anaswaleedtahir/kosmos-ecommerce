import uuid
from dataclasses import dataclass, field
from datetime import datetime

from app.shared.domain.entities.role import Role
from app.shared.domain.values.email import Email


@dataclass
class User:
    id: uuid.UUID
    email: Email
    password_hash: str
    is_active: bool
    is_super_user: bool
    roles: list[Role] = field(default_factory=list)
    created_at: datetime | None = None
    updated_at: datetime | None = None

    def is_authenticatable(self) -> bool:
        """Whether this user is allowed to authenticate (login or refresh)."""
        return self.is_active
