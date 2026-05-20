import uuid
from dataclasses import dataclass
from typing import Protocol


@dataclass
class UserSummary:
    id: uuid.UUID
    email: str


class UserReader(Protocol):
    async def find_summary_by_id(self, id: uuid.UUID) -> UserSummary | None: ...
