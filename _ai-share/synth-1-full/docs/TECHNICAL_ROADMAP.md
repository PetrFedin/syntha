# Technical Roadmap — Post Phase 20

**Prerequisite:** No new user features until Phase 24 complete.  
**Branch strategy:** `platform-core-v1-*` incremental PRs.

---

## Phase 21 — Closure & dedup (P0)

| Task | Deliverable |
|------|-------------|
| Middleware `/shop/b2b-orders` redirect | middleware.ts |
| Merge duplicate BFF message-templates prefix | one route tree |
| Remove 12 `@/_archive` imports from platform components | ports or stubs |
| Unify snapshot types (ChainPillarSnap ↔ pillar-snapshot) | single types file |
| Delete or wire 5 unused platform-core hooks | hook cleanup |
| Document FastAPI orders as read-only for PC | DATA_MODEL + ADR amendment |

**Exit:** boundaries test green; typecheck; no archive imports in platform/

---

## Phase 22 — Standardization

| Task | Deliverable |
|------|-------------|
| `PlatformCoreSpinePeerStripShell` — replace ~60 PeerStrips | shared component |
| Split `CollectionOrderPillarCard` brand/shop like Phase 19 | pillars/ |
| Collapse `lib/b2b/*` re-exports — ports only | import audit CI |
| Split `platform-core-hub-matrix.ts` (demo-hrefs vs runtime) | smaller baseline |
| Create `components/platform/shared/` for 2+ use components | folder + lint rule |
| FastAPI `/product` rename/isolate from Article | backend label |

**Exit:** top-10 file size <500 LOC; hub-matrix baseline <400 LOC

---

## Phase 23 — Hardening

| Task | Deliverable |
|------|-------------|
| Dossier JSON schema validation on write | zod/ajv in dossier repo |
| Entity relationship diagram in docs | DATA_MODEL update |
| Expand boundaries test: no factory in baseline paths grep | CI |
| Strict TypeScript on readiness audits | reduce any |
| E2E golden path matrix 5×4 full green | core-104 |

**Exit:** VERIFICATION.md; quality score ≥8 all areas

---

## Phase 24 — Foundation complete

| Task | Deliverable |
|------|-------------|
| Delete LEGACY_ROUTES pages confirmed by e2e | archive move |
| `routes.ts` factory section = re-export extended only | DRY |
| PLATFORM_CORE_MANIFEST v2 sign-off | stakeholder review |
| Enable default `PLATFORM_CORE_BASELINE=true` in prod config | ops runbook |

**Exit:** New features allowed only as extensions per CONTRACT §9

---

## Phase 25+ (future extensions — not now)

- Stripe/ЮKassa production wiring (existing stubs)
- AI agent autonomous planner (dev API → prod gate)
- International multi-brand org hierarchy
- Mobile factory floor tablet (already partial in extended)

Each requires: ADR + manifest promotion + extension ring only.
