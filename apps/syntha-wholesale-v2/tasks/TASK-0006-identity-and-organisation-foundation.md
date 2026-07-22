---
task_id: TASK-0006
status: IN_PROGRESS
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
- membership roles and explicit permission grants;
- active organisation switching through an application command;
- positive and negative authorization tests;
- public module APIs through root `index.ts` files only.

## Acceptance criteria

- no Legacy imports or adapters;
- organisation names and identifiers are validated at the domain boundary;
- inactive organisations and suspended memberships cannot be used;
- active organisation switching requires an active membership and `identity.session.use`;
- permissions are resolved server-side from role plus explicit grants;
- cross-module imports use only the target module root API;
- unit tests cover success, missing membership, suspended membership and permission denial.
