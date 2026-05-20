from shared.exceptions import AuthorizationError


class SystemRoleProtectedError(AuthorizationError):
    def __init__(self) -> None:
        super().__init__("Cannot delete system role")
