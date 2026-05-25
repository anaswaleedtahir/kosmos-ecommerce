import asyncio
import logging
import sys
from pathlib import Path

from sqlalchemy import select

# Add the workspace root to Python path to enable 'app' imports
workspace_root = Path(__file__).parent.parent
if str(workspace_root) not in sys.path:
    sys.path.insert(0, str(workspace_root))

from app.auth.infrastructure.orm.user import User  # noqa: E402
from app.config import settings  # noqa: E402
from app.rbac.infrastructure.orm.association import (  # noqa: E402
    RolePermission,
    UserRole,
)
from app.rbac.infrastructure.orm.role import Permission, Role  # noqa: E402
from app.shared.infrastructure.crypto.bcrypt_password_hasher import (  # noqa: E402
    BcryptPasswordHasher,
)
from app.shared.infrastructure.db.session import async_session_factory  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BUILTIN_ROLES = [
    {
        "name": "viewer",
        "description": "Default signup role with no privileged permissions",
        "permissions": set(),
    },
    {
        "name": "catalog_manager",
        "description": "Can mutate catalog products, variants, and inventory",
        "permissions": {"catalog:write"},
    },
    {
        "name": "catalog_auditor",
        "description": "Can read catalog audit history without write access",
        "permissions": {"catalog:audit:read"},
    },
    {
        "name": "admin",
        "description": "Super user bootstrap role for platform administrators",
        "permissions": {"catalog:write", "catalog:audit:read"},
    },
]

BUILTIN_PERMISSIONS = {
    "catalog:write": ("catalog", "write"),
    "catalog:audit:read": ("catalog:audit", "read"),
}


async def get_or_create_role(db, name: str, description: str) -> Role:
    result = await db.execute(select(Role).where(Role.name == name))
    role = result.scalar_one_or_none()

    if role is None:
        role = Role(name=name, description=description, is_system=True)
        db.add(role)
        await db.flush()
        logger.info("Created role: %s", name)
    else:
        role.description = description
        role.is_system = True
        logger.info("Updated role: %s", name)

    return role


async def get_or_create_permission(db, scope_key: str) -> Permission:
    resource, action = BUILTIN_PERMISSIONS[scope_key]
    result = await db.execute(
        select(Permission).where(Permission.scope_key == scope_key)
    )
    permission = result.scalar_one_or_none()

    if permission is None:
        permission = Permission(
            resource=resource,
            action=action,
            scope_key=scope_key,
        )
        db.add(permission)
        await db.flush()
        logger.info("Created permission: %s", scope_key)
    else:
        permission.resource = resource
        permission.action = action
        logger.info("Updated permission: %s", scope_key)

    return permission


async def ensure_role_permission(db, role: Role, permission: Permission) -> None:
    result = await db.execute(
        select(RolePermission).where(
            RolePermission.role_id == role.id,
            RolePermission.permission_id == permission.id,
        )
    )

    if result.scalar_one_or_none() is None:
        db.add(
            RolePermission(
                role_id=role.id,
                permission_id=permission.id,
            )
        )
        logger.info("Assigned %s -> %s", permission.scope_key, role.name)


async def get_or_create_superuser(db, admin_role: Role) -> None:
    email = settings.seed_admin_email
    password = settings.seed_admin_password

    if not email or not password:
        logger.info(
            "SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD unset - skipping super user seed"
        )
        return

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        hasher = BcryptPasswordHasher()
        user = User(
            email=email,
            password_hash=hasher.hash(password),
            is_super_user=True,
            is_active=True,
        )
        db.add(user)
        await db.flush()
        logger.info("Created super user: %s", email)
    else:
        user.is_super_user = True
        user.is_active = True
        logger.info("Reconciled super user flags: %s", email)

    assignment = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user.id,
            UserRole.role_id == admin_role.id,
        )
    )
    if assignment.scalar_one_or_none() is None:
        db.add(
            UserRole(
                user_id=user.id,
                role_id=admin_role.id,
                assigned_by=user.id,
            )
        )
        logger.info("Assigned admin role to super user: %s", email)


async def seed(db) -> None:
    roles_by_name: dict[str, Role] = {}
    for role_data in BUILTIN_ROLES:
        role = await get_or_create_role(
            db,
            name=role_data["name"],
            description=role_data["description"],
        )
        roles_by_name[role.name] = role

    permissions_by_scope: dict[str, Permission] = {}
    for scope_key in BUILTIN_PERMISSIONS:
        permission = await get_or_create_permission(db, scope_key)
        permissions_by_scope[scope_key] = permission

    for role_data in BUILTIN_ROLES:
        role = roles_by_name[role_data["name"]]
        for scope_key in role_data["permissions"]:
            await ensure_role_permission(db, role, permissions_by_scope[scope_key])

    await get_or_create_superuser(db, roles_by_name["admin"])

    await db.commit()
    logger.info("Seed completed successfully")


async def main() -> None:
    async with async_session_factory() as db:
        try:
            await seed(db)
        except Exception:
            await db.rollback()
            logger.exception("Seed failed")
            raise


if __name__ == "__main__":
    asyncio.run(main())
