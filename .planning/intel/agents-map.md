# Agents map (Fashion OS / SYNTHA)

Generated: 2026-06-21 01:53 UTC

Refresh: `npm run agent:intel:refresh` (also `/gsd-intel refresh`).

## Layers

| Layer | Entry |
|-------|-------|
| Backend registry | `app/agents/registry.py` |
| Orchestrator | `app/agents/orchestrator_agent.py` → `POST /api/v1/ai/task` |
| Dev bridge (Platform Core) | `POST /api/dev/platform-ai/task` → `/api/v1/ai/task/dev` |
| Stack routing | `app/agents/stack_routing.py`, `app/platform/stack_registry.py` |
| Hub matrix API | `GET /api/v1/platform/stack/agents/routing` |
| Planner queue | `_ai-share/synth-1-full/.../platform-core-planner-agent.ts` |
| Cursor subagents | `.cursor/agents/syntha-*.md` |

## Orchestrator task types (wired)

- `AI_MODULE_CURATOR_ITERATION`
- `ARCHITECTURE_GUARD_ITERATION`
- `BUGFIX_ITERATION`
- `CODE_ITERATION`
- `CODE_QUALITY_ITERATION`
- `CONTENT_ITERATION`
- `FEATURE_SUGGESTION_ITERATION`
- `INTELLIGENCE_ITERATION`
- `LOOKBOOK_ITERATION`
- `ORDER_ANOMALY_ITERATION`
- `PRODUCT_ITERATION`
- `QUOTA_ITERATION`
- `REVIEW_ITERATION`
- `RISK_ITERATION`
- `ROADMAP_ITERATION`
- `STYLIST_ITERATION`
- `TECH_DEBT_ITERATION`
- `UI_IMPROVEMENT_ITERATION`

## Registry

| agent_id | lifecycle | wired | module |
|----------|-----------|-------|--------|
| `ai_module_curator` | phase_2 | yes | `app.agents.ai_module_curator_agent` |
| `architecture_guard` | phase_2 | yes | `app.agents.architecture_guard_agent` |
| `bugfix` | phase_2 | yes | `app.agents.bugfix_agent` |
| `code` | phase_2 | yes | `app.agents.code_agent` |
| `code_quality` | phase_2 | yes | `app.agents.code_quality_agent` |
| `content` | experimental | yes | `app.agents.content_agent` |
| `creative` | experimental | no | `app.agents.creative_agents` |
| `docs` | phase_2 | yes | `app.agents.docs_agent` |
| `feature_suggestion` | experimental | yes | `app.agents.feature_suggestion_agent` |
| `lookbook` | experimental | yes | `app.agents.creative_agents` |
| `market_intelligence` | phase_2 | yes | `app.agents.market_intelligence_agent` |
| `orchestrator` | core | yes | `app.agents.orchestrator_agent` |
| `order_anomaly` | phase_2 | yes | `app.agents.order_anomaly_agent` |
| `product_architect` | experimental | yes | `app.agents.product_architect_agent` |
| `quota` | phase_2 | yes | `app.agents.quota_agent` |
| `review` | phase_2 | yes | `app.agents.review_agent` |
| `risk` | phase_2 | yes | `app.agents.risk_agent` |
| `roadmap` | phase_2 | yes | `app.agents.roadmap_agent` |
| `stylist` | experimental | yes | `app.agents.creative_agents` |
| `tech_debt` | phase_2 | yes | `app.agents.tech_debt_agent` |
| `ui_improvement` | experimental | yes | `app.agents.ui_improvement_agent` |

Unwired: `creative`


## Hub: pillar × role → primary backend agent

| Pillar | Brand | Shop | Manufacturer | Supplier | Cursor subagent |
|--------|-------|------|--------------|----------|-----------------|
| `development` | product_architect | — | — | product_architect | `syntha-w2-development` |
| `sample_collection` | product_architect | product_architect | — | — | `syntha-sample-collection` |
| `collection_order` | risk | order_anomaly | — | — | `syntha-b2b-order` |
| `order_production` | — | — | order_anomaly | order_anomaly | `syntha-factory-production` |
| `comms` | architecture_guard | architecture_guard | — | — | `syntha-comms` |

## Section hints (SECTION_AUDIT → agent_id)

- `brand-cm-calendar` → `architecture_guard`
- `brand-cm-order-chat` → `architecture_guard`
- `brand-co-registry` → `order_anomaly`
- `brand-co-retailers` → `order_anomaly`
- `brand-dev-cabinet` → `product_architect`
- `brand-dev-dossier` → `product_architect`
- `brand-dev-pg-sync` → `tech_debt`
- `brand-dev-range` → `quota`
- `brand-dev-w2-hub` → `product_architect`
- `brand-sc-linesheets` → `product_architect`
- `brand-sc-showroom` → `content`
- `mfr-cm-order` → `architecture_guard`
- `mfr-dev-dossier` → `lookbook`
- `mfr-op-handoff-queue` → `order_anomaly`
- `mfr-op-production-orders` → `order_anomaly`
- `shop-cm-order-chat` → `architecture_guard`
- `shop-co-buyer-tracking` → `order_anomaly`
- `shop-co-checkout` → `order_anomaly`
- `shop-co-detail` → `risk`
- `shop-co-matrix` → `quota`
- `shop-co-registry` → `order_anomaly`
- `shop-sc-matrix-entry` → `quota`
- `shop-sc-showroom` → `product_architect`
- `sup-cm-order` → `architecture_guard`
- `sup-dev-bom` → `product_architect`
- `sup-op-procurement` → `order_anomaly`

## Platform Core AI strips (UI → backend)

| testid | section | agent |
|--------|---------|-------|
| `brand-co-registry-ai-anomaly` | brand-co-registry | order_anomaly |
| `shop-co-matrix-quota-ai` | shop-co-matrix | quota |
| `shop-co-registry-ai-anomaly` | shop-co-registry | order_anomaly |
| `mfr-op-handoff-queue-ai-anomaly` | mfr-op-handoff-queue | order_anomaly |
| `planner-ui-improvement-ai` | brand-dev-cabinet | ui_improvement |

## Eval

- `npm run agent:eval:routing`
- `npm run agent:eval:ollama` (Ollama :11434)

## Not AI agents

B2B `ShopAgentRep*` / `BrandAgentRep*` — торговый представитель, не backend agent.
