"""Scan-based agents (static analysis, no LLM) for orchestrator routing."""

from __future__ import annotations

from typing import Callable, Optional

from app.agents.agent_protocols import AgentResult, BaseAgent
from app.agents.architecture_guard_agent import ArchitectureGuardAgent
from app.agents.code_quality_agent import CodeQualityAgent
from app.agents.tech_debt_agent import TechDebtAgent
from app.agents.ui_improvement_agent import UIImprovementAgent
from app.agents.ai_module_curator_agent import AIModuleCuratorAgent
from app.agents.feature_suggestion_agent import FeatureSuggestionAgent


class ScanAgent(BaseAgent):
    """Runs a local scan function and returns structured AgentResult."""

    def __init__(
        self,
        name: str,
        task_type: str,
        scan: Callable[[], str],
        *,
        next_step: str = "Triage findings and claim matching planner tasks",
    ):
        super().__init__(name=name, task_type=task_type, system_prompt="")
        self._scan = scan
        self._next_step = next_step

    async def run(self, task_description: str, context: Optional[dict] = None) -> AgentResult:
        report = self._scan()
        preview = report if len(report) <= 1200 else f"{report[:1200]}…"
        return AgentResult(
            agent_name=self.agent_name,
            task_type=self.task_type,
            files_used=[],
            changes_proposed=[preview],
            master_plan_updates=report,
            next_step=self._next_step,
        )


tech_debt_scan_agent = ScanAgent(
    "TechDebtAgent",
    "TECH_DEBT_ITERATION",
    lambda: TechDebtAgent().detect_debt(),
    next_step="Open P0 planner items for TODO/stub/migration gaps",
)

architecture_guard_scan_agent = ScanAgent(
    "ArchitectureGuardAgent",
    "ARCHITECTURE_GUARD_ITERATION",
    lambda: ArchitectureGuardAgent().check_boundaries(),
    next_step="Fix boundary violations before new features",
)

code_quality_scan_agent = ScanAgent(
    "CodeQualityAgent",
    "CODE_QUALITY_ITERATION",
    lambda: CodeQualityAgent().analyze(),
    next_step="Run ruff/radon locally on flagged modules",
)

ui_improvement_scan_agent = ScanAgent(
    "UIImprovementAgent",
    "UI_IMPROVEMENT_ITERATION",
    lambda: UIImprovementAgent().analyze_ui_code(),
    next_step="Apply platform-core-ui-dedup rules on flagged TSX",
)

ai_module_curator_scan_agent = ScanAgent(
    "AIModuleCuratorAgent",
    "AI_MODULE_CURATOR_ITERATION",
    lambda: AIModuleCuratorAgent().evaluate_ai_stack(),
    next_step="Wire missing AI services in ai_routes.py",
)

feature_suggestion_scan_agent = ScanAgent(
    "FeatureSuggestionAgent",
    "FEATURE_SUGGESTION_ITERATION",
    lambda: FeatureSuggestionAgent().analyze_missing_features(),
    next_step="Add P1 planner items for top MASTER_PLAN gaps",
)
