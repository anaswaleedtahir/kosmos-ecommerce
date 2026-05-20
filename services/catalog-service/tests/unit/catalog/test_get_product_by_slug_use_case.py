import pytest

from app.catalog.application.use_cases.get_product_by_slug import (
    GetProductBySlugUseCase,
)
from app.catalog.domain.entities.product import ProductStatus
from app.catalog.domain.exceptions import ProductNotFoundError
from tests.unit.catalog.fakes import (
    FakeCatalogUnitOfWork,
    FakeProductRepository,
    make_product,
)


async def test_returns_product_by_slug():
    product = make_product(
        name="Noir Undone", slug="noir-undone", status=ProductStatus.ACTIVE
    )
    uow = FakeCatalogUnitOfWork(products=FakeProductRepository(products=[product]))
    use_case = GetProductBySlugUseCase(uow_factory=lambda: uow)

    result = await use_case.execute("noir-undone")

    assert result.name == "Noir Undone"
    assert result.slug == "noir-undone"


async def test_raises_when_slug_not_found():
    uow = FakeCatalogUnitOfWork()
    use_case = GetProductBySlugUseCase(uow_factory=lambda: uow)

    with pytest.raises(ProductNotFoundError):
        await use_case.execute("does-not-exist")


async def test_returns_storefront_metadata():
    meta = {"cat": "fragrance", "no": "N° 04", "tagline": "Cold air."}
    product = make_product(slug="fumee", storefront_metadata=meta)
    uow = FakeCatalogUnitOfWork(products=FakeProductRepository(products=[product]))
    use_case = GetProductBySlugUseCase(uow_factory=lambda: uow)

    result = await use_case.execute("fumee")

    assert result.storefront_metadata == meta
