"""
Platform stack registry — maps 10 infrastructure capabilities to Platform Core
pillars (5), roles (4), section IDs, backend modules, and AI agents.

Canon: _ai-share/synth-1-full/src/lib/platform-core-hub-matrix.ts
"""

from __future__ import annotations

from enum import Enum
from typing import Literal, TypedDict


class StackCapabilityId(str, Enum):
    POSTGRESQL = "postgresql"
    SQLALCHEMY = "sqlalchemy"
    ALEMBIC = "alembic"
    JWT_AUTH = "jwt_auth"
    USERS = "users"
    PRODUCT_CATALOG = "product_catalog"
    IMAGE_UPLOAD = "image_upload"
    FIREBASE_AUTH = "firebase_auth"
    PAYMENTS = "payments"
    AI_MODULE = "ai_module"


CoreHubPillarId = Literal[
    "development",
    "sample_collection",
    "collection_order",
    "order_production",
    "comms",
]
CoreChainRoleId = Literal["brand", "shop", "manufacturer", "supplier"]


class StackCapabilityMeta(TypedDict):
    title: str
    pillars: list[CoreHubPillarId]
    roles: list[CoreChainRoleId]
    section_ids: list[str]
    backend_modules: list[str]
    frontend_modules: list[str]
    agent_ids: list[str]
    env_keys: list[str]


STACK_CAPABILITIES: dict[StackCapabilityId, StackCapabilityMeta] = {
    StackCapabilityId.POSTGRESQL: {
        "title": "PostgreSQL",
        "pillars": [
            "development",
            "sample_collection",
            "collection_order",
            "order_production",
            "comms",
        ],
        "roles": ["brand", "shop", "manufacturer", "supplier"],
        "section_ids": [
            "brand-dev-pg-sync",
            "brand-co-registry",
            "shop-co-registry",
            "mfr-op-handoff-queue",
            "sup-op-procurement",
            "brand-cm-calendar",
        ],
        "backend_modules": ["app/db/session.py", "app/core/config.py"],
        "frontend_modules": [
            "_ai-share/synth-1-full/src/lib/server/workshop2-pg-pool.ts",
            "_ai-share/synth-1-full/db/migrations/",
        ],
        "agent_ids": ["tech_debt", "order_anomaly"],
        "env_keys": ["DATABASE_URL", "WORKSHOP2_DATABASE_URL"],
    },
    StackCapabilityId.SQLALCHEMY: {
        "title": "SQLAlchemy",
        "pillars": [
            "development",
            "sample_collection",
            "collection_order",
            "order_production",
        ],
        "roles": ["brand", "shop", "manufacturer", "supplier"],
        "section_ids": [
            "brand-dev-dossier",
            "brand-sc-linesheets",
            "shop-co-matrix",
            "mfr-op-production-orders",
        ],
        "backend_modules": [
            "app/db/models/",
            "app/db/repositories/",
            "app/api/deps.py",
        ],
        "frontend_modules": [],
        "agent_ids": ["architecture_guard"],
        "env_keys": ["DATABASE_URL"],
    },
    StackCapabilityId.ALEMBIC: {
        "title": "Alembic migrations",
        "pillars": ["development", "order_production"],
        "roles": ["brand", "manufacturer"],
        "section_ids": ["brand-dev-pg-sync", "mfr-op-dossier"],
        "backend_modules": ["alembic/", "app/db/migrations/"],
        "frontend_modules": ["_ai-share/synth-1-full/db/migrations/"],
        "agent_ids": ["architecture_guard", "tech_debt"],
        "env_keys": ["DATABASE_URL"],
    },
    StackCapabilityId.JWT_AUTH: {
        "title": "JWT authorization",
        "pillars": ["comms"],
        "roles": ["brand", "shop", "manufacturer", "supplier"],
        "section_ids": [
            "brand-cm-order-chat",
            "shop-cm-order-chat",
            "mfr-cm-order",
            "sup-cm-order",
        ],
        "backend_modules": [
            "app/core/security.py",
            "app/api/deps.py",
            "app/api/v1/endpoints/auth.py",
        ],
        "frontend_modules": [
            "_ai-share/synth-1-full/src/lib/auth/",
            "_ai-share/synth-1-full/src/lib/syntha-api-mode.ts",
        ],
        "agent_ids": ["architecture_guard", "risk"],
        "env_keys": ["SECRET_KEY", "ACCESS_TOKEN_EXPIRE_MINUTES"],
    },
    StackCapabilityId.USERS: {
        "title": "Users & organizations",
        "pillars": ["comms", "collection_order"],
        "roles": ["brand", "shop", "manufacturer", "supplier"],
        "section_ids": [
            "brand-co-retailers",
            "shop-sc-partners",
            "brand-cm-section-groups",
        ],
        "backend_modules": [
            "app/db/models/core.py",
            "app/db/repositories/user.py",
            "app/api/v1/endpoints/auth.py",
        ],
        "frontend_modules": [
            "_ai-share/synth-1-full/src/lib/auth/dev-auth-bootstrap.ts",
        ],
        "agent_ids": ["order_anomaly", "architecture_guard"],
        "env_keys": ["AUTH_USE_DB"],
    },
    StackCapabilityId.PRODUCT_CATALOG: {
        "title": "Product catalog",
        "pillars": ["development", "sample_collection", "collection_order"],
        "roles": ["brand", "shop"],
        "section_ids": [
            "brand-dev-w2-hub",
            "brand-sc-linesheets",
            "brand-sc-showroom",
            "shop-sc-showroom",
            "shop-co-matrix",
            "shop-co-checkout",
        ],
        "backend_modules": [
            "app/api/v1/endpoints/product.py",
            "app/api/v1/endpoints/showrooms.py",
            "app/api/v1/endpoints/wholesale.py",
            "app/api/v1/endpoints/plm/routes.py",
            "app/api/v1/endpoints/marketplace.py",
        ],
        "frontend_modules": [
            "_ai-share/synth-1-full/src/app/api/b2b/",
            "_ai-share/synth-1-full/src/lib/b2b/integrations/catalog-summary-source.ts",
        ],
        "agent_ids": [
            "product_architect",
            "market_intelligence",
            "content",
            "lookbook",
            "quota",
        ],
        "env_keys": ["SHOPIFY_SHOP_URL", "SHOPIFY_ACCESS_TOKEN"],
    },
    StackCapabilityId.IMAGE_UPLOAD: {
        "title": "Image & file upload",
        "pillars": ["development", "sample_collection"],
        "roles": ["brand", "manufacturer", "supplier"],
        "section_ids": [
            "brand-dev-w2-hub",
            "brand-dev-dossier",
            "mfr-dev-dossier",
            "sup-dev-bom",
        ],
        "backend_modules": [
            "app/api/v1/endpoints/dam.py",
            "app/api/v1/endpoints/ingestion.py",
            "app/services/storage_backend.py",
        ],
        "frontend_modules": [
            "_ai-share/synth-1-full/docs/W2_TECHPACK_PILOT.md",
            "_ai-share/synth-1-full/src/lib/firebase/config.ts",
        ],
        "agent_ids": ["creative", "lookbook", "stylist"],
        "env_keys": ["MEDIA_UPLOAD_DIR"],
    },
    StackCapabilityId.FIREBASE_AUTH: {
        "title": "Firebase Auth",
        "pillars": ["comms"],
        "roles": ["brand", "shop"],
        "section_ids": ["brand-cm-cabinet", "shop-cm-cabinet"],
        "backend_modules": ["app/api/v1/endpoints/auth.py"],
        "frontend_modules": [
            "_ai-share/synth-1-full/src/lib/firebase/config.ts",
            "_ai-share/synth-1-full/src/lib/firebase/firebase-env.ts",
        ],
        "agent_ids": ["architecture_guard", "order_anomaly"],
        "env_keys": [
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            "FIREBASE_SERVICE_ACCOUNT_JSON",
        ],
    },
    StackCapabilityId.PAYMENTS: {
        "title": "Stripe / ЮKassa",
        "pillars": ["collection_order"],
        "roles": ["brand", "shop"],
        "section_ids": ["shop-co-checkout", "brand-co-detail"],
        "backend_modules": [
            "app/integrations/payment.py",
            "app/integrations/yukassa.py",
            "app/integrations/stripe_client.py",
            "app/api/v1/endpoints/fintech.py",
        ],
        "frontend_modules": [
            "_ai-share/synth-1-full/src/lib/production/workshop2-yukassa-stub.ts",
            "_ai-share/synth-1-full/src/lib/production/workshop2-stripe-stub.ts",
            "_ai-share/synth-1-full/src/app/api/integrations/payments/",
        ],
        "agent_ids": ["risk", "order_anomaly"],
        "env_keys": [
            "YUKASSA_SHOP_ID",
            "YUKASSA_SECRET_KEY",
            "STRIPE_SECRET_KEY",
            "TINKOFF_TERMINAL_KEY",
        ],
    },
    StackCapabilityId.AI_MODULE: {
        "title": "AI (Ollama / OpenAI)",
        "pillars": ["development", "sample_collection", "collection_order"],
        "roles": ["brand", "shop"],
        "section_ids": [
            "brand-dev-range",
            "shop-sc-matrix-entry",
            "shop-co-buyer-tracking",
        ],
        "backend_modules": [
            "app/ai/llm_client.py",
            "app/ai/llm_router.py",
            "app/api/v1/endpoints/ai_routes.py",
            "app/agents/",
        ],
        "frontend_modules": [
            "_ai-share/synth-1-full/src/lib/b2b/ai/",
        ],
        "agent_ids": [
            "orchestrator",
            "content",
            "market_intelligence",
            "product_architect",
            "ai_module_curator",
            "feature_suggestion",
            "lookbook",
            "stylist",
            "risk",
            "roadmap",
            "ui_improvement",
            "tech_debt",
        ],
        "env_keys": [
            "LLM_PROVIDER",
            "OLLAMA_BASE_URL",
            "OLLAMA_MODEL",
            "OPENAI_API_KEY",
            "GEMINI_API_KEY",
        ],
    },
}

# section_id → capabilities (for BFF / comms routing)
_SECTION_INDEX: dict[str, list[StackCapabilityId]] = {}
for cap_id, meta in STACK_CAPABILITIES.items():
    for sid in meta["section_ids"]:
        _SECTION_INDEX.setdefault(sid, []).append(cap_id)


def get_sections_for_capability(cap_id: StackCapabilityId) -> list[str]:
    return list(STACK_CAPABILITIES[cap_id]["section_ids"])


def get_capability_for_section(section_id: str) -> list[StackCapabilityId]:
    return list(_SECTION_INDEX.get(section_id, []))


def get_agents_for_capability(cap_id: StackCapabilityId) -> list[str]:
    return list(STACK_CAPABILITIES[cap_id]["agent_ids"])
