#!/usr/bin/env python3
"""Create all SQLAlchemy tables (dev bootstrap before first alembic autogenerate)."""

from __future__ import annotations

import asyncio

from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.db.models import base  # noqa: F401 — register models


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(base.Base.metadata.create_all)
    await engine.dispose()
    print(f"Schema created on {settings.DATABASE_URL.split('@')[-1]}")


if __name__ == "__main__":
    asyncio.run(main())
