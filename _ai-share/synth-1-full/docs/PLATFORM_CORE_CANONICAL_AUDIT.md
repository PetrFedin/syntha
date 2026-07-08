# Platform Core Canonical Audit — Phase 20

**Вопрос:** Есть ли второй источник истины?  
**Ответ:** Да — **контролируемый split-brain**. Canonical для golden path = W2 PG + Next BFF. Parallel = FastAPI `/api/v1` + `lib/b2b|production` (archive).

## Article

| | Path |
|---|------|
| **Canonical** | `workshop2_articles` + `workshop2_dossiers`; ports: `dossier-store.ts`; UI: `/brand/core?pillar=development` |
| **Duplicate** | `lib/production/workshop2-phase1-dossier-*`; FastAPI `/product` (AI proposals, not Article) |
| **Merge** | Single write via W2 repos; FastAPI read-only label; file fallback dev-only |

## Sample

| | Path |
|---|------|
| **Canonical** | `workshop2_sample_orders`; port `sample-orders.ts` |
| **Duplicate** | FastAPI SampleOrder; demo seeds in production lib |
| **Merge** | Port-only access from UI |

## Collection

| | Path |
|---|------|
| **Canonical** | `workshop2_collections` |
| **Duplicate** | CollectionDrop (FastAPI); range overlays |
| **Merge** | Collections table = master |

## Wholesale Order

| | Path |
|---|------|
| **Canonical** | `workshop2_b2b_orders`; port `b2b-orders.ts` |
| **Duplicate** | FastAPI Order; entire `lib/b2b/*` matrix |
| **Merge** | W2 write; collapse b2b lib into ports (Phase 22) |

## Fulfillment / Production

| | Path |
|---|------|
| **Canonical** | W2 lifecycle + handoff in pillar snapshot / spine |
| **Duplicate** | Factory UI components; FastAPI factory routes |
| **Merge** | Extended role only; baseline peer hrefs as literals |

## Communication

| | Path |
|---|------|
| **Canonical** | `workshop2_contextual_messages`; BFF `/api/platform-core/comms/*` |
| **Duplicate** | FastAPI collaboration; brand messages PG (archive) |
| **Merge** | Contextual PG + entity thread templates |

## Verdict

**Один canonical implementation** существует для spine, но **требует дисциплины импортов** и завершения merge archive layers. См. ADR-001…005, `PLATFORM_CORE_CONTRACT.md`.

---

## Phase 21 stabilization (2026-07-08)

| Item | Status |
|------|--------|
| Split-brain documented | `docs/FASTAPI_PLATFORM_CORE_WRITE_REGISTRY.md` |
| Archive imports in `components/platform` | **0** — moved to `shared/legacy-peer-strips/` |
| BFF message-templates duplicate | Legacy route re-exports canonical; middleware 308 |
| Route `/shop/b2b-orders` | Middleware → `/shop/b2b/orders` |
| Chain snapshot types | Canonical: `platform-core-chain-snapshot.types.ts` |
| Hub matrix split | `hub-matrix-peers.ts` (209 LOC), `hub-matrix-demo-rewrite.ts` (92 LOC); main **425 LOC** (was 646) |
| Peer strip shell | `PlatformCoreSpinePeerStripShell` — BrandCm + ShopCm migrated |
| lib/b2b canon | `docs/B2B_LIB_CANON.md` — ports facade, no merge behavior change |
| Guard tests | `platform-core-guards.test.ts` + expanded boundaries |

**Quality score (post Phase 21):** 8.1 / 10 overall (↑ from 7.2)

**Remaining P2 (not Phase 21 scope):** giant workspace coordinators (~800+ LOC), full PeerStrip dedup (~60→shell), FastAPI 405 middleware, lib/b2b wave file merges.
