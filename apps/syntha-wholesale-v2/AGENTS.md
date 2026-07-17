# AGENTS.md — Syntha Wholesale V2

Scope: `apps/syntha-wholesale-v2`.

Read `CURSOR_START_HERE.md` first.

Core lifecycle: Campaign → Collection → Showroom → Selection → Order Builder → Order → confirmation → DealSpace.

Brand and Shop are organisation types. Roles belong to organisations.

Calendar and DealSpace are core. PLM, production, BOM, QC and supply chain are outside MVP.

Cross-module imports go only through `public.ts`. Boundary changes require an ADR.
