"""Platform stack registry and routing tests."""

import pytest

from app.platform.stack_registry import (
    STACK_CAPABILITIES,
    StackCapabilityId,
    get_capability_for_section,
    get_agents_for_capability,
)
from app.agents.stack_routing import agents_for_platform_context, pick_agent_for_task


def test_all_ten_capabilities_registered():
    assert len(STACK_CAPABILITIES) == 10
    for cap in StackCapabilityId:
        assert cap in STACK_CAPABILITIES


def test_shop_checkout_section_maps_payments_and_catalog():
    caps = get_capability_for_section("shop-co-checkout")
    cap_values = {c.value for c in caps}
    assert "payments" in cap_values
    assert "product_catalog" in cap_values


def test_brand_dev_w2_maps_catalog_and_upload():
    caps = {c.value for c in get_capability_for_section("brand-dev-w2-hub")}
    assert "product_catalog" in caps
    assert "image_upload" in caps


def test_ai_module_has_orchestrator_agent():
    agents = get_agents_for_capability(StackCapabilityId.AI_MODULE)
    assert "orchestrator" in agents


def test_platform_context_agents_brand_development():
    agents = agents_for_platform_context(pillar="development", role="brand")
    assert "product_architect" in agents
    assert "architecture_guard" in agents


def test_pick_agent_for_catalog_task():
    agent = pick_agent_for_task(
        "optimize product catalog for showroom",
        pillar="sample_collection",
        role="brand",
        section_id="brand-sc-showroom",
    )
    assert agent in ("product_architect", "market_intelligence", "content", "lookbook")


def test_pick_agent_for_workshop2_task():
    agent = pick_agent_for_task(
        "Review workshop2 dossier tech pack for demo article",
        pillar="development",
        role="brand",
        section_id="brand-dev-w2-hub",
    )
    assert agent in ("product_architect", "architecture_guard", "tech_debt")


def test_pick_agent_for_procurement_task():
    agent = pick_agent_for_task(
        "factory-ack procurement handoff queue",
        pillar="order_production",
        role="manufacturer",
        section_id="mfr-op-handoff-queue",
    )
    assert agent in ("order_anomaly", "risk", "tech_debt")


def test_postgresql_capability_has_agents():
    agents = get_agents_for_capability(StackCapabilityId.POSTGRESQL)
    assert "tech_debt" in agents
    assert "order_anomaly" in agents
