import type { OrganisationId } from '../../organisations';
import {
  MembershipAccessDenied,
  permissionsForMembership,
  type Membership,
  type MembershipId,
} from '../domain/membership';
import { assertPermission, type Permission } from '../domain/permissions';

export interface SwitchActiveOrganisationCommand {
  readonly userId: string;
  readonly targetOrganisationId: OrganisationId;
  readonly previousOrganisationId?: OrganisationId;
  readonly occurredAt?: Date;
}

export interface ActiveOrganisationContext {
  readonly userId: string;
  readonly organisationId: OrganisationId;
  readonly membershipId: MembershipId;
  readonly permissions: ReadonlySet<Permission>;
}

export interface ActiveOrganisationChanged {
  readonly type: 'ActiveOrganisationChanged';
  readonly userId: string;
  readonly previousOrganisationId?: OrganisationId;
  readonly activeOrganisationId: OrganisationId;
  readonly membershipId: MembershipId;
  readonly occurredAt: string;
}

export interface SwitchActiveOrganisationResult {
  readonly context: ActiveOrganisationContext;
  readonly event: ActiveOrganisationChanged;
}

export function switchActiveOrganisation(
  command: SwitchActiveOrganisationCommand,
  membership: Membership | null,
): SwitchActiveOrganisationResult {
  if (
    !membership
    || membership.userId !== command.userId
    || membership.organisationId !== command.targetOrganisationId
  ) {
    throw new MembershipAccessDenied(
      'Membership for the requested user and organisation was not found',
    );
  }
  if (membership.status !== 'ACTIVE') {
    throw new MembershipAccessDenied(
      `Membership status ${membership.status} cannot activate an organisation`,
    );
  }

  const permissions = permissionsForMembership(membership);
  assertPermission(permissions, 'identity.session.use');

  const occurredAt = (command.occurredAt ?? new Date()).toISOString();
  const context: ActiveOrganisationContext = Object.freeze({
    userId: command.userId,
    organisationId: membership.organisationId,
    membershipId: membership.id,
    permissions,
  });
  const event: ActiveOrganisationChanged = Object.freeze({
    type: 'ActiveOrganisationChanged',
    userId: command.userId,
    previousOrganisationId: command.previousOrganisationId,
    activeOrganisationId: membership.organisationId,
    membershipId: membership.id,
    occurredAt,
  });

  return Object.freeze({ context, event });
}
