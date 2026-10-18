# Showroom module

The `showroom` module owns draft presentation workspaces and the immutable buyer-facing publication snapshot for one authoritative Collection.

## Responsibilities

- validate Showroom identity, presentation window and lifecycle rules;
- scope every record to one active organisation and Collection;
- support replay-safe creation and publication;
- persist draft edits with optimistic concurrency;
- atomically publish the aggregate, immutable snapshot, audit evidence and outbox event;
- expose repository and workflow contracts through the module root only.

## Public boundary

Cross-module consumers must import from:

```ts
import { ... } from '@/modules/showroom';
```

Deep imports into `domain`, `application` or `infrastructure` are not allowed outside this module.

## Publication invariant

A Showroom can be published once, from `DRAFT`, only when its parent Collection is `PUBLISHED`. Publication creates one immutable snapshot and one `SHOWROOM_PUBLISHED` outbox fact in the same PostgreSQL transaction as the aggregate status update and audit record.

Buyer access grants, product presentation composition and Selection integration remain downstream work after the publication source of truth is verified.
