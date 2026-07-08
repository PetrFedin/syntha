import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] in ("ok", "degraded")

@pytest.mark.asyncio
async def test_api_v1_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] in ("ok", "degraded")

@pytest.mark.asyncio
async def test_api_v1_root(client: AsyncClient):
    response = await client.get("/api/v1/")
    assert response.status_code == 200
    assert "Welcome to Synth-1 API v1" in response.json()["message"]
