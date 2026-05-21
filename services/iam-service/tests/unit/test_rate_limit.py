from unittest.mock import AsyncMock, patch

import pytest
from shared.exceptions import RateLimitError
from starlette.requests import Request


async def test_ip_rate_limit_exceeded():
    from app.shared.infrastructure.http.rate_limit import (
        IP_MAX_ATTEMPTS,
        rate_limit_by_ip,
    )

    mock_incr = AsyncMock(return_value=IP_MAX_ATTEMPTS + 1)
    mock_expire = AsyncMock()

    mock_client = AsyncMock()
    mock_client.host = "192.168.1.1"
    mock_request = AsyncMock(spec=Request)
    mock_request.client = mock_client
    mock_request.url.path = "/test"

    with patch("app.shared.infrastructure.http.rate_limit.redis_client") as mock_redis:
        mock_redis.incr = mock_incr
        mock_redis.expire = mock_expire

        with pytest.raises(RateLimitError) as exc_info:
            await rate_limit_by_ip(mock_request)

        assert exc_info.value.status_code == 429
        assert "Rate limit exceeded (IP)" in str(exc_info.value)

        mock_incr.assert_called_once()


async def test_ip_rate_limit_with_no_client():
    from app.shared.infrastructure.http.rate_limit import (
        IP_MAX_ATTEMPTS,
        rate_limit_by_ip,
    )

    mock_incr = AsyncMock(return_value=IP_MAX_ATTEMPTS - 5)
    mock_expire = AsyncMock()

    mock_request = AsyncMock(spec=Request)
    mock_request.client = None
    mock_request.url.path = "/test"

    with patch("app.shared.infrastructure.http.rate_limit.redis_client") as mock_redis:
        mock_redis.incr = mock_incr
        mock_redis.expire = mock_expire

        await rate_limit_by_ip(mock_request)

        mock_incr.assert_called_once()


async def test_email_rate_limit_exceeded():
    from app.shared.infrastructure.http.rate_limit import (
        EMAIL_MAX_ATTEMPTS,
        rate_limit_by_email,
    )

    mock_incr = AsyncMock(return_value=EMAIL_MAX_ATTEMPTS + 1)
    mock_expire = AsyncMock()

    mock_request = AsyncMock(spec=Request)
    mock_request.body = AsyncMock(return_value=b'{"email": "test@example.com"}')
    mock_request.url.path = "/login"

    with patch("app.shared.infrastructure.http.rate_limit.redis_client") as mock_redis:
        mock_redis.incr = mock_incr
        mock_redis.expire = mock_expire

        with pytest.raises(RateLimitError) as exc_info:
            await rate_limit_by_email(mock_request)

        assert exc_info.value.status_code == 429
        assert "Rate limit exceeded (EMAIL)" in str(exc_info.value)

        mock_incr.assert_called_once()


async def test_email_rate_limit_not_exceeded():
    from app.shared.infrastructure.http.rate_limit import (
        EMAIL_MAX_ATTEMPTS,
        rate_limit_by_email,
    )

    mock_incr = AsyncMock(return_value=EMAIL_MAX_ATTEMPTS - 5)
    mock_expire = AsyncMock()

    mock_request = AsyncMock(spec=Request)
    mock_request.body = AsyncMock(return_value=b'{"email": "test@example.com"}')
    mock_request.url.path = "/login"

    with patch("app.shared.infrastructure.http.rate_limit.redis_client") as mock_redis:
        mock_redis.incr = mock_incr
        mock_redis.expire = mock_expire

        await rate_limit_by_email(mock_request)

        mock_incr.assert_called_once()


async def test_ip_rate_limit_with_empty_host():
    from app.shared.infrastructure.http.rate_limit import rate_limit_by_ip

    mock_client = AsyncMock()
    mock_client.host = ""
    mock_request = AsyncMock(spec=Request)
    mock_request.client = mock_client
    mock_request.url.path = "/test"

    with patch("app.shared.infrastructure.http.rate_limit.redis_client") as mock_redis:
        await rate_limit_by_ip(mock_request)

        mock_redis.incr.assert_not_called()
        mock_redis.expire.assert_not_called()


async def test_ip_rate_limit_not_exceeded():
    from app.shared.infrastructure.http.rate_limit import (
        IP_MAX_ATTEMPTS,
        rate_limit_by_ip,
    )

    mock_incr = AsyncMock(return_value=IP_MAX_ATTEMPTS - 5)
    mock_expire = AsyncMock()

    mock_client = AsyncMock()
    mock_client.host = "192.168.1.1"
    mock_request = AsyncMock(spec=Request)
    mock_request.client = mock_client
    mock_request.url.path = "/test"

    with patch("app.shared.infrastructure.http.rate_limit.redis_client") as mock_redis:
        mock_redis.incr = mock_incr
        mock_redis.expire = mock_expire

        await rate_limit_by_ip(mock_request)

        mock_incr.assert_called_once()
