# Testkit

Reusable deterministic test setup, builders and security harnesses for Syntha Wholesale V2.

## Foundation guarantees

- every organisation-owned record carries an explicit `organisationId`;
- tests can assert that a resource belongs to the active organisation;
- cross-organisation access fails with `OrganisationScopeViolation`;
- repository-style fixtures can return only active-organisation records;
- authorization fixtures default to no permissions;
- undeclared permissions fail with `PermissionDenied`.

These helpers are test infrastructure, not production authorization. Production modules must still enforce organisation scope and permissions in their application layer and persistence adapters.
