"""
Реестр агентов — статус и модуль (детали процесса: docs/AGENT_REGISTRY.md).

Используется для документирования границ и будущей унификации вызовов.
"""

from __future__ import annotations

from enum import Enum
from typing import TypedDict


class AgentLifecycle(str, Enum):
    CORE = "core"
    PHASE_2 = "phase_2"
    EXPERIMENTAL = "experimental"
    DEPRECATED = "deprecated"


class AgentMeta(TypedDict):
    capability: str
    lifecycle: str
    module: str
    wired_in_orchestrator: bool


ORCHESTRATOR_WIRED_AGENT_IDS = frozenset(
    {
        "docs",
        "code",
        "review",
        "bugfix",
        "product_architect",
        "market_intelligence",
        "quota",
        "roadmap",
        "content",
        "risk",
        "lookbook",
        "stylist",
        "tech_debt",
        "architecture_guard",
        "code_quality",
        "ui_improvement",
        "order_anomaly",
        "ai_module_curator",
        "feature_suggestion",
    }
)


def _wired(agent_id: str) -> bool:
    return agent_id in ORCHESTRATOR_WIRED_AGENT_IDS


# agent_id → метаданные (module — import path для ориентира)
AGENT_REGISTRY: dict[str, AgentMeta] = {
    "orchestrator": {
        "capability": "orchestration",
        "lifecycle": AgentLifecycle.CORE.value,
        "module": "app.agents.orchestrator_agent",
        "wired_in_orchestrator": True,
    },
    "review": {
        "capability": "code_review",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.review_agent",
        "wired_in_orchestrator": _wired("review"),
    },
    "bugfix": {
        "capability": "remediation",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.bugfix_agent",
        "wired_in_orchestrator": _wired("bugfix"),
    },
    "docs": {
        "capability": "documentation",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.docs_agent",
        "wired_in_orchestrator": _wired("docs"),
    },
    "code": {
        "capability": "code_generation",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.code_agent",
        "wired_in_orchestrator": _wired("code"),
    },
    "code_quality": {
        "capability": "quality_scan",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.code_quality_agent",
        "wired_in_orchestrator": _wired("code_quality"),
    },
    "content": {
        "capability": "content",
        "lifecycle": AgentLifecycle.EXPERIMENTAL.value,
        "module": "app.agents.content_agent",
        "wired_in_orchestrator": _wired("content"),
    },
    "creative": {
        "capability": "creative",
        "lifecycle": AgentLifecycle.EXPERIMENTAL.value,
        "module": "app.agents.creative_agents",
        "wired_in_orchestrator": False,
    },
    "lookbook": {
        "capability": "creative",
        "lifecycle": AgentLifecycle.EXPERIMENTAL.value,
        "module": "app.agents.creative_agents",
        "wired_in_orchestrator": _wired("lookbook"),
    },
    "stylist": {
        "capability": "creative",
        "lifecycle": AgentLifecycle.EXPERIMENTAL.value,
        "module": "app.agents.creative_agents",
        "wired_in_orchestrator": _wired("stylist"),
    },
    "risk": {
        "capability": "risk",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.risk_agent",
        "wired_in_orchestrator": _wired("risk"),
    },
    "roadmap": {
        "capability": "roadmap",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.roadmap_agent",
        "wired_in_orchestrator": _wired("roadmap"),
    },
    "feature_suggestion": {
        "capability": "features",
        "lifecycle": AgentLifecycle.EXPERIMENTAL.value,
        "module": "app.agents.feature_suggestion_agent",
        "wired_in_orchestrator": _wired("feature_suggestion"),
    },
    "market_intelligence": {
        "capability": "market_intel",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.market_intelligence_agent",
        "wired_in_orchestrator": _wired("market_intelligence"),
    },
    "order_anomaly": {
        "capability": "orders",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.order_anomaly_agent",
        "wired_in_orchestrator": _wired("order_anomaly"),
    },
    "quota": {
        "capability": "quota",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.quota_agent",
        "wired_in_orchestrator": _wired("quota"),
    },
    "ai_module_curator": {
        "capability": "ai_modules",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.ai_module_curator_agent",
        "wired_in_orchestrator": _wired("ai_module_curator"),
    },
    "architecture_guard": {
        "capability": "architecture",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.architecture_guard_agent",
        "wired_in_orchestrator": _wired("architecture_guard"),
    },
    "product_architect": {
        "capability": "product_design",
        "lifecycle": AgentLifecycle.EXPERIMENTAL.value,
        "module": "app.agents.product_architect_agent",
        "wired_in_orchestrator": _wired("product_architect"),
    },
    "tech_debt": {
        "capability": "tech_debt",
        "lifecycle": AgentLifecycle.PHASE_2.value,
        "module": "app.agents.tech_debt_agent",
        "wired_in_orchestrator": _wired("tech_debt"),
    },
    "ui_improvement": {
        "capability": "ui",
        "lifecycle": AgentLifecycle.EXPERIMENTAL.value,
        "module": "app.agents.ui_improvement_agent",
        "wired_in_orchestrator": _wired("ui_improvement"),
    },
}


def list_agents_by_lifecycle(lifecycle: AgentLifecycle) -> dict[str, AgentMeta]:
    return {k: v for k, v in AGENT_REGISTRY.items() if v["lifecycle"] == lifecycle.value}


def list_unwired_agents() -> dict[str, AgentMeta]:
    return {k: v for k, v in AGENT_REGISTRY.items() if not v["wired_in_orchestrator"]}
