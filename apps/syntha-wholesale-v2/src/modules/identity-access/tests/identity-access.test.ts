import { describe, expect, it } from 'vitest';

import { organisationId } from '../../organisations';
import {
  MembershipAccessDenied,
  PermissionDenied,
  assertPermission,
  createMembership,
  switchActiveOrganisation,
} from '../index';

describe('identity access domain contracts', () => {
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
    }, membership);

    expect(result.context.organisationId).toBe(targetOrganisationId);
    expect(result.context.permissions.has('organisation.members.manage')).toBe(true);
    expect(result.event).toMatchObject({
      type: 'ActiveOrganisationChanged',
      activeOrganisationId: targetOrganisationId,
      occurredAt: '2026-07-22T11:00:00.000Z',
    });
  });

  it('denies a missing membership', () => {
    expect(() => switchActiveOrganisation({
      userId: 'user-1',
      targetOrganisationId: organisationId('shop-missing'),
    }, null)).toThrow(MembershipAccessDenied);
  });

  it.each(['PENDING', 'SUSPENDED'] as const)(
    'denies a %s membership',
    (status) => {
      const targetOrganisationId = organisationId(`shop-${status.toLowerCase()}`);
      const membership = createMembership({
        id: `membership-${status.toLowerCase()}`,
        userId: 'user-1',
        organisationId: targetOrganisationId,
        role: 'ADMIN',
        status,
      });

      expect(() => switchActiveOrganisation({
        userId: 'user-1',
        targetOrganisationId,
      }, membership)).toThrow(`Membership status ${status} cannot activate an organisation`);
    },
  );

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
    }, membership);

    expect(() => assertPermission(
      result.context.permissions,
      'organisation.members.manage',
    )).toThrow(PermissionDenied);
  });

  it('removes repeated explicit permission grants', () => {
    const membership = createMembership({
      id: 'membership-deduplicated',
      userId: 'user-3',
      organisationId: organisationId('brand-two'),
      role: 'MEMBER',
      explicitPermissions: [
        'organisation.members.manage',
        'organisation.members.manage',
      ],
    });

    expect(membership.explicitPermissions).toEqual(['organisation.members.manage']);
  });
});
