import json

from fastapi import Request
from shared.exceptions import RateLimitError

from app.shared.infrastructure.cache.redis import redis_client

# Config
IP_MAX_ATTEMPTS = 20  # per 60 seconds
IP_WINDOW = 60  # seconds

EMAIL_MAX_ATTEMPTS = 5  # per 300 seconds
EMAIL_WINDOW = 300  # seconds


async def rate_limit_by_ip(request: Request) -> None:
    ip_address = request.client.host if request.client else "unknown"
    if not ip_address:
        return

    endpoint = request.url.path
    redis_key = f"rate_limit:ip:{ip_address}:{endpoint}"

    count = await redis_client.incr(redis_key)

    if count == 1:
        await redis_client.expire(redis_key, IP_WINDOW)

    if count > IP_MAX_ATTEMPTS:
        raise RateLimitError(
            "Rate limit exceeded (IP). Try again later.", retry_after=IP_WINDOW
        )


async def rate_limit_by_email(request: Request) -> None:
    try:
        body_bytes = await request.body()
        body = json.loads(body_bytes)
    except Exception:
        return
    email = body.get("email")
    if not email or not isinstance(email, str):
        return
    email = email.lower().strip()

    endpoint = request.url.path
    redis_key = f"rate_limit:email:{email}:{endpoint}"

    count = await redis_client.incr(redis_key)

    if count == 1:
        await redis_client.expire(redis_key, EMAIL_WINDOW)

    if count > EMAIL_MAX_ATTEMPTS:
        raise RateLimitError(
            "Rate limit exceeded (EMAIL). Try again later.", retry_after=EMAIL_WINDOW
        )
