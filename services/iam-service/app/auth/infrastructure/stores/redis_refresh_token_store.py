import uuid

from app.shared.infrastructure.cache.redis import RedisCommandClient


class RedisRefreshTokenStore:
    def __init__(self, redis: RedisCommandClient) -> None:
        self._redis = redis

    async def put(self, token: str, user_id: uuid.UUID, ttl_seconds: int) -> None:
        await self._redis.setex(f"refresh_token:{token}", ttl_seconds, str(user_id))

    async def get(self, token: str) -> uuid.UUID | None:
        value = await self._redis.get(f"refresh_token:{token}")
        if not value:
            return None
        if isinstance(value, bytes):
            value = value.decode()
        return uuid.UUID(value)

    async def delete(self, token: str) -> None:
        await self._redis.delete(f"refresh_token:{token}")
