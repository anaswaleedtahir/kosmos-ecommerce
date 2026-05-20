import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass
class SignupInput:
    email: str
    password: str


@dataclass
class SignupResult:
    id: uuid.UUID
    email: str
    created_at: datetime | None


@dataclass
class LoginInput:
    email: str
    password: str


@dataclass
class LoginResult:
    access_token: str
    refresh_token: str


@dataclass
class RefreshInput:
    refresh_token: str


@dataclass
class RefreshResult:
    access_token: str
    refresh_token: str


@dataclass
class LogoutInput:
    refresh_token: str
    jti: str
    exp: int
