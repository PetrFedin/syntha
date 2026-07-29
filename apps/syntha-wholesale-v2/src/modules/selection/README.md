# Selection module

The Selection module owns buyer access grants and Shop-private assortment planning after authoritative Showroom publication.

## Source-of-truth boundary

- `showroom` owns the seller Showroom aggregate and immutable publication snapshot.
- `selection` owns the grant that binds one buyer organisation to that snapshot.
- `selection` owns buyer-private budget, shortlist notes, quantity intent and size curves.
- Brand-facing projections must never expose Shop-private Selection planning fields.
- Catalog references remain stable external identifiers until the Catalog vertical slice becomes authoritative.

## Aggregate rules

- an access grant links one seller organisation, one buyer organisation, one published Showroom and one immutable snapshot;
- seller and buyer organisations must differ;
- only one active grant may exist for the same seller, Showroom and buyer;
- a revoked grant blocks Selection creation and mutation;
- one Selection is created per active grant;
- Selection writes require buyer organisation scope and expected version;
- grant and Selection creation are replay-safe through lifecycle idempotency;
- every persisted mutation writes exact actor audit and an outbox event atomically.

## Public API

Use only `@/modules/selection`. Internal domain, application and infrastructure paths are not public module APIs.
