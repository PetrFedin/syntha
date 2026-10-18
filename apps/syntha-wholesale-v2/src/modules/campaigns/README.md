# Campaigns module

Owns the organisation-scoped commercial campaign aggregate and the first durable lifecycle boundary after season context.

## Responsibilities

- create, list, read and revise campaigns;
- enforce campaign status transitions and date integrity;
- prevent duplicate campaign codes inside one organisation;
- persist optimistic versions and immutable lifecycle audit records in the same transaction;
- expose only the module-root `index.ts` API to other modules.

## Boundaries

Campaigns reference an existing season identifier but do not own season creation. Collections may depend on the Campaigns public API. Showroom and later lifecycle modules must not write campaign tables directly.
