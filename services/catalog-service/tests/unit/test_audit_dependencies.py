import pytest
from fastapi import HTTPException

from app.shared.infrastructure.http.dependencies import require_catalog_audit_read


async def test_require_catalog_audit_read_allows_permission():
    payload = {"permissions": ["catalog:audit:read"]}

    result = await require_catalog_audit_read(payload=payload)

    assert result == payload


async def test_require_catalog_audit_read_rejects_missing_permission():
    with pytest.raises(HTTPException) as exc_info:
        await require_catalog_audit_read(payload={"permissions": ["catalog:write"]})

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "catalog:audit:read permission required"
