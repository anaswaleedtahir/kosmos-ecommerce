from app.shared.domain.exceptions import DomainError


class InvalidCredentialsError(DomainError):
    def __init__(self) -> None:
        super().__init__("Invalid email or password")


class RefreshTokenInvalidError(DomainError):
    def __init__(self) -> None:
        super().__init__("Invalid or expired refresh token")


class DefaultRoleMissingError(DomainError):
    def __init__(self) -> None:
        super().__init__("Default 'viewer' role not found. Run seed script first.")


class UserExistsError(DomainError):
    def __init__(self) -> None:
        super().__init__("Email already exists")


class TokenExpiredError(DomainError):
    """Raised when a JWT token has expired."""


class InvalidTokenError(DomainError):
    """Raised when a JWT token is invalid or malformed."""
