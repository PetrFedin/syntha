"""Route backend agents by Platform Core pillar / role / section context."""

from __future__ import annotations

from app.platform.stack_registry import STACK_CAPABILITIES, get_capability_for_section
from app.agents.section_agent_hints import agent_hint_for_section


def agents_for_platform_context(
    *,
    pillar: str | None = None,
    role: str | None = None,
    section_id: str | None = None,
) -> list[str]:
    """Return agent_ids relevant to a Platform Core cell or section."""
    cap_ids = get_capability_for_section(section_id) if section_id else list(STACK_CAPABILITIES.keys())
    agents: set[str] = set()
    for cap_id in cap_ids:
        meta = STACK_CAPABILITIES[cap_id]
        if pillar and pillar not in meta["pillars"]:
            continue
        if role and role not in meta["roles"]:
            continue
        agents.update(meta["agent_ids"])
    if not agents and pillar and role:
        for meta in STACK_CAPABILITIES.values():
            if pillar in meta["pillars"] and role in meta["roles"]:
                agents.update(meta["agent_ids"])
    return sorted(agents)


def pick_agent_for_task(
    task_description: str,
    *,
    pillar: str | None = None,
    role: str | None = None,
    section_id: str | None = None,
    default: str = "docs",
) -> str:
    """Prefer platform-bound agents when context is provided."""
    bound = agents_for_platform_context(pillar=pillar, role=role, section_id=section_id)
    section_hint = agent_hint_for_section(section_id)
    if section_hint:
        if not bound or section_hint in bound:
            return section_hint
    if not bound:
        return default
    t = task_description.lower()
    if any(
        w in t
        for w in [
            "workshop2",
            "tech pack",
            "techpack",
            "dossier",
            "sample queue",
            "артикул",
            "образец",
            "w2 hub",
        ]
    ):
        for aid in ("product_architect", "architecture_guard", "tech_debt"):
            if aid in bound:
                return aid
    if any(w in t for w in ["linesheet", "line sheet", "range planner", "лайншит", "range-planner"]):
        for aid in ("product_architect", "quota", "content", "lookbook"):
            if aid in bound:
                return aid
    if any(
        w in t
        for w in [
            "procurement",
            "factory-ack",
            "factory ack",
            "production order",
            "handoff",
            "закупка",
            "цех",
            "material request",
        ]
    ):
        for aid in ("order_anomaly", "risk"):
            if aid in bound:
                return aid
    if any(w in t for w in ["tech debt", "todo", "fixme", "stub", "migration", "alembic", "техдолг"]):
        for aid in ("tech_debt", "architecture_guard", "code_quality"):
            if aid in bound:
                return aid
    if any(w in t for w in ["architecture", "boundary", "layer violation", "import violation"]):
        if "architecture_guard" in bound:
            return "architecture_guard"
    if any(w in t for w in ["quality", "ruff", "complexity", "lint", "radon"]):
        if "code_quality" in bound:
            return "code_quality"
    if any(
        w in t
        for w in ["ui", "tailwind", "accessibility", "a11y", "platform core", "dedup", "tsx"]
    ):
        if "ui_improvement" in bound:
            return "ui_improvement"
    if any(w in t for w in ["quota", "allocate", "distribution", "assortment split", "matrix sizes"]):
        for aid in ("quota", "product_architect"):
            if aid in bound:
                return aid
    if any(w in t for w in ["catalog", "product", "sku", "showroom"]):
        for aid in ("product_architect", "market_intelligence", "content"):
            if aid in bound:
                return aid
    if any(w in t for w in ["payment", "stripe", "yukassa", "checkout", "anomaly", "moq"]):
        for aid in ("risk", "order_anomaly"):
            if aid in bound:
                return aid
    if any(w in t for w in ["ai", "llm", "ollama", "forecast", "pricing"]):
        for aid in ("ai_module_curator", "orchestrator", "market_intelligence"):
            if aid in bound:
                return aid
    if any(w in t for w in ["ai module", "ai stack", "ollama", "llm router", "ai routes"]):
        if "ai_module_curator" in bound:
            return "ai_module_curator"
    if any(w in t for w in ["feature gap", "master plan", "missing module", "feature suggestion"]):
        if "feature_suggestion" in bound:
            return "feature_suggestion"
    return bound[0] if bound else default
