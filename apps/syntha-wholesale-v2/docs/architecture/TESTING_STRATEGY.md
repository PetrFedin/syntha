# Testing Strategy

## Principles

Tests protect business rules, organisation isolation, immutable commercial snapshots and critical wholesale workflows. Test depth follows risk, not file count.

## Test layers

### Unit

Use for value objects, calculations, policies, state transitions, visibility and permission rules. Domain tests must not require React, network or database SDKs.

### Integration

Use for repositories, API handlers, adapters, outbox/event delivery, idempotency, optimistic concurrency, tenant isolation and external mapping.

### Component

Cover loading, empty, no-results, error, forbidden, saving, success and conflict states; keyboard/touch behaviour; accessibility; and responsive transformation.

### End-to-end

Protect the critical path:

```text
Campaign → Collection → Showroom → Publish → Buyer access
→ Selection → Order Builder → Submit → Review/Revise → Confirm
```

Include at least one denial/failure path for every security- or money-sensitive flow.

## Mandatory checks by change

- Documentation-only: links, JSON validity, identifiers and architecture consistency.
- Domain/application: typecheck, lint, unit and affected integration tests.
- Write path: idempotency, concurrency, audit/event and negative authorization tests.
- UI: component states, accessibility, keyboard/touch and required viewport evidence.
- Critical workflow: affected end-to-end path.
- Module boundary: import-boundary guard.

## Required viewports

```text
390 × 844
768 × 1024
1024 × 768
1440 × 900
1728 × 1117
```

## Reporting

Completion evidence records the exact command, result and any skipped check with reason. An unrun check is never reported as passed. Flaky tests are defects and cannot be silently retried until green.
