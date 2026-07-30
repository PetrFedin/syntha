# AGENTS.md — Syntha Wholesale V2

Scope: `apps/syntha-wholesale-v2`.

Read `CURSOR_START_HERE.md` first.

Core lifecycle: Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace.

Brand and Shop are organisation types. Roles belong to organisations.

Current implementation scope is the wholesale transaction core. PLM, production, BOM, QC and supply chain remain outside v2 until the core lifecycle, persistence and integration tests are stable.

Cross-module imports go only through each target module's `public.mjs`. Boundary changes require an ADR.

Every mutation requires an idempotency `commandId`, emits immutable domain events and must have automated tests. Run `npm run v2:verify` before publishing changes.
