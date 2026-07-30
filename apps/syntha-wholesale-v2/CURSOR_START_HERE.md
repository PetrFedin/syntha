# Syntha Wholesale V2 — Start Here

## Product contract

The v2 core is a B2B wholesale transaction system. Its canonical lifecycle is:

`Campaign → Collection → Showroom → Selection → Order Builder → Order → Confirmation → DealSpace`.

Brand and Shop are organisation types. Users receive roles inside organisations; roles are not organisation substitutes.

## Non-negotiable engineering rules

1. Cross-module imports use only `src/modules/<module>/public.mjs`.
2. Every mutation has a `commandId` and is idempotent.
3. State changes emit immutable domain events.
4. Financial totals are reconciled from line items before confirmation.
5. DealSpace and linked calendar milestones are created in the same application operation as confirmation.
6. No PLM, production, BOM, QC or supply-chain implementation enters v2 until the wholesale lifecycle is stable and covered by integration tests.

## Verification

Run from repository root:

```bash
npm run v2:verify
```

Or from this directory:

```bash
npm run verify
```

## Priority order

1. Foundation and architecture guardrails. ✅
2. Organisation membership and RBAC. ✅
3. Campaign and collection persistence.
4. Showroom and selection collaboration.
5. Order builder, pricing, terms and confirmation.
6. DealSpace, calendar and notifications.
7. PostgreSQL adapters, API and UI.
8. Only then: PLM, production, BOM, QC, logistics and landed cost.
