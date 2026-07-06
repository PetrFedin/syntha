"""Normalize Platform Core context for backend agents."""

from __future__ import annotations

from typing import Any


def enrich_platform_context(raw: dict[str, Any] | None) -> dict[str, Any]:
    """Merge camelCase/snake_case Platform Core ids into orchestrator context."""
    ctx = dict(raw or {})

    collection_id = (
        ctx.get("collectionId")
        or ctx.get("collection_id")
        or ctx.get("collection")
    )
    article_id = (
        ctx.get("articleId")
        or ctx.get("article_id")
        or ctx.get("demoArticleId")
        or ctx.get("demo_article_id")
    )
    order_id = (
        ctx.get("orderId")
        or ctx.get("order_id")
        or ctx.get("demoOrderId")
        or ctx.get("demo_order_id")
    )
    factory_id = ctx.get("factoryId") or ctx.get("factory_id")

    if collection_id:
        ctx["collection_id"] = str(collection_id)
        ctx.setdefault("collectionId", ctx["collection_id"])
    if article_id:
        ctx["article_id"] = str(article_id)
        ctx.setdefault("articleId", ctx["article_id"])
    if order_id:
        ctx["order_id"] = str(order_id)
        ctx.setdefault("orderId", ctx["order_id"])
    if factory_id:
        ctx["factory_id"] = str(factory_id)
        ctx.setdefault("factoryId", ctx["factory_id"])

    section_id = ctx.get("section_id") or ctx.get("sectionId")
    if section_id:
        ctx["section_id"] = str(section_id)

    pillar = ctx.get("pillar") or ctx.get("pillarId")
    role = ctx.get("role") or ctx.get("roleId")
    if pillar:
        ctx["pillar"] = str(pillar)
    if role:
        ctx["role"] = str(role)

    return ctx


def platform_context_summary(ctx: dict[str, Any]) -> str:
    """One-line summary for LLM prompts."""
    parts: list[str] = []
    for key, label in (
        ("pillar", "pillar"),
        ("role", "role"),
        ("section_id", "section"),
        ("collection_id", "collection"),
        ("article_id", "article"),
        ("order_id", "order"),
        ("factory_id", "factory"),
    ):
        val = ctx.get(key)
        if val:
            parts.append(f"{label}={val}")
    return ", ".join(parts) if parts else ""
