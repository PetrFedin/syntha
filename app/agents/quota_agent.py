from typing import Optional, List, Dict
from app.agents.agent_protocols import BaseAgent, AgentResult

class QuotaAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="QuotaAgent",
            task_type="QUOTA_ITERATION",
            system_prompt="You are an AI Inventory Planner for Synth-1. Your goal is to distribute stock quotas among dealers based on their KPI and demand."
        )

    def _build_prompt(self, task: str, context: Optional[dict]) -> str:
        from app.agents.platform_context import platform_context_summary

        dealer_kpis = context.get("dealer_kpis", []) if context else []
        total = context.get("total_quantity", 100)
        kpi_list = [{"dealer_id": getattr(k, "dealer_id", k)} for k in dealer_kpis] if dealer_kpis else []
        platform = platform_context_summary(context or {})
        platform_line = f" Platform: {platform}." if platform else ""
        return (
            f"Allocate total {total} units of SKU {task} among dealers: {kpi_list}.{platform_line} "
            "Return ONLY valid JSON array: [{\"dealer_id\": \"D1\", \"quantity\": 50}, ...]. "
            "Sum of quantities must equal total. No markdown, no explanation."
        )

    def _format_result(self, task: str, response: str) -> AgentResult:
        res = super()._format_result(task, response)
        res.changes_proposed = ["AI-driven quota distribution proposed"]
        res.code_changes = response # reuse for JSON data
        res.next_step = "Confirm allocations with Admin or automate based on confidence"
        return res

quota_agent = QuotaAgent()
