"""Optional live LLM eval when Ollama is running (qwen3 / llama3.3)."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

import pytest

from app.agents.order_anomaly_agent import order_anomaly_agent
from app.agents.platform_context import enrich_platform_context
from app.agents.quota_agent import quota_agent
from app.agents.risk_agent import risk_agent


def ollama_available() -> bool:
    base = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    try:
        with urllib.request.urlopen(f"{base}/api/tags", timeout=2) as resp:
            return resp.status == 200
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


PLATFORM_CTX = enrich_platform_context(
    {
        "pillar": "collection_order",
        "role": "shop",
        "section_id": "shop-co-checkout",
        "collectionId": "SS27",
        "orderId": "B2B-DEMO-SHOP1-SS27",
    }
)


@pytest.mark.asyncio
@pytest.mark.integration
@pytest.mark.skipif(not ollama_available(), reason="Ollama not running on :11434")
async def test_risk_agent_ollama_smoke():
    res = await risk_agent.run(
        "YuKassa checkout delay for EU buyers",
        context={**PLATFORM_CTX, "region": "EU"},
    )
    assert res.agent_name == "RiskAgent"
    assert res.code_changes and len(res.code_changes) > 20


@pytest.mark.asyncio
@pytest.mark.integration
@pytest.mark.skipif(not ollama_available(), reason="Ollama not running on :11434")
async def test_order_anomaly_ollama_smoke():
    res = await order_anomaly_agent.run(
        "Unusual MOQ duplicate lines on B2B-DEMO-SHOP1-SS27",
        context=PLATFORM_CTX,
    )
    assert res.agent_name == "OrderAnomalyAgent"
    assert res.code_changes and len(res.code_changes) > 20


@pytest.mark.asyncio
@pytest.mark.integration
@pytest.mark.skipif(not ollama_available(), reason="Ollama not running on :11434")
async def test_quota_agent_ollama_json_smoke():
    res = await quota_agent.run(
        "demo-ss27-01",
        context={**PLATFORM_CTX, "total_quantity": 100, "dealer_kpis": [{"dealer_id": "D1"}, {"dealer_id": "D2"}]},
    )
    assert res.agent_name == "QuotaAgent"
    raw = (res.code_changes or "").strip()
    if raw.startswith("["):
        data = json.loads(raw)
        assert isinstance(data, list)
