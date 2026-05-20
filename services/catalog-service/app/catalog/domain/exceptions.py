from shared.exceptions import ConflictError, NotFoundError


class ProductNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("Product not found")


class ProductVariantNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("Product variant not found")


class SkuAlreadyExistsError(ConflictError):
    def __init__(self, sku: str) -> None:
        self.sku = sku
        super().__init__(f"SKU '{sku}' already exists")


class CategoryNotFoundError(NotFoundError):
    def __init__(self) -> None:
        super().__init__("Category not found")


class CategorySlugAlreadyExistsError(ConflictError):
    def __init__(self) -> None:
        super().__init__("Category slug already exists")


class ProductSlugAlreadyExistsError(ConflictError):
    def __init__(self) -> None:
        super().__init__("Product slug already exists")
