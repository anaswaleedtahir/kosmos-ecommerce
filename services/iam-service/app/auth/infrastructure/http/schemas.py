from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.auth.application.dto import (
    LoginInput,
    LogoutInput,
    RefreshInput,
    SignupInput,
)
from app.shared.infrastructure.http.schemas import OrmSchema


class SignupRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c in "!@#$%^&*()_+-=[]{}|;':\"<>,.?/" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v

    def to_input(self) -> SignupInput:
        return SignupInput(email=str(self.email), password=self.password)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    def to_input(self) -> LoginInput:
        return LoginInput(email=str(self.email), password=self.password)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(OrmSchema):
    id: UUID
    email: EmailStr
    created_at: datetime


class MeResponse(OrmSchema):
    id: UUID
    email: EmailStr
    roles: list[str]
    permissions: list[str]
    is_super_user: bool


def make_refresh_input(refresh_token: str) -> RefreshInput:
    return RefreshInput(refresh_token=refresh_token)


def make_logout_input(refresh_token: str, payload: dict[str, object]) -> LogoutInput:
    return LogoutInput(
        refresh_token=refresh_token,
        jti=str(payload["jti"]),
        exp=int(payload["exp"]),  # type: ignore[arg-type]
    )
