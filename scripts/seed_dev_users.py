#!/usr/bin/env python3
"""Seed dev users into PostgreSQL when AUTH_USE_DB=true."""

from __future__ import annotations

import asyncio
import uuid

from app.core import security
from app.core.config import settings
from app.db.repositories.user import UserRepository
from app.db.session import async_session_factory
from app.services.auth_service import resolve_mock_role_org

DEV_USERS = [
    ("brand_admin@test.com", "brand_admin123", "Brand Admin"),
    ("buyer@test.com", "buyer123", "Buyer User"),
    ("admin@test.com", "admin123", "Platform Admin"),
]


async def main() -> None:
    async with async_session_factory() as session:
        repo = UserRepository(session)
        for email, password, full_name in DEV_USERS:
            existing = await repo.get_by_email(email)
            if existing:
                print(f"skip {email} (exists)")
                continue
            role, org_id = resolve_mock_role_org(email)
            await repo.create_user(
                user_id=str(uuid.uuid4()),
                email=email,
                hashed_password=security.get_password_hash(password),
                full_name=full_name,
                role=role.value,
                organization_id=org_id,
            )
            print(f"created {email}")
    print(f"DATABASE_URL={settings.DATABASE_URL}")


if __name__ == "__main__":
    asyncio.run(main())
