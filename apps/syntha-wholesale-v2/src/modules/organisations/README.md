# Organisations module

Owns Brand and Shop organisation identity and lifecycle state.

## Responsibilities

- validated organisation identifiers;
- Brand and Shop type classification;
- legal and display names;
- ACTIVE and SUSPENDED lifecycle state;
- duplicate-safe registration use case;
- repository port and deterministic in-memory adapter;
- registration domain event.

## Public API

Cross-module consumers import only from `src/modules/organisations/index.ts`.

The application layer depends on `OrganisationRepository`; infrastructure adapters implement that port. Domain code remains free of persistence and framework dependencies.

## Exclusions

Membership, authentication and permission evaluation belong to `identity-access`. Account relationships and commercial terms belong to their own modules.
