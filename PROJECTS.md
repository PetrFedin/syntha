# Syntha repository projects

This repository contains two different products. They must not be treated as one application.

## 1. Syntha Legacy / Fashion OS

Status: maintenance and source library.

Canonical paths:

- `_ai-share/synth-1-full/` — legacy Next.js product and its archived modules;
- `app/` — legacy FastAPI backend;
- `alembic/`, `tests/`, `static/` — legacy backend infrastructure and tests;
- `_platform-core-split/` — historical Platform Core extraction materials.

Purpose:

- preserve previous Fashion OS work;
- provide reusable domain knowledge, UI patterns and migration sources;
- receive only critical fixes, security fixes and explicitly approved migrations.

Legacy code is not the default implementation target for new Wholesale V2 features.

## 2. Syntha Wholesale V2

Status: active product development.

Canonical path:

- `apps/syntha-wholesale-v2/`

Product goal:

Build a modern B2B fashion wholesale operating platform that is materially better for brands and retailers than existing wholesale portals.

Core lifecycle:

Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace.

Core product areas:

- organisations, memberships, roles and permissions;
- brands, retailers and commercial relationships;
- campaigns and collections;
- digital showroom and line sheets;
- buyer selection and assortment planning;
- order builder, order negotiation and confirmation;
- DealSpace for buyer–brand collaboration;
- calendar, tasks, deadlines and commercial events;
- documents, messages, notifications and audit trail;
- integrations and analytics required by the wholesale lifecycle.

Explicitly outside the initial V2 MVP unless separately approved:

- PLM;
- product development workflow;
- production management;
- BOM;
- factory QC;
- broad B2C marketplace functionality;
- unrelated Fashion OS experiments.

## Separation rules

1. New Wholesale V2 code is created only under `apps/syntha-wholesale-v2/` or in future packages explicitly owned by V2.
2. V2 must not import implementation code directly from `_ai-share/synth-1-full/` or the root legacy backend.
3. Legacy code can be studied and selectively migrated, but migration must be deliberate and documented.
4. Shared code is created only after a real cross-project need is proven. Shared packages must have explicit ownership and stable public APIs.
5. CI, environment variables, databases, migrations and deployment targets must be independent for Legacy and V2.
6. A change to one project must not be required to build or test the other project.
7. Root documentation must always identify which project a command or path belongs to.

## Current migration principle

Do not move the legacy monolith in one destructive operation. First establish an independent V2 skeleton, contracts and CI. Then migrate only validated business capabilities into V2 module by module.
