# Collections module

Owns the organisation-scoped collection aggregate inside an authoritative commercial campaign.

## Responsibilities

- create, list, read and revise collections within one campaign;
- enforce collection status transitions and ISO currency validation;
- prevent duplicate collection codes inside the same campaign;
- reject creation under closed or archived campaigns;
- persist optimistic versions and lifecycle audit records transactionally;
- expose only the module-root `index.ts` API to other modules.

## Boundaries

Collections reference Campaigns through its public module API. Product/SKU composition, pricing lines and Digital Showroom publication remain separate downstream capabilities and must not write collection persistence directly.
