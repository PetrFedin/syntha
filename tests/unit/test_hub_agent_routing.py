"""Hub agent routing matrix tests."""

from app.agents.hub_agent_routing import (
    build_hub_agent_matrix,
    cursor_subagent_for_pillar,
    hub_primary_agent,
    resolve_agent_routing,
)


def test_hub_matrix_has_development_brand():
    rows = build_hub_agent_matrix()
    cell = next(r for r in rows if r["pillar"] == "development" and r["role"] == "brand")
    assert cell["primary_agent"] == "product_architect"
    assert cell["cursor_subagent"] == "syntha-w2-development"
    assert "product_architect" in cell["bound_agents"]


def test_hub_primary_shop_collection_order():
    assert hub_primary_agent("collection_order", "shop") == "order_anomaly"


def test_cursor_subagent_comms():
    assert cursor_subagent_for_pillar("comms") == "syntha-comms"


def test_resolve_routing_with_section():
    r = resolve_agent_routing(
        pillar="collection_order",
        role="shop",
        section_id="shop-co-checkout",
        task="checkout MOQ anomaly",
    )
    assert r["section_hint"] == "order_anomaly"
    assert r["preferred_agent"] == "order_anomaly"
    assert r["cursor_subagent"] == "syntha-b2b-order"
