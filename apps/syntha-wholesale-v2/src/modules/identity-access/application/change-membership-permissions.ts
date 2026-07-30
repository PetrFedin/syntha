import type { OrganisationId } from '../../organisations';
import {
  withExplicitPermissions,
  type Membership,
  type MembershipId,
} from '../domain/membership';
import { assertPermission, type Permission } from '../domain/permissions';
import { MembershipAccessDenied } from '../domain/membership';
import { MembershipNotFound } from './errors';
import type { MembershipRepository } from './membership-repository';
import type { ActiveOrganisationContext } from './switch-active-organisation';

export interface ChangeMembershipPermissionsCommand {
  readonly actor: ActiveOrganisationContext;
  readonly membershipId: MembershipId;
  readonly explicitPermissions: readonly Permission[];
  readonly occurredAt?: Date;
}

export interface MembershipPermissionsChanged {
  readonly type: 'MembershipPermissionsChanged';
  readonly membershipId: MembershipId;
  readonly organisationId: OrganisationId;
  readonly changedByUserId: string;
  readonly previousPermissions: readonly Permission[];
  readonly newPermissions: readonly Permission[];
  readonly occurredAt: string;
}

export interface ChangeMembershipPermissionsResult {
  readonly membership: Membership;
  readonly event: MembershipPermissionsChanged;
}

export async function changeMembershipPermissions(
  command: ChangeMembershipPermissionsCommand,
  repository: MembershipRepository,
): Promise<ChangeMembershipPermissionsResult> {
  assertPermission(command.actor.permissions, 'organisation.members.manage');

  const current = await repository.findById(command.membershipId);
  if (!current) throw new MembershipNotFound('Membership was not found');
  if (current.organisationId !== command.actor.organisationId) {
    throw new MembershipAccessDenied('Cannot change another organisation membership');
  }

  const updated = withExplicitPermissions(current, command.explicitPermissions);
  await repository.save(updated);

  const event: MembershipPermissionsChanged = Object.freeze({
    type: 'MembershipPermissionsChanged',
    membershipId: updated.id,
    organisationId: updated.organisationId,
    changedByUserId: command.actor.userId,
    previousPermissions: current.explicitPermissions,
    newPermissions: updated.explicitPermissions,
    occurredAt: (command.occurredAt ?? new Date()).toISOString(),
  });
  return Object.freeze({ membership: updated, event });
}
