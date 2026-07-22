# Identity Access module

Owns organisation membership, active organisation context and server-side permission evaluation.

## Responsibilities

- active and suspended memberships;
- OWNER, ADMIN and MEMBER roles;
- role-derived and explicit permission grants;
- active organisation switching;
- permission denial and membership access errors;
- `ActiveOrganisationChanged` event.

## Public API

Cross-module consumers import only from `src/modules/identity-access/index.ts`.

## Exclusions

Authentication provider SDKs and persistence adapters will implement later application ports. Organisation identity itself belongs to `organisations`.
