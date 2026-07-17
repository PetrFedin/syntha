# ADR-0009 — Test stack and CI gates

Status: PROPOSED
Date: 2026-07-17

## Decision

Use Vitest for unit and integration tests, Testing Library for component behavior and accessibility, and Playwright for critical browser flows and responsive evidence.

## Required CI gates

- architecture/documentation validation;
- typecheck;
- lint;
- unit tests;
- affected integration tests;
- affected Playwright flows;
- import-boundary checks;
- accessibility and mandatory viewport evidence for changed major UI.

## Rules

- Tests live near the behavior they protect.
- Authorization includes positive and negative cases.
- Unrun checks are reported as not run, never passed.
- Flaky tests are fixed or quarantined with an owner and expiry.

## Consequences

The stack covers domain, application and user flows with common TypeScript tooling, at the cost of browser-test maintenance and CI time.
