from shared.exceptions import ConflictError, NotFoundError


class RoleAlreadyExistsError(ConflictError):
    def __init__(self) -> None:
        super().__init__("Role name already exists")


class RoleNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("Role not found")


class PermissionAlreadyAssignedError(ConflictError):
    def __init__(self) -> None:
        super().__init__("Permission already assigned")


class PermissionNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("Permission not found")


class UserNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("User not found")
