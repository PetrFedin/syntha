# Identity Access module

Owns organisation membership, active organisation context and server-side permission evaluation.

## Responsibilities

- pending, active and suspended memberships;
- OWNER, ADMIN and MEMBER roles;
- role-derived and explicit permission grants;
- duplicate-free explicit permissions;
- active organisation switching with organisation-state validation;
- member invitation and permission-change commands;
- repository port and deterministic in-memory adapter;
- permission denial and membership access errors;
- `ActiveOrganisationChanged`, `MemberInvited` and `MembershipPermissionsChanged` events.

## Public API

Cross-module consumers import only from `src/modules/identity-access/index.ts`.

The application layer loads organisations and memberships through repository ports. It never trusts a client-provided organisation or permission set without server-side validation.

## Exclusions

Authentication provider SDKs and production persistence adapters will implement the existing application ports later. Organisation identity itself belongs to `organisations`.
