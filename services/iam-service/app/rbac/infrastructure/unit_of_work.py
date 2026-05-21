from collections.abc import Callable
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.rbac.domain.ports.assignment_repository import AssignmentRepository
from app.rbac.domain.ports.permission_repository import PermissionRepository
from app.rbac.domain.ports.role_repository import RoleRepository
from app.rbac.domain.ports.user_reader import UserReader
from app.rbac.infrastructure.repositories.sqlalchemy_assignment_repository import (
    SqlAlchemyAssignmentRepository,
)
from app.rbac.infrastructure.repositories.sqlalchemy_permission_repository import (
    SqlAlchemyPermissionRepository,
)
from app.rbac.infrastructure.repositories.sqlalchemy_role_repository import (
    SqlAlchemyRoleRepository,
)
from app.rbac.infrastructure.repositories.sqlalchemy_user_reader import (
    SqlAlchemyUserReader,
)
from app.shared.domain.events import DomainEvent


class SqlAlchemyRbacUnitOfWork:
    roles: RoleRepository
    permissions: PermissionRepository
    assignments: AssignmentRepository
    users: UserReader
    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession],
        dispatcher_factory: Callable[[AsyncSession], Any] | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._dispatcher_factory = dispatcher_factory
        self._events: list[DomainEvent] = []

    async def __aenter__(self) -> "SqlAlchemyRbacUnitOfWork":
        self._session = self._session_factory()
        self.roles = SqlAlchemyRoleRepository(self._session)
        self.permissions = SqlAlchemyPermissionRepository(self._session)
        self.assignments = SqlAlchemyAssignmentRepository(self._session)
        self.users = SqlAlchemyUserReader(self._session)
        self._dispatcher = (
            self._dispatcher_factory(self._session)
            if self._dispatcher_factory
            else None
        )
        self._events = []
        return self

    async def __aexit__(self, exc_type: object, *args: object) -> None:
        if exc_type:
            await self.rollback()
            self._events.clear()
        await self._session.close()  # type: ignore[union-attr]

    async def commit(self) -> None:
        await self._session.commit()  # type: ignore[union-attr]
        events = self.collect_events()
        if events and self._dispatcher:
            await self._dispatcher.dispatch(events)

    async def rollback(self) -> None:
        await self._session.rollback()  # type: ignore[union-attr]
        self._events.clear()

    def add_event(self, event: DomainEvent) -> None:
        self._events.append(event)

    def collect_events(self) -> list[DomainEvent]:
        events = self._events[:]
        self._events.clear()
        return events
