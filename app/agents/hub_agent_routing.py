"""Hub matrix: pillar × role → primary backend agent + Cursor subagent."""

from __future__ import annotations

from app.agents.section_agent_hints import agent_hint_for_section
from app.agents.stack_routing import agents_for_platform_context, pick_agent_for_task

PILLARS = (
    "development",
    "sample_collection",
    "collection_order",
    "order_production",
    "comms",
)
ROLES = ("brand", "shop", "manufacturer", "supplier")

# Primary agent when no task keywords / section hint (Fashion OS hub)
PILLAR_ROLE_PRIMARY: dict[tuple[str, str], str] = {
    ("development", "brand"): "product_architect",
    ("development", "supplier"): "product_architect",
    ("sample_collection", "brand"): "product_architect",
    ("sample_collection", "shop"): "product_architect",
    ("collection_order", "brand"): "risk",
    ("collection_order", "shop"): "order_anomaly",
    ("order_production", "manufacturer"): "order_anomaly",
    ("order_production", "supplier"): "order_anomaly",
    ("comms", "brand"): "architecture_guard",
    ("comms", "shop"): "architecture_guard",
}

PILLAR_CURSOR_SUBAGENT: dict[str, str] = {
    "development": "syntha-w2-development",
    "sample_collection": "syntha-sample-collection",
    "collection_order": "syntha-b2b-order",
    "order_production": "syntha-factory-production",
    "comms": "syntha-comms",
}


def hub_primary_agent(pillar: str | None, role: str | None) -> str | None:
    if not pillar or not role:
        return None
    return PILLAR_ROLE_PRIMARY.get((pillar, role))


def cursor_subagent_for_pillar(pillar: str | None) -> str | None:
    if not pillar:
        return None
    return PILLAR_CURSOR_SUBAGENT.get(pillar)


def build_hub_agent_matrix() -> list[dict]:
    """5 pillars × 4 roles — bound agents, primary, Cursor subagent."""
    rows: list[dict] = []
    for pillar in PILLARS:
        for role in ROLES:
            bound = agents_for_platform_context(pillar=pillar, role=role)
            if not bound and hub_primary_agent(pillar, role) is None:
                continue
            rows.append(
                {
                    "pillar": pillar,
                    "role": role,
                    "primary_agent": hub_primary_agent(pillar, role),
                    "bound_agents": bound,
                    "cursor_subagent": cursor_subagent_for_pillar(pillar),
                }
            )
    return rows


def resolve_agent_routing(
    *,
    pillar: str | None = None,
    role: str | None = None,
    section_id: str | None = None,
    task: str | None = None,
) -> dict:
    """Single cell routing snapshot for API + orchestrator."""
    bound = agents_for_platform_context(pillar=pillar, role=role, section_id=section_id)
    section_hint = agent_hint_for_section(section_id)
    preferred = pick_agent_for_task(
        task or "",
        pillar=pillar,
        role=role,
        section_id=section_id,
    )
    return {
        "pillar": pillar,
        "role": role,
        "section_id": section_id,
        "bound_agents": bound,
        "section_hint": section_hint,
        "hub_primary_agent": hub_primary_agent(pillar, role),
        "preferred_agent": preferred if (task or section_id or pillar) else None,
        "cursor_subagent": cursor_subagent_for_pillar(pillar),
    }
