import logging
import re
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from shared.context import request_id

logger = logging.getLogger(__name__)


def _valid_request_id(value: str | None) -> bool:
    if not value or len(value) > 64:
        return False
    return bool(re.match(r"^[a-zA-Z0-9._-]+$", value))


class RequestResponseMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start = time.perf_counter()
        client_id = request.headers.get("X-Request-ID")
        rid = (
            client_id
            if (client_id and _valid_request_id(client_id))
            else str(uuid.uuid4())
        )
        token = request_id.set(rid)
        try:
            response = await call_next(request)
            ms = (time.perf_counter() - start) * 1000
            logger.info(
                "%s %s - %s in %.2fms",
                request.method,
                request.url,
                response.status_code,
                ms,
            )
            response.headers["X-Request-ID"] = rid
            return response
        finally:
            request_id.reset(token)
