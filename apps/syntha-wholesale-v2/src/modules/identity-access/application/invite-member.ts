import type { OrganisationId, OrganisationRepository } from '../../organisations';
import {
  createMembership,
  membershipId,
  type Membership,
  type MembershipId,
  type MembershipRole,
} from '../domain/membership';
import { assertPermission, type Permission } from '../domain/permissions';
import {
  MembershipAlreadyExists,
  MembershipAccessDenied,
  OrganisationUnavailable,
} from './errors';
import type { MembershipRepository } from './membership-repository';
import type { ActiveOrganisationContext } from './switch-active-organisation';

export interface InviteMemberCommand {
  readonly actor: ActiveOrganisationContext;
  readonly membershipId: string;
  readonly userId: string;
  readonly organisationId: OrganisationId;
  readonly role: MembershipRole;
  readonly explicitPermissions?: readonly Permission[];
  readonly occurredAt?: Date;
}

export interface MemberInvited {
  readonly type: 'MemberInvited';
  readonly membershipId: MembershipId;
  readonly organisationId: OrganisationId;
  readonly userId: string;
  readonly invitedByUserId: string;
  readonly occurredAt: string;
}

export interface InviteMemberResult {
  readonly membership: Membership;
  readonly event: MemberInvited;
}

export async function inviteMember(
  command: InviteMemberCommand,
  dependencies: {
    readonly organisations: OrganisationRepository;
    readonly memberships: MembershipRepository;
  },
): Promise<InviteMemberResult> {
  assertPermission(command.actor.permissions, 'organisation.members.manage');
  if (command.actor.organisationId !== command.organisationId) {
    throw new MembershipAccessDenied('Cannot invite a member into another organisation');
  }

  const organisation = await dependencies.organisations.findById(command.organisationId);
  if (!organisation || organisation.status !== 'ACTIVE') {
    throw new OrganisationUnavailable('Members can only be invited into an active organisation');
  }

  const id = membershipId(command.membershipId);
  const [byId, byIdentity] = await Promise.all([
    dependencies.memberships.findById(id),
    dependencies.memberships.findByUserAndOrganisation(
      command.userId,
      command.organisationId,
    ),
  ]);
  if (byId || byIdentity) {
    throw new MembershipAlreadyExists('Membership already exists');
  }

  const membership = createMembership({
    id,
    userId: command.userId,
    organisationId: command.organisationId,
    role: command.role,
    status: 'PENDING',
    explicitPermissions: command.explicitPermissions,
  });
  await dependencies.memberships.save(membership);

  const event: MemberInvited = Object.freeze({
    type: 'MemberInvited',
    membershipId: membership.id,
    organisationId: membership.organisationId,
    userId: membership.userId,
    invitedByUserId: command.actor.userId,
    occurredAt: (command.occurredAt ?? new Date()).toISOString(),
  });
  return Object.freeze({ membership, event });
}
