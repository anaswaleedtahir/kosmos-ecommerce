from fastapi import APIRouter, Depends

from app.audit.application.dto import GetAuditLogsInput
from app.audit.application.use_cases.get_audit_logs import GetAuditLogsUseCase
from app.audit.infrastructure.composition import get_audit_logs_use_case
from app.audit.infrastructure.http.schemas import AuditLogResponse
from app.shared.infrastructure.http.dependencies import require_catalog_audit_read

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=list[AuditLogResponse])
async def get_audit_logs(
    page: int = 1,
    page_size: int = 20,
    _payload: dict = Depends(require_catalog_audit_read),
    use_case: GetAuditLogsUseCase = Depends(get_audit_logs_use_case),
) -> list[AuditLogResponse]:
    result = await use_case.execute(GetAuditLogsInput(page=page, page_size=page_size))
    return [AuditLogResponse.model_validate(item) for item in result.items]
