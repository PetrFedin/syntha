import { describe, expect, it } from 'vitest';

import { organisationId } from '../../organisations';
import {
  MembershipAccessDenied,
  PermissionDenied,
  assertPermission,
  createMembership,
  switchActiveOrganisation,
} from '../index';

describe('identity access', () => {
  it('switches active organisation for an active owner membership', () => {
    const targetOrganisationId = organisationId('brand-acme');
    const membership = createMembership({
      id: 'membership-owner',
      userId: 'user-1',
      organisationId: targetOrganisationId,
      role: 'OWNER',
    });

    const result = switchActiveOrganisation({
      userId: 'user-1',
      targetOrganisationId,
      previousOrganisationId: organisationId('shop-old'),
      occurredAt: new Date('2026-07-22T11:00:00.000Z'),
    }, [membership]);

    expect(result.context.organisationId).toBe(targetOrganisationId);
    expect(result.context.permissions.has('organisation.members.manage')).toBe(true);
    expect(result.event).toMatchObject({
      type: 'ActiveOrganisationChanged',
      activeOrganisationId: targetOrganisationId,
      occurredAt: '2026-07-22T11:00:00.000Z',
    });
  });

  it('denies an organisation without a matching membership', () => {
    expect(() => switchActiveOrganisation({
      userId: 'user-1',
      targetOrganisationId: organisationId('shop-missing'),
    }, [])).toThrow(MembershipAccessDenied);
  });

  it('denies a suspended membership', () => {
    const targetOrganisationId = organisationId('shop-suspended');
    const membership = createMembership({
      id: 'membership-suspended',
      userId: 'user-1',
      organisationId: targetOrganisationId,
      role: 'ADMIN',
      status: 'SUSPENDED',
    });

    expect(() => switchActiveOrganisation({
      userId: 'user-1',
      targetOrganisationId,
    }, [membership])).toThrow('Suspended membership cannot activate an organisation');
  });

  it('denies a member permission that was not granted', () => {
    const membership = createMembership({
      id: 'membership-member',
      userId: 'user-2',
      organisationId: organisationId('shop-one'),
      role: 'MEMBER',
    });
    const result = switchActiveOrganisation({
      userId: 'user-2',
      targetOrganisationId: membership.organisationId,
    }, [membership]);

    expect(() => assertPermission(
      result.context.permissions,
      'organisation.members.manage',
    )).toThrow(PermissionDenied);
  });
});
