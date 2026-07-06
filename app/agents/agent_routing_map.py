"""Map registry agent_id → orchestrator task_type keys."""

from __future__ import annotations

AGENT_ID_TO_TASK_TYPE: dict[str, str] = {
    "docs": "DOCS_QUERY",
    "code": "CODE_ITERATION",
    "review": "REVIEW_ITERATION",
    "bugfix": "BUGFIX_ITERATION",
    "product_architect": "PRODUCT_ITERATION",
    "market_intelligence": "INTELLIGENCE_ITERATION",
    "quota": "QUOTA_ITERATION",
    "roadmap": "ROADMAP_ITERATION",
    "content": "CONTENT_ITERATION",
    "risk": "RISK_ITERATION",
    "lookbook": "LOOKBOOK_ITERATION",
    "stylist": "STYLIST_ITERATION",
    "tech_debt": "TECH_DEBT_ITERATION",
    "architecture_guard": "ARCHITECTURE_GUARD_ITERATION",
    "code_quality": "CODE_QUALITY_ITERATION",
    "ui_improvement": "UI_IMPROVEMENT_ITERATION",
    "order_anomaly": "ORDER_ANOMALY_ITERATION",
    "ai_module_curator": "AI_MODULE_CURATOR_ITERATION",
    "feature_suggestion": "FEATURE_SUGGESTION_ITERATION",
    "orchestrator": "DOCS_QUERY",
}


def task_type_for_agent_id(agent_id: str) -> str | None:
    return AGENT_ID_TO_TASK_TYPE.get(agent_id)
