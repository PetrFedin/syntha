import { describe, expect, it } from 'vitest';
import {
  assertOrganisationScope,
  createOrganisationScope,
  organisationId,
  OrganisationScopeViolation,
  selectOrganisationRecords,
} from './organisation-scope';
import {
  createAuthorizationFixture,
  PermissionDenied,
  requirePermission,
} from './authorization';

describe('foundation organisation isolation', () => {
  it('rejects access to a resource owned by another organisation', () => {
    const scope = createOrganisationScope({
      activeOrganisationId: organisationId('org-brand-a'),
    });

    expect(() =>
      assertOrganisationScope(scope, organisationId('org-brand-b')),
    ).toThrow(OrganisationScopeViolation);
  });

  it('returns only records owned by the active organisation', () => {
    const activeOrganisationId = organisationId('org-active');
    const scope = createOrganisationScope({ activeOrganisationId });
    const records = [
      { organisationId: activeOrganisationId, value: 'visible' },
      { organisationId: organisationId('org-other'), value: 'hidden' },
    ];

    expect(selectOrganisationRecords(scope, records)).toEqual([
      { organisationId: activeOrganisationId, value: 'visible' },
    ]);
  });
});

describe('foundation authorization fixture', () => {
  it('allows declared permissions and rejects undeclared permissions', () => {
    const fixture = createAuthorizationFixture({
      permissions: ['catalog:read'],
    });

    expect(() => requirePermission(fixture, 'catalog:read')).not.toThrow();
    expect(() => requirePermission(fixture, 'catalog:write')).toThrow(
      PermissionDenied,
    );
  });
});
