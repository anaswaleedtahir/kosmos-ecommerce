from typing import ClassVar

from starlette.applications import Starlette
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class DomainError(Exception):
    """Base for domain errors. status_code + optional headers carried per tier."""

    status_code: ClassVar[int] = 500
    headers: ClassVar[dict[str, str] | None] = None


class AuthenticationError(DomainError):
    status_code: ClassVar[int] = 401
    headers: ClassVar[dict[str, str] | None] = {"WWW-Authenticate": "Bearer"}


class AuthorizationError(DomainError):
    status_code: ClassVar[int] = 403


class NotFoundError(DomainError):
    status_code: ClassVar[int] = 404


class ConflictError(DomainError):
    status_code: ClassVar[int] = 409


class ValidationError(DomainError):
    status_code: ClassVar[int] = 422


class RateLimitError(DomainError):
    status_code: ClassVar[int] = 429

    def __init__(
        self, detail: str = "Rate limit exceeded.", *, retry_after: int
    ) -> None:
        super().__init__(detail)
        self.headers = {"Retry-After": str(retry_after)}


def register_domain_exception_handler(app: Starlette) -> None:
    async def _handler(request: Request, exc: Exception) -> Response:
        domain_exc = exc if isinstance(exc, DomainError) else DomainError(str(exc))
        return JSONResponse(
            status_code=domain_exc.status_code,
            content={"detail": str(domain_exc)},
            headers=domain_exc.headers,
        )

    app.add_exception_handler(DomainError, _handler)
