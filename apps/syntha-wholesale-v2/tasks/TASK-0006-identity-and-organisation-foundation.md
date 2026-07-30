---
task_id: TASK-0006
status: DONE
priority: P0
product_area: identity-and-organisations
capability_ids:
  - WSC-018
workflow_ids:
  - WF-001
screen_ids:
  - access
  - organisation-chooser
  - membership-administration
permissions:
  - identity.session.use
  - organisation.members.read
  - organisation.members.manage
commands:
  - SwitchActiveOrganisation
  - InviteMember
  - ChangeMembershipPermissions
domain_events:
  - ActiveOrganisationChanged
  - MemberInvited
  - MembershipPermissionsChanged
dependencies:
  - TASK-0004
  - TASK-0005
source_documents:
  - docs/product/SYNTHA_WHOLESALE_PRODUCT_CANON.md
  - docs/architecture/context-map.json
  - docs/architecture/adr/ADR-0007-auth-and-active-organisation.md
  - docs/architecture/adr/ADR-0008-command-query-event-model.md
  - docs/architecture/TESTING_STRATEGY.md
---

# Identity and organisation foundation

## Outcome

Create the first production business modules for organisation identity, membership, active organisation context and server-side permission evaluation.

## Scope

- Brand and Shop organisation identities;
- active and suspended organisation states;
- pending, active and suspended membership lifecycle;
- membership roles and duplicate-free explicit permission grants;
- active organisation switching through an application command;
- member invitation and permission-change commands;
- repository ports with deterministic in-memory adapters;
- positive and negative authorization tests;
- public module APIs through root `index.ts` files only.

## Acceptance criteria

- no Legacy imports or adapters;
- organisation names and identifiers are validated at the domain boundary;
- duplicate organisation and user/organisation membership identities are rejected;
- inactive organisations and non-active memberships cannot be used;
- active organisation switching requires an active membership and `identity.session.use`;
- invitations require `organisation.members.manage` and create PENDING memberships;
- permission changes require `organisation.members.manage` and cannot cross organisation scope;
- permissions are resolved server-side from role plus de-duplicated explicit grants;
- cross-module imports use only the target module root API;
- repository contracts are owned by application layers, not domain layers;
- unit tests cover success, missing membership, pending/suspended membership, inactive organisation, duplicate identities, permission denial and cross-record persistence.

## Completion evidence

The domain contracts, application commands, repository ports, deterministic in-memory adapters and authorization tests are implemented. GitHub Actions workflow run `29939296977` passed governance validation, strict typecheck, lint, unit tests, production build and browser smoke tests on 2026-07-22.
