from shared.exceptions import ConflictError, NotFoundError


class InventoryNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("Inventory record not found for variant")


class InsufficientStockError(ConflictError):
    def __init__(self, available: int, requested: int) -> None:
        self.available = available
        self.requested = requested
        super().__init__(
            f"Insufficient stock: {available} available, {requested} requested"
        )
