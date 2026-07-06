"""AI Order Insights agent (RepSpark): finds anomalies in orders."""
from typing import Optional, List, Dict, Any
from app.agents.agent_protocols import BaseAgent, AgentResult


class OrderAnomalyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="OrderAnomalyAgent",
            task_type="ORDER_ANOMALY",
            system_prompt=(
                "You are an AI Order Analyst for B2B fashion. Detect anomalies: unusual quantities, "
                "price deviations, duplicate orders, out-of-season buys, MOQ violations."
            ),
            max_tokens=600,
            temperature=0.2,
        )

    def _build_prompt(self, task: str, context: Optional[dict]) -> str:
        from app.agents.platform_context import platform_context_summary

        order_summary = ""
        if context:
            orders = context.get("orders", [])
            if orders:
                order_summary = f"Orders sample: {orders[:5]}"
            platform = platform_context_summary(context)
            if platform:
                order_summary = f"{order_summary} Platform: {platform}".strip()
            elif not order_summary:
                order_summary = str(context)
        return f"Analyze orders for anomalies. {task}. {order_summary}"

    def _format_result(self, task: str, response: str) -> AgentResult:
        res = super()._format_result(task, response)
        res.changes_proposed = [f"Order anomaly analysis: {task}"]
        res.code_changes = response
        res.next_step = "Review anomalies and contact buyers if needed"
        return res


order_anomaly_agent = OrderAnomalyAgent()
