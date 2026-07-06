import pytest

from app.agents.platform_context import enrich_platform_context, platform_context_summary


def test_enrich_platform_context_camel_case():
    ctx = enrich_platform_context(
        {
            "pillar": "development",
            "role": "brand",
            "collectionId": "SS27",
            "articleId": "demo-ss27-01",
            "orderId": "B2B-DEMO-SHOP1-SS27",
        }
    )
    assert ctx["collection_id"] == "SS27"
    assert ctx["collectionId"] == "SS27"
    assert ctx["article_id"] == "demo-ss27-01"
    assert ctx["order_id"] == "B2B-DEMO-SHOP1-SS27"


def test_enrich_platform_context_snake_case():
    ctx = enrich_platform_context({"collection_id": "FW27", "section_id": "brand-dev-w2-hub"})
    assert ctx["collectionId"] == "FW27"
    assert ctx["section_id"] == "brand-dev-w2-hub"


def test_platform_context_summary():
    s = platform_context_summary(
        {"pillar": "collection_order", "role": "shop", "order_id": "B2B-1"}
    )
    assert "pillar=collection_order" in s
    assert "order=B2B-1" in s
