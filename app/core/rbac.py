from __future__ import annotations

from enum import Enum
from typing import FrozenSet, Iterable

from fastapi import Depends, HTTPException, status


class Role(str, Enum):
    PLATFORM_ADMIN = "platform_admin"
    BRAND_ADMIN = "brand_admin"
    BRAND_MANAGER = "brand_manager"
    SALES_REP = "sales_rep"
    BUYER_ADMIN = "buyer_admin"
    BUYER = "buyer"
    MERCHANDISER = "merchandiser"
    PLANNER = "planner"
    FINANCE_USER = "finance_user"
    ANALYST = "analyst"
    DISTRIBUTOR = "distributor"
    STORE_MANAGER = "store_manager"


class Permission(str, Enum):
    USERS_READ = "users.read"
    USERS_MANAGE = "users.manage"
    ROLES_ASSIGN = "roles.assign"
    ORGANIZATION_READ = "organization.read"
    ORGANIZATION_MANAGE = "organization.manage"
    CATALOG_READ = "catalog.read"
    CATALOG_MANAGE = "catalog.manage"
    PRODUCTS_READ = "products.read"
    PRODUCTS_MANAGE = "products.manage"
    ORDERS_READ = "orders.read"
    ORDERS_MANAGE = "orders.manage"
    ORDERS_CHANGE_STATUS = "orders.change_status"
    PAYMENTS_READ = "payments.read"
    PAYMENTS_MANAGE = "payments.manage"
    DOCUMENTS_READ = "documents.read"
    DOCUMENTS_MANAGE = "documents.manage"
    INTEGRATIONS_READ = "integrations.read"
    INTEGRATIONS_MANAGE = "integrations.manage"
    ANALYTICS_READ = "analytics.read"
    AUDIT_READ = "audit.read"
    AUDIT_WRITE = "audit.write"
    SETTINGS_MANAGE = "settings.manage"


READ_PERMISSIONS: FrozenSet[Permission] = frozenset(
    {
        Permission.ORGANIZATION_READ,
        Permission.CATALOG_READ,
        Permission.PRODUCTS_READ,
        Permission.ORDERS_READ,
        Permission.DOCUMENTS_READ,
        Permission.INTEGRATIONS_READ,
        Permission.ANALYTICS_READ,
    }
)

ROLE_PERMISSIONS: dict[Role, FrozenSet[Permission]] = {
    Role.PLATFORM_ADMIN: frozenset(Permission),
    Role.BRAND_ADMIN: READ_PERMISSIONS
    | frozenset(
        {
            Permission.USERS_READ,
            Permission.USERS_MANAGE,
            Permission.ORGANIZATION_MANAGE,
            Permission.CATALOG_MANAGE,
            Permission.PRODUCTS_MANAGE,
            Permission.ORDERS_MANAGE,
            Permission.ORDERS_CHANGE_STATUS,
            Permission.PAYMENTS_READ,
            Permission.PAYMENTS_MANAGE,
            Permission.DOCUMENTS_MANAGE,
            Permission.INTEGRATIONS_MANAGE,
        }
    ),
    Role.BRAND_MANAGER: READ_PERMISSIONS
    | frozenset(
        {
            Permission.CATALOG_MANAGE,
            Permission.PRODUCTS_MANAGE,
            Permission.ORDERS_MANAGE,
            Permission.ORDERS_CHANGE_STATUS,
            Permission.DOCUMENTS_MANAGE,
            Permission.INTEGRATIONS_MANAGE,
        }
    ),
    Role.SALES_REP: READ_PERMISSIONS
    | frozenset({Permission.ORDERS_MANAGE, Permission.ORDERS_CHANGE_STATUS}),
    Role.BUYER_ADMIN: READ_PERMISSIONS
    | frozenset(
        {
            Permission.ORDERS_MANAGE,
            Permission.ORDERS_CHANGE_STATUS,
            Permission.PAYMENTS_READ,
            Permission.PAYMENTS_MANAGE,
            Permission.DOCUMENTS_MANAGE,
        }
    ),
    Role.BUYER: READ_PERMISSIONS
    | frozenset(
        {
            Permission.ORDERS_MANAGE,
            Permission.PAYMENTS_READ,
            Permission.PAYMENTS_MANAGE,
        }
    ),
    Role.MERCHANDISER: READ_PERMISSIONS
    | frozenset({Permission.CATALOG_MANAGE, Permission.PRODUCTS_MANAGE}),
    Role.PLANNER: READ_PERMISSIONS,
    Role.FINANCE_USER: READ_PERMISSIONS
    | frozenset({Permission.PAYMENTS_READ, Permission.PAYMENTS_MANAGE}),
    Role.ANALYST: READ_PERMISSIONS,
    Role.DISTRIBUTOR: READ_PERMISSIONS
    | frozenset(
        {
            Permission.ORDERS_MANAGE,
            Permission.ORDERS_CHANGE_STATUS,
            Permission.PAYMENTS_READ,
            Permission.PAYMENTS_MANAGE,
            Permission.DOCUMENTS_MANAGE,
        }
    ),
    Role.STORE_MANAGER: READ_PERMISSIONS
    | frozenset(
        {
            Permission.ORDERS_MANAGE,
            Permission.ORDERS_CHANGE_STATUS,
            Permission.PAYMENTS_READ,
            Permission.PAYMENTS_MANAGE,
        }
    ),
}


def normalize_role(value: str | Role | None) -> Role | None:
    if isinstance(value, Role):
        return value
    if not value:
        return None
    try:
        return Role(str(value))
    except ValueError:
        return None


def permissions_for_role(value: str | Role | None) -> FrozenSet[Permission]:
    role = normalize_role(value)
    if role is None:
        return frozenset()
    return ROLE_PERMISSIONS.get(role, frozenset())


def has_permission(value: str | Role | None, permission: Permission) -> bool:
    return permission in permissions_for_role(value)


def require_permission(permission: Permission):
    async def dependency(current_user=Depends(_get_current_active_user)):
        if not has_permission(current_user.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency


def require_any_permission(permissions: Iterable[Permission]):
    required = frozenset(permissions)

    async def dependency(current_user=Depends(_get_current_active_user)):
        granted = permissions_for_role(current_user.role)
        if not granted.intersection(required):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency


def require_role(*roles: Role):
    allowed = frozenset(roles)

    async def dependency(current_user=Depends(_get_current_active_user)):
        role = normalize_role(current_user.role)
        if role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency


def ensure_same_organization(current_user, organization_id: str | None) -> None:
    role = normalize_role(current_user.role)
    if role == Role.PLATFORM_ADMIN:
        return
    if not organization_id or current_user.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Resource is outside the current organization",
        )


async def _get_current_active_user():
    # Imported lazily to avoid a circular import between app.api.deps and this module.
    from app.api.deps import get_current_active_user

    return await get_current_active_user()
