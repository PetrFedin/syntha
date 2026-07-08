import os

import pytest

pytestmark = pytest.mark.skipif(
    os.environ.get("CI") == "true" and not os.environ.get("OLLAMA_BASE_URL"),
    reason="Agent LLM tests need Ollama in CI or run outside CI",
)
from app.agents.orchestrator_agent import orchestrator_agent
from app.agents.docs_agent import docs_agent
from app.agents.code_agent import code_agent
from app.agents.review_agent import review_agent

@pytest.mark.asyncio
async def test_orchestrator_routing():
    # 1. Test DOCS_QUERY routing
    res = await orchestrator_agent.run("Explain the project structure.")
    assert res.agent_name == "DocsAgent"
    
    # 2. Test CODE_ITERATION routing
    res = await orchestrator_agent.run("Implement a new feature for brand OS.")
    assert res.agent_name == "CodeAgent"
    
    # 3. Test REVIEW_ITERATION routing
    res = await orchestrator_agent.run("Review the recent code changes.")
    assert res.agent_name == "ReviewAgent"

    # 4. Test BUGFIX_ITERATION routing
    res = await orchestrator_agent.run("Fix the error in config.py")
    assert res.agent_name == "BugfixAgent"

    # 5. Test PRODUCT_ITERATION routing
    res = await orchestrator_agent.run("Suggest a new loyalty feature for customers.")
    assert res.agent_name == "ProductArchitectAgent"

    # 6. Test INTELLIGENCE_ITERATION routing
    res = await orchestrator_agent.run("What are JOOR latest features?")
    assert res.agent_name == "MarketIntelligenceAgent"

@pytest.mark.asyncio
async def test_docs_agent():
    res = await docs_agent.run("Explain PLM module.")
    assert res.agent_name == "DocsAgent"
    assert res.task_type == "DOCS_QUERY"

@pytest.mark.asyncio
async def test_code_agent():
    res = await code_agent.run("Create a new API route.")
    assert res.agent_name == "CodeAgent"
    assert res.task_type == "CODE_ITERATION"

@pytest.mark.asyncio
async def test_review_agent():
    res = await review_agent.run("Check code for duplication.")
    assert res.agent_name == "ReviewAgent"
    assert res.task_type == "REVIEW_ITERATION"
