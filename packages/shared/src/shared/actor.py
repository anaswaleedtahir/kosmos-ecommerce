import uuid
from dataclasses import dataclass

from shared.context import request_id as _request_id_var


@dataclass(frozen=True)
class ActorContext:
    """Principal performing a write. Built at the HTTP seam, passed into every write use case.

    `actor_email` is the JWT `email` claim — None for system actors (seed scripts, migrations).
    `request_id` is taken from the `request_id` ContextVar set by RequestResponseMiddleware.
    """  # noqa: E501

    actor_id: uuid.UUID
    actor_email: str | None = None
    request_id: str = "-"

    @classmethod
    def from_jwt(cls, payload: dict) -> "ActorContext":
        return cls(
            actor_id=uuid.UUID(str(payload["sub"])),
            actor_email=payload.get("email"),
            request_id=_request_id_var.get(),
        )
