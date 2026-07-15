# Vertical Slice 01 — Companion Screens

These screens and flows are mandatory dependencies of the primary vertical slice.

```text
BR-002A Campaign Create/Edit
BR-004  Campaign Buyers & Access Grants
BR-010  Collection Product Management & Import
BR-015  Publish Review
SY-003  Invitation Acceptance
SH-013  Order Validation
```

They must use capabilities, permissions, workflows, events and API contracts from `docs/implementation-blueprint/`.

Implementation order:

```text
SY-003 identity/invitation foundation
→ BR-002A campaign creation
→ BR-010 product data foundation
→ BR-004 buyer access
→ BR-015 publish
→ SH-013 validation/submit
```

Status: `DESIGNED DRAFT` pending owner review and route/API consistency freeze.
