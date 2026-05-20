from shared.exceptions import AuthenticationError, ConflictError, DomainError


class InvalidCredentialsError(AuthenticationError):
    def __init__(self) -> None:
        super().__init__("Invalid email or password")


class RefreshTokenInvalidError(AuthenticationError):
    def __init__(self) -> None:
        super().__init__("Invalid or expired refresh token")


class DefaultRoleMissingError(DomainError):
    def __init__(self) -> None:
        super().__init__("Default 'viewer' role not found. Run seed script first.")


class UserExistsError(ConflictError):
    def __init__(self) -> None:
        super().__init__("Email already exists")


class TokenExpiredError(AuthenticationError):
    """Raised when a JWT token has expired."""


class InvalidTokenError(AuthenticationError):
    """Raised when a JWT token is invalid or malformed."""


class TokenRevokedError(AuthenticationError):
    def __init__(self) -> None:
        super().__init__("Token has been revoked")
