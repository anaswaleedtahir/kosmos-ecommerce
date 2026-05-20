import pytest

from app.auth.application.dto import SignupInput
from app.auth.application.use_cases.signup import SignupUseCase
from app.auth.domain.exceptions import (
    DefaultRoleMissingError,
    UserExistsError,
)
from tests.unit.auth.fakes import (
    FakeAuthUnitOfWork,
    FakePasswordHasher,
    FakeRoleRepository,
    FakeUserRepository,
    make_role,
    make_user,
)

_VIEWER_ROLE = make_role("viewer")


def _make_uow(**kwargs) -> FakeAuthUnitOfWork:
    return FakeAuthUnitOfWork(
        roles=FakeRoleRepository([_VIEWER_ROLE]),
        **kwargs,
    )


def _make_use_case(uow: FakeAuthUnitOfWork) -> SignupUseCase:
    return SignupUseCase(uow_factory=lambda: uow, hasher=FakePasswordHasher())


async def test_signup_creates_user_with_viewer_role():
    uow = _make_uow()
    use_case = _make_use_case(uow)

    result = await use_case.execute(
        SignupInput(email="alice@example.com", password="Secret1!")
    )

    assert result.email == "alice@example.com"
    assert result.id is not None
    assert uow.committed


async def test_signup_raises_when_email_exists():
    existing = make_user(email="alice@example.com")
    uow = _make_uow(users=FakeUserRepository([existing]))
    use_case = _make_use_case(uow)

    with pytest.raises(UserExistsError):
        await use_case.execute(
            SignupInput(email="alice@example.com", password="Secret1!")
        )


async def test_signup_raises_when_default_role_missing():
    uow = FakeAuthUnitOfWork(roles=FakeRoleRepository([]))  # no roles seeded
    use_case = _make_use_case(uow)

    with pytest.raises(DefaultRoleMissingError):
        await use_case.execute(
            SignupInput(email="bob@example.com", password="Secret1!")
        )


async def test_signup_hashes_password():
    uow = _make_uow()
    hasher = FakePasswordHasher()
    use_case = SignupUseCase(uow_factory=lambda: uow, hasher=hasher)

    await use_case.execute(SignupInput(email="carol@example.com", password="Secret1!"))

    persisted = await uow.users.find_by_email("carol@example.com")
    assert persisted is not None
    assert persisted.password_hash == "hashed:Secret1!"
