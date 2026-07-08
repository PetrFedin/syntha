"""
MVP contract smoke — endpoints from docs/MVP_CONTRACT.md.
Marked smoke_core for scripts/run-core-smoke.sh (fast pre-push check).
"""
import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.smoke_core

BRAND_DEMO_ID = "demo"


@pytest.mark.asyncio
async def test_mvp_health_endpoints(client: AsyncClient):
    for path in ("/health", "/api/v1/health"):
        response = await client.get(path)
        assert response.status_code == 200
        assert response.json()["status"] in ("ok", "degraded")


@pytest.mark.asyncio
async def test_mvp_auth_login(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login/access-token",
        data={"username": "brand_admin@synth1.com", "password": "securepassword"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body.get("access_token")
    assert body.get("token_type") == "bearer"


@pytest.mark.asyncio
async def test_mvp_dashboard(client: AsyncClient):
    login = await client.post(
        "/api/v1/auth/login/access-token",
        data={"username": "brand_admin@synth1.com", "password": "securepassword"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = await client.get("/api/v1/dashboard/", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert "kpis" in data


@pytest.mark.asyncio
async def test_mvp_search(client: AsyncClient):
    login = await client.post(
        "/api/v1/auth/login/access-token",
        data={"username": "brand_admin@synth1.com", "password": "securepassword"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = await client.get("/api/v1/search/", params={"q": "production"}, headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)


@pytest.mark.asyncio
async def test_mvp_brand_profile(client: AsyncClient):
    response = await client.get(f"/api/v1/brand/profile/{BRAND_DEMO_ID}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data.get("brand", {}).get("id") == BRAND_DEMO_ID


@pytest.mark.asyncio
async def test_mvp_brand_dashboard(client: AsyncClient):
    response = await client.get(f"/api/v1/brand/dashboard/{BRAND_DEMO_ID}")
    assert response.status_code == 200
    assert response.json()["data"]


@pytest.mark.asyncio
async def test_mvp_brand_integrations_status(client: AsyncClient):
    response = await client.get(f"/api/v1/brand/integrations/status/{BRAND_DEMO_ID}")
    assert response.status_code == 200
    assert response.json()["data"]
