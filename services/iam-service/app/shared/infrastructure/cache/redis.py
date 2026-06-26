from typing import Any, Protocol

from redis_fastapi import get_settings

from app.config import settings

sdk_settings = get_settings()
sdk_settings.url = str(settings.redis_url)


class RedisCommandClient(Protocol):
    """Subset of Redis commands used by IAM infrastructure adapters."""

    async def ping(self) -> bool: ...

    async def setex(self, name: str, time: int, value: str) -> Any: ...

    async def get(self, name: str) -> bytes | str | None: ...

    async def delete(self, name: str) -> Any: ...

    async def incr(self, name: str) -> int: ...

    async def expire(self, name: str, time: int) -> Any: ...


class RedisClientProxy:
    """Runtime Redis client provided by fastapi-redis-sdk lifespan."""

    def __init__(self) -> None:
        self._client: RedisCommandClient | None = None

    def set_client(self, client: RedisCommandClient) -> None:
        self._client = client

    def clear(self) -> None:
        self._client = None

    def _require_client(self) -> RedisCommandClient:
        if self._client is None:
            raise RuntimeError("Redis client is not initialized")
        return self._client

    async def ping(self) -> bool:
        return await self._require_client().ping()

    async def setex(self, name: str, time: int, value: str) -> Any:
        return await self._require_client().setex(name, time, value)

    async def get(self, name: str) -> bytes | str | None:
        return await self._require_client().get(name)

    async def delete(self, name: str) -> Any:
        return await self._require_client().delete(name)

    async def incr(self, name: str) -> int:
        return await self._require_client().incr(name)

    async def expire(self, name: str, time: int) -> Any:
        return await self._require_client().expire(name, time)


redis_client = RedisClientProxy()
