import pytest
from httpx import AsyncClient
from app.core.config import settings

@pytest.mark.asyncio
async def test_multitenancy_filtering(client: AsyncClient):
    # 1. Login to get token
    login_data = {
        "username": "architect@synth1.com",
        "password": "securepassword"
    }
    response = await client.post("/api/v1/auth/login/access-token", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Try to get proposals (should be empty for new user)
    response = await client.get("/api/v1/product/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

    # 3. Create a proposal
    # Note: Using params as the endpoint was defined with individual args
    create_params = {"task": "Build AI Assortment"}
    response = await client.post("/api/v1/product/propose", params=create_params, headers=headers)
    if response.status_code == 503:
        pytest.skip("product propose requires LLM (Ollama) in CI")
    assert response.status_code == 200
    proposal = response.json()
    assert proposal["organization_id"] is not None # organization_id should be set from user

    # 4. Get proposals again - should see the one we created
    response = await client.get("/api/v1/product/", headers=headers)
    assert response.status_code == 200
    proposals = response.json()
    assert len(proposals) >= 1
    assert any(p["id"] == proposal["id"] for p in proposals)
