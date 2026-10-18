import { describe, expect, it } from 'vitest';

import {
  InMemoryOrganisationRepository,
  organisationId,
  registerOrganisation,
} from '../../organisations';
import {
  InMemoryMembershipRepository,
  MembershipAlreadyExists,
  OrganisationUnavailable,
  PermissionDenied,
  activateOrganisation,
  changeMembershipPermissions,
  createMembership,
  inviteMember,
  membershipId,
  switchActiveOrganisation,
} from '../index';

function organisationFixture(input: {
  id: string;
  type?: 'BRAND' | 'SHOP';
  status?: 'ACTIVE' | 'SUSPENDED';
}) {
  return registerOrganisation({
    id: input.id,
    type: input.type ?? 'BRAND',
    displayName: input.id,
    status: input.status,
    now: new Date('2026-07-22T12:00:00.000Z'),
  }).organisation;
}

describe('identity and organisation workflows', () => {
  it('loads both records and activates only an active organisation', async () => {
    const active = organisationFixture({ id: 'brand-active' });
    const suspended = organisationFixture({ id: 'brand-suspended', status: 'SUSPENDED' });
    const organisations = new InMemoryOrganisationRepository([active, suspended]);
    const memberships = new InMemoryMembershipRepository([
      createMembership({
        id: 'member-active',
        userId: 'user-1',
        organisationId: active.id,
        role: 'OWNER',
      }),
      createMembership({
        id: 'member-suspended-org',
        userId: 'user-1',
        organisationId: suspended.id,
        role: 'OWNER',
      }),
    ]);

    await expect(activateOrganisation({
      userId: 'user-1',
      targetOrganisationId: active.id,
    }, { organisations, memberships })).resolves.toMatchObject({
      context: { organisationId: active.id },
    });

    await expect(activateOrganisation({
      userId: 'user-1',
      targetOrganisationId: suspended.id,
    }, { organisations, memberships })).rejects.toThrow(OrganisationUnavailable);
  });

  it('invites once, persists PENDING state and rejects duplicate identity', async () => {
    const organisation = organisationFixture({ id: 'brand-invite' });
    const organisations = new InMemoryOrganisationRepository([organisation]);
    const owner = createMembership({
      id: 'owner-invite',
      userId: 'owner-user',
      organisationId: organisation.id,
      role: 'OWNER',
    });
    const memberships = new InMemoryMembershipRepository([owner]);
    const actor = switchActiveOrganisation({
      userId: owner.userId,
      targetOrganisationId: organisation.id,
    }, owner).context;

    const command = {
      actor,
      membershipId: 'invite-one',
      userId: 'new-user',
      organisationId: organisation.id,
      role: 'MEMBER' as const,
      explicitPermissions: [
        'organisation.members.read' as const,
        'organisation.members.read' as const,
      ],
      occurredAt: new Date('2026-07-22T14:00:00.000Z'),
    };
    const result = await inviteMember(command, { organisations, memberships });

    expect(result.membership.status).toBe('PENDING');
    expect(result.membership.explicitPermissions).toEqual(['organisation.members.read']);
    await expect(memberships.findById(membershipId('invite-one'))).resolves.toBe(
      result.membership,
    );
    await expect(inviteMember(command, { organisations, memberships })).rejects.toThrow(
      MembershipAlreadyExists,
    );
  });

  it('requires manage permission for invitation', async () => {
    const organisation = organisationFixture({ id: 'shop-denied', type: 'SHOP' });
    const organisations = new InMemoryOrganisationRepository([organisation]);
    const member = createMembership({
      id: 'plain-member',
      userId: 'member-user',
      organisationId: organisation.id,
      role: 'MEMBER',
    });
    const memberships = new InMemoryMembershipRepository([member]);
    const actor = switchActiveOrganisation({
      userId: member.userId,
      targetOrganisationId: organisation.id,
    }, member).context;

    await expect(inviteMember({
      actor,
      membershipId: 'forbidden-invite',
      userId: 'other-user',
      organisationId: organisation.id,
      role: 'MEMBER',
    }, { organisations, memberships })).rejects.toThrow(PermissionDenied);
  });

  it('changes explicit permissions without repeats and emits linked evidence', async () => {
    const organisationIdValue = organisationId('brand-permissions');
    const owner = createMembership({
      id: 'owner-permissions',
      userId: 'owner-user',
      organisationId: organisationIdValue,
      role: 'OWNER',
    });
    const target = createMembership({
      id: 'target-permissions',
      userId: 'target-user',
      organisationId: organisationIdValue,
      role: 'MEMBER',
    });
    const repository = new InMemoryMembershipRepository([owner, target]);
    const actor = switchActiveOrganisation({
      userId: owner.userId,
      targetOrganisationId: organisationIdValue,
    }, owner).context;

    const result = await changeMembershipPermissions({
      actor,
      membershipId: target.id,
      explicitPermissions: [
        'organisation.members.manage',
        'organisation.members.manage',
      ],
      occurredAt: new Date('2026-07-22T15:00:00.000Z'),
    }, repository);

    expect(result.membership.explicitPermissions).toEqual([
      'organisation.members.manage',
    ]);
    expect(result.event).toMatchObject({
      type: 'MembershipPermissionsChanged',
      membershipId: target.id,
      organisationId: organisationIdValue,
      changedByUserId: owner.userId,
      newPermissions: ['organisation.members.manage'],
    });
    await expect(repository.findById(target.id)).resolves.toBe(result.membership);
  });
});
