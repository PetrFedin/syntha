# lib/b2b — canonical structure (Phase 21)

## Rule

Platform Core **must not** import `@/lib/b2b/*` directly from UI. Use **`@/lib/platform-core-ports/b2b/*`** re-exports.

## Layout

| Layer | Path | Purpose |
|-------|------|---------|
| **Ports (facade)** | `src/lib/platform-core-ports/b2b/*.ts` | Stable API for Platform Core — thin `export * from '@/lib/b2b/...'` |
| **Implementation** | `src/lib/b2b/**` | Domain helpers, feeds, workspace builders |
| **Server repos** | `src/lib/server/*-repository.ts` | PG persistence; may import `@/lib/b2b` types |
| **Legacy integrations** | `src/lib/b2b/integrations/archive/*` | JOOR etc. — not Platform Core baseline |

## Duplication policy

- One helper → one file under `lib/b2b/`; ports re-export only.
- Do not duplicate href builders: prefer `brand-collection-order-hrefs.ts` / `shop-collection-order-hrefs.ts`.
- Wave-specific stubs (`*-wave-*.ts`) stay until merged into workspace modules — tracked in TECHNICAL_ROADMAP P2.

## Phase 21 outcome

No behavior change. Ports layer confirmed as canonical boundary; direct `lib/b2b` imports outside ports/server remain in non-core modules only.
