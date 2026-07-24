# ADR Review Checklist

Use this checklist before changing an ADR from `PROPOSED` to `ACCEPTED`.

## Decision quality

- [ ] The problem is stated in business and technical terms.
- [ ] The decision is narrow enough to be reversible or superseded.
- [ ] Alternatives are listed with reasons for rejection.
- [ ] Consequences include operational, security, testing and migration impact.
- [ ] The decision does not silently expand the product boundary.

## Architecture consistency

- [ ] The decision is compatible with the vertical modular monolith.
- [ ] Cross-module access remains limited to module root `index.ts`.
- [ ] V2 remains isolated from legacy code unless an explicit adapter is approved.
- [ ] Organisation context and authorization implications are explicit.
- [ ] Persistence, event delivery and rendering effects are explicit where applicable.

## Acceptance record

Before acceptance, add these fields to the ADR:

```text
Status: ACCEPTED
Accepted by: <GitHub username or named reviewer>
Accepted on: YYYY-MM-DD
Supersedes: <ADR id or none>
```

Update `docs/architecture/adr/README.md`, dependent tasks, `tasks/task-manifest.json` and `STATUS.md` in the same change.

An ADR must not be marked `ACCEPTED` without a named reviewer and acceptance date.