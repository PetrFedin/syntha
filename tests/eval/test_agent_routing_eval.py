"""Routing eval — no LLM; validates pick_agent + orchestrator classify."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.agents.orchestrator_agent import orchestrator_agent
from app.agents.stack_routing import pick_agent_for_task

CASES_PATH = Path(__file__).with_name("agent_routing_cases.json")


@pytest.fixture(name="routing_cases")
def routing_cases_fixture() -> list[dict]:
    return json.loads(CASES_PATH.read_text(encoding="utf-8"))


@pytest.mark.parametrize("case", json.loads(CASES_PATH.read_text(encoding="utf-8")), ids=lambda c: c["id"])
def test_pick_agent_routing_case(case: dict) -> None:
    if "expect_agent" not in case:
        pytest.skip("classify-only case")
    agent = pick_agent_for_task(
        case["task"],
        pillar=case.get("pillar"),
        role=case.get("role"),
        section_id=case.get("section_id"),
    )
    assert agent == case["expect_agent"]


@pytest.mark.parametrize("case", json.loads(CASES_PATH.read_text(encoding="utf-8")), ids=lambda c: c["id"])
def test_orchestrator_classify_case(case: dict) -> None:
    if "expect_task_type" not in case:
        pytest.skip("routing-only case")
    task_type = orchestrator_agent._classify_task(case["task"])
    assert task_type == case["expect_task_type"]
