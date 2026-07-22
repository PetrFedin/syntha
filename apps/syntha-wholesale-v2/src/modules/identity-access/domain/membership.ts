import type { OrganisationId } from '../../organisations';
import type { Permission } from './permissions';

export type MembershipId = string & { readonly __brand: 'MembershipId' };
export type MembershipRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type MembershipStatus = 'ACTIVE' | 'SUSPENDED';

export interface Membership {
  readonly id: MembershipId;
  readonly userId: string;
  readonly organisationId: OrganisationId;
  readonly role: MembershipRole;
  readonly status: MembershipStatus;
  readonly explicitPermissions: readonly Permission[];
}

const ROLE_PERMISSIONS: Readonly<Record<MembershipRole, readonly Permission[]>> = Object.freeze({
  OWNER: Object.freeze([
    'identity.session.use',
    'organisation.members.read',
    'organisation.members.manage',
  ]),
  ADMIN: Object.freeze([
    'identity.session.use',
    'organisation.members.read',
    'organisation.members.manage',
  ]),
  MEMBER: Object.freeze([
    'identity.session.use',
    'organisation.members.read',
  ]),
});

export class MembershipAccessDenied extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MembershipAccessDenied';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new MembershipAccessDenied(`${label} must not be empty`);
  return normalized;
}

export function membershipId(value: string): MembershipId {
  return requiredText(value, 'Membership id') as MembershipId;
}

export function createMembership(input: {
  readonly id: string;
  readonly userId: string;
  readonly organisationId: OrganisationId;
  readonly role: MembershipRole;
  readonly status?: MembershipStatus;
  readonly explicitPermissions?: readonly Permission[];
}): Membership {
  return Object.freeze({
    id: membershipId(input.id),
    userId: requiredText(input.userId, 'User id'),
    organisationId: input.organisationId,
    role: input.role,
    status: input.status ?? 'ACTIVE',
    explicitPermissions: Object.freeze([...(input.explicitPermissions ?? [])]),
  });
}

export function permissionsForMembership(membership: Membership): ReadonlySet<Permission> {
  return new Set<Permission>([
    ...ROLE_PERMISSIONS[membership.role],
    ...membership.explicitPermissions,
  ]);
}
