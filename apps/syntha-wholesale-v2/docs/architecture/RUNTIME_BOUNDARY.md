# Runtime Boundary

## Purpose

Define the executable and dependency boundary for Syntha Wholesale V2 before a framework or business runtime is introduced.

## Workspace

The only V2 package root is:

```text
apps/syntha-wholesale-v2
```

Its `package.json`, lockfile, environment contract, scripts and future runtime configuration belong to this directory.

## Isolation rules

- The existing Platform Core application is not a dependency of V2.
- V2 must not import legacy routes, UI components, stores or application services.
- Temporary reuse is allowed only through an explicit adapter accepted by ADR and covered by tests.
- V2 commands must run from the V2 package root without changing legacy runtime state.
- Secrets, generated output and local environment files are never committed.

## Command contract

| Command | Meaning before runtime selection |
|---|---|
| `npm run verify` | Runs all available foundation checks and must pass. |
| `npm run preflight` | Checks Node version, environment policy and architecture integrity. |
| `npm run dev` | Exists but fails explicitly until the runtime ADR is accepted. |
| `npm run typecheck` | Exists but fails explicitly until TypeScript/runtime tooling is installed. |
| `npm run lint` | Exists but fails explicitly until lint tooling is selected. |
| `npm test` | Exists but fails explicitly until the test stack is selected. |

A command must never report success when its underlying toolchain is absent.

## Node baseline

Foundation automation uses Node.js 24. The repository records this in `.nvmrc` and `package.json`.

## Runtime decision gate

Framework dependencies, route files, rendering strategy and deployment configuration may be added only after the corresponding ADR is accepted. Until then, runtime commands remain intentionally blocked.
