from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from shared.actor import ActorContext

from app.auth.domain.exceptions import TokenRevokedError
from app.auth.domain.ports.token_verifier import TokenPayload
from app.auth.infrastructure.composition import get_revocation_store, get_token_verifier
from app.auth.infrastructure.stores.redis_revocation_store import RedisRevocationStore
from app.shared.infrastructure.crypto.jwt_token_verifier import JwtTokenVerifier

http_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(http_bearer),
    verifier: JwtTokenVerifier = Depends(get_token_verifier),
    revocation_store: RedisRevocationStore = Depends(get_revocation_store),
) -> TokenPayload:
    payload = verifier.verify(credentials.credentials)

    if await revocation_store.is_revoked(str(payload["jti"])):
        raise TokenRevokedError()

    return payload


async def require_super_user(
    payload: TokenPayload = Depends(get_current_user),
) -> TokenPayload:
    if not payload.get("is_super_user"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Super user privileges required.",
        )
    return payload


async def get_actor_context(
    payload: TokenPayload = Depends(require_super_user),
) -> ActorContext:
    return ActorContext.from_jwt(dict(payload))
