from typing import Optional, List, Dict
from app.agents.agent_protocols import BaseAgent, AgentResult

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="RiskAgent",
            task_type="RISK_ITERATION",
            system_prompt=(
                "You are an AI Global Logistics Risk Analyst for Synth-1. Your goal is to identify and mitigate logistical risks. "
                "Analyze regions, impact scores, and propose mitigation plans."
            ),
            max_tokens=800,
            temperature=0.3
        )

    def _build_prompt(self, task: str, context: Optional[dict]) -> str:
        from app.agents.platform_context import platform_context_summary

        region = context.get("region", "Global") if context else "Global"
        additional_info = context.get("context", "") if context else ""
        platform = platform_context_summary(context or {})
        platform_line = f" Platform context: {platform}." if platform else ""

        return (
            f"Analyze risks in region {region}.{platform_line} "
            f"Additional context: {additional_info}. "
            f"Task: {task}. "
            f"Provide identified risk level, impact score (0.0 to 10.0), a concise description, and a mitigation plan."
        )

    def _format_result(self, task: str, response: str) -> AgentResult:
        res = super()._format_result(task, response)
        res.changes_proposed = [f"Global Logistics Risk analysis completed for {task}"]
        res.code_changes = response # Reuse for analysis output
        res.next_step = "Review risk level and activate mitigation plans"
        return res

risk_agent = RiskAgent()
