import { describe, expect, it } from 'vitest';

import {
  OrganisationDomainError,
  organisationId,
  registerOrganisation,
} from '../index';

describe('organisations domain', () => {
  it('registers an immutable brand organisation and emits its domain event', () => {
    const result = registerOrganisation({
      id: ' brand-acme ',
      type: 'BRAND',
      displayName: ' ACME ',
      legalName: 'ACME Holdings Ltd',
      countryCode: 'gb',
      now: new Date('2026-07-22T10:00:00.000Z'),
    });

    expect(result.organisation).toEqual({
      id: organisationId('brand-acme'),
      type: 'BRAND',
      displayName: 'ACME',
      legalName: 'ACME Holdings Ltd',
      countryCode: 'GB',
      status: 'ACTIVE',
      createdAt: '2026-07-22T10:00:00.000Z',
    });
    expect(result.event).toEqual({
      type: 'OrganisationRegistered',
      organisationId: organisationId('brand-acme'),
      organisationType: 'BRAND',
      occurredAt: '2026-07-22T10:00:00.000Z',
    });
    expect(Object.isFrozen(result.organisation)).toBe(true);
  });

  it('rejects empty identifiers and names at the domain boundary', () => {
    expect(() => organisationId('   ')).toThrow(OrganisationDomainError);
    expect(() => registerOrganisation({
      id: 'shop-one',
      type: 'SHOP',
      displayName: '   ',
    })).toThrow('Display name must not be empty');
  });
});
