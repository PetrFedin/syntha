# TASK-0006 Completion Report

Task: `TASK-0006`
Current status: `DONE`
Prepared on: 2026-07-22

## Delivered

- Validated Brand and Shop organisation identities with explicit lifecycle state.
- Membership roles, lifecycle and duplicate-free explicit permission grants.
- Active organisation switching with server-side membership and permission validation.
- Member invitation and permission-change application commands.
- Organisation and membership repository ports with deterministic in-memory adapters.
- Domain events for organisation switching, invitations and permission changes.
- Positive, negative, cross-organisation and persistence-boundary tests.

## Acceptance criteria evidence

| Criterion | Evidence | Result |
|---|---|---|
| No Legacy runtime or adapters | module imports and architecture guard | PASS |
| Domain identifiers and names validated | organisation domain tests | PASS |
| Duplicate organisation and membership identities rejected | repository workflow tests | PASS |
| Inactive organisations and memberships denied | identity workflow tests | PASS |
| Active organisation switching requires permission | switch command tests | PASS |
| Invitations and permission changes are organisation-scoped | command authorization tests | PASS |
| Cross-module access uses root module APIs | architecture validation | PASS |
| Full V2 workflow passes | GitHub Actions run `29939296977` | PASS |

## Commands verified

```text
npm run preflight
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Known limitations

- Provider-backed persistence and authentication adapters are intentionally deferred.
- Access, organisation chooser and membership administration screens are separate implementation tasks.

## Review record

Reviewer: Product owner — Petr Fedin
Reviewed on: 2026-07-22
Decision: accepted
