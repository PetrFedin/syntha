import pytest

from app.agents.analysis_agents import (
    architecture_guard_scan_agent,
    code_quality_scan_agent,
    tech_debt_scan_agent,
)
from app.agents.agent_routing_map import task_type_for_agent_id
from app.agents.orchestrator_agent import orchestrator_agent


@pytest.mark.asyncio
async def test_tech_debt_scan_agent_returns_report():
    res = await tech_debt_scan_agent.run("Scan tech debt")
    assert res.agent_name == "TechDebtAgent"
    assert res.task_type == "TECH_DEBT_ITERATION"
    assert res.master_plan_updates
    assert "Technical Debt" in res.master_plan_updates or "Debt" in res.master_plan_updates


@pytest.mark.asyncio
async def test_architecture_guard_scan_agent():
    res = await architecture_guard_scan_agent.run("Check boundaries")
    assert res.task_type == "ARCHITECTURE_GUARD_ITERATION"
    assert "Architecture" in (res.master_plan_updates or "")


@pytest.mark.asyncio
async def test_orchestrator_routes_tech_debt_keyword():
    res = await orchestrator_agent.run("List migration tech debt and TODO stubs")
    assert res.agent_name == "TechDebtAgent"


def test_orchestrator_resolve_task_type_from_hint():
    task_type = orchestrator_agent._resolve_task_type(
        "anything",
        {"platform_agent_hint": "order_anomaly"},
    )
    assert task_type == "ORDER_ANOMALY_ITERATION"


def test_orchestrator_classify_workshop2():
    assert orchestrator_agent._classify_task("workshop2 dossier tech pack") == "PRODUCT_ITERATION"
    assert orchestrator_agent._classify_task("scan tech debt todos") == "TECH_DEBT_ITERATION"


def test_task_type_for_agent_id():
    assert task_type_for_agent_id("tech_debt") == "TECH_DEBT_ITERATION"
    assert task_type_for_agent_id("order_anomaly") == "ORDER_ANOMALY_ITERATION"
