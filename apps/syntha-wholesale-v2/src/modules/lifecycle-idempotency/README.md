# Lifecycle idempotency module

Owns replay-safe create-command identity for the authoritative Season → Campaign → Collection path.

## Guarantees

- the client supplies `Idempotency-Key` for every lifecycle create command;
- command identity is scoped by organisation, command name and key;
- a canonical SHA-256 payload fingerprint prevents reuse with different input;
- the exact authenticated credential is part of the command evidence;
- PostgreSQL reserves the key, writes the aggregate and audit record, and stores the result identifier in one transaction;
- a lost successful response can be replayed without creating another aggregate or audit record;
- concurrent requests serialize on the idempotency primary key;
- same key with another payload, actor or result type is rejected.

## Public boundary

Consumers import only from:

```ts
import { ... } from '@/modules/lifecycle-idempotency';
```

The module does not own Season, Campaign or Collection data. It stores only command identity and the authoritative result reference.
