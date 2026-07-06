"""Dev AI task endpoint — no auth in development."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.agents.agent_protocols import AgentResult
from app.main import app


@pytest.mark.asyncio
async def test_ai_task_dev_routes_to_scan_agent():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/ai/task/dev",
            json={
                "task": "Scan migration tech debt TODO stubs in platform core",
                "context": {
                    "pillar": "development",
                    "role": "brand",
                    "section_id": "brand-dev-pg-sync",
                },
            },
        )
    assert res.status_code == 200
    body = res.json()
    data = body.get("data") or body
    assert data["agent"]
    assert "TECH_DEBT" in data["task_type"] or data["task_type"] == "TECH_DEBT_ITERATION"


@pytest.mark.asyncio
async def test_ai_task_dev_order_anomaly_context():
    stub = AgentResult(
        agent_name="OrderAnomalyAgent",
        task_type="ORDER_ANOMALY_ITERATION",
        files_used=[],
        changes_proposed=["Order anomaly analysis"],
        code_changes="No duplicate MOQ lines detected.",
        next_step="Review registry",
    )
    with patch(
        "app.api.v1.endpoints.ai_routes.orchestrator_agent.run",
        new=AsyncMock(return_value=stub),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post(
                "/api/v1/ai/task/dev",
                json={
                    "task": "Detect MOQ duplicate lines on B2B-DEMO-SHOP1-SS27",
                    "context": {
                        "pillar": "collection_order",
                        "role": "brand",
                        "section_id": "brand-co-registry",
                        "orderId": "B2B-DEMO-SHOP1-SS27",
                        "collectionId": "SS27",
                    },
                },
            )
    assert res.status_code == 200
    data = res.json().get("data") or res.json()
    assert data["agent"] == "OrderAnomalyAgent"
