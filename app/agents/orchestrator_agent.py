from typing import Dict, List, Optional

from app.agents.agent_protocols import AgentResult, BaseAgent
from app.agents.agent_routing_map import task_type_for_agent_id
from app.agents.analysis_agents import (
    ai_module_curator_scan_agent,
    architecture_guard_scan_agent,
    code_quality_scan_agent,
    feature_suggestion_scan_agent,
    tech_debt_scan_agent,
    ui_improvement_scan_agent,
)
from app.agents.bugfix_agent import bugfix_agent
from app.agents.code_agent import code_agent
from app.agents.content_agent import content_agent
from app.agents.creative_agents import lookbook_agent, stylist_agent
from app.agents.docs_agent import docs_agent
from app.agents.market_intelligence_agent import market_intelligence_agent
from app.agents.order_anomaly_agent import order_anomaly_agent
from app.agents.product_architect_agent import product_architect_agent
from app.agents.quota_agent import quota_agent
from app.agents.review_agent import review_agent
from app.agents.roadmap_agent import roadmap_agent
from app.agents.risk_agent import risk_agent
from app.agents.stack_routing import agents_for_platform_context, pick_agent_for_task
from app.core.logging import logger


class OrchestratorAgent:
    def __init__(self):
        self.agent_name = "OrchestratorAgent"
        self.agents: Dict[str, BaseAgent] = {
            "DOCS_QUERY": docs_agent,
            "CODE_ITERATION": code_agent,
            "REVIEW_ITERATION": review_agent,
            "BUGFIX_ITERATION": bugfix_agent,
            "PRODUCT_ITERATION": product_architect_agent,
            "INTELLIGENCE_ITERATION": market_intelligence_agent,
            "QUOTA_ITERATION": quota_agent,
            "ROADMAP_ITERATION": roadmap_agent,
            "CONTENT_ITERATION": content_agent,
            "RISK_ITERATION": risk_agent,
            "LOOKBOOK_ITERATION": lookbook_agent,
            "STYLIST_ITERATION": stylist_agent,
            "TECH_DEBT_ITERATION": tech_debt_scan_agent,
            "ARCHITECTURE_GUARD_ITERATION": architecture_guard_scan_agent,
            "CODE_QUALITY_ITERATION": code_quality_scan_agent,
            "UI_IMPROVEMENT_ITERATION": ui_improvement_scan_agent,
            "ORDER_ANOMALY_ITERATION": order_anomaly_agent,
            "AI_MODULE_CURATOR_ITERATION": ai_module_curator_scan_agent,
            "FEATURE_SUGGESTION_ITERATION": feature_suggestion_scan_agent,
        }

    async def run(self, task_description: str, context: Optional[Dict] = None) -> AgentResult:
        ctx = dict(context or {})
        ctx.setdefault("task", task_description)

        platform_agents = agents_for_platform_context(
            pillar=ctx.get("pillar"),
            role=ctx.get("role"),
            section_id=ctx.get("section_id"),
        )
        if platform_agents:
            logger.info(
                "Platform stack agents for pillar=%s role=%s section=%s: %s",
                ctx.get("pillar"),
                ctx.get("role"),
                ctx.get("section_id"),
                platform_agents,
            )
            preferred = pick_agent_for_task(
                task_description,
                pillar=ctx.get("pillar"),
                role=ctx.get("role"),
                section_id=ctx.get("section_id"),
            )
            ctx = {**ctx, "platform_agent_hint": preferred, "platform_agents": platform_agents}

        task_type = self._resolve_task_type(task_description, ctx)
        logger.info("Orchestrator [Task: %s] -> Task Type: %s", task_description, task_type)
        agent = self.agents.get(task_type, docs_agent)
        return await agent.run(task_description, context=ctx)

    def _resolve_task_type(self, task: str, ctx: Dict) -> str:
        hint = ctx.get("platform_agent_hint")
        if isinstance(hint, str):
            mapped = task_type_for_agent_id(hint)
            if mapped and mapped in self.agents:
                return mapped
        return self._classify_task(task)

    def _classify_task(self, task: str) -> str:
        t_low = task.lower()
        if any(w in t_low for w in ["ai module", "ai stack", "ollama wiring", "ai routes", "llm router"]):
            return "AI_MODULE_CURATOR_ITERATION"
        if any(w in t_low for w in ["feature suggestion", "master plan gap", "missing module", "feature gap"]):
            return "FEATURE_SUGGESTION_ITERATION"
        if any(w in t_low for w in ["tech debt", "todo", "fixme", "stub", "migration", "alembic", "техдолг"]):
            return "TECH_DEBT_ITERATION"
        if any(w in t_low for w in ["architecture", "boundary", "layer violation", "import violation"]):
            return "ARCHITECTURE_GUARD_ITERATION"
        if any(w in t_low for w in ["quality", "ruff", "complexity", "radon", "lint scan"]):
            return "CODE_QUALITY_ITERATION"
        if any(w in t_low for w in ["ui", "tailwind", "accessibility", "a11y", "platform core ui", "dedup"]):
            return "UI_IMPROVEMENT_ITERATION"
        if any(w in t_low for w in ["anomaly", "moq", "duplicate order", "out-of-season buy"]):
            return "ORDER_ANOMALY_ITERATION"
        if any(w in t_low for w in ["lookbook", "curate lookbook", "curation"]):
            return "LOOKBOOK_ITERATION"
        if any(w in t_low for w in ["outfit", "stylist", "wear", "suggestion", "style me"]):
            return "STYLIST_ITERATION"
        if any(
            w in t_low
            for w in ["procurement", "factory-ack", "factory ack", "handoff", "закупка", "production order"]
        ):
            return "ORDER_ANOMALY_ITERATION"
        if any(w in t_low for w in ["risk", "mitigation", "logistics", "supply chain"]):
            return "RISK_ITERATION"
        if any(w in t_low for w in ["content", "post", "copywrite", "social", "caption", "instagram"]):
            return "CONTENT_ITERATION"
        if any(w in t_low for w in ["roadmap", "update plan", "sync plan"]):
            return "ROADMAP_ITERATION"
        if any(w in t_low for w in ["quota", "allocate", "distribution", "assortment split"]):
            return "QUOTA_ITERATION"
        if any(w in t_low for w in ["competitor", "market", "joor", "nuorder", "faire", "benchmark"]):
            return "INTELLIGENCE_ITERATION"
        if any(w in t_low for w in ["review", "audit", "verify", "check", "inspect"]):
            return "REVIEW_ITERATION"
        if any(w in t_low for w in ["code", "implement", "create", "module", "add feature", "refactor"]):
            return "CODE_ITERATION"
        if any(w in t_low for w in ["fix", "bug", "error", "issue", "broken", "exception"]):
            return "BUGFIX_ITERATION"
        if any(w in t_low for w in ["explain", "where", "how", "what is", "document", "describe"]):
            return "DOCS_QUERY"
        if any(
            w in t_low
            for w in [
                "product",
                "sku",
                "design",
                "tech pack",
                "techpack",
                "bom",
                "workshop2",
                "dossier",
                "linesheet",
                "артикул",
            ]
        ):
            return "PRODUCT_ITERATION"
        if any(w in t_low for w in ["payment", "stripe", "yukassa", "checkout"]):
            return "RISK_ITERATION"
        return "PRODUCT_ITERATION"

    def list_task_types(self) -> List[str]:
        return list(self.agents.keys())


orchestrator_agent = OrchestratorAgent()
