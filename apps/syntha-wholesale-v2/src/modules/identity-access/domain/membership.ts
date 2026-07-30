import type { OrganisationId } from '../../organisations';
import type { Permission } from './permissions';

export type MembershipId = string & { readonly __brand: 'MembershipId' };
export type MembershipRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface Membership {
  readonly id: MembershipId;
  readonly userId: string;
  readonly organisationId: OrganisationId;
  readonly role: MembershipRole;
  readonly status: MembershipStatus;
  readonly explicitPermissions: readonly Permission[];
}

const ROLE_PERMISSIONS = {
  OWNER: [
    'identity.session.use',
    'organisation.members.read',
    'organisation.members.manage',
  ],
  ADMIN: [
    'identity.session.use',
    'organisation.members.read',
    'organisation.members.manage',
  ],
  MEMBER: [
    'identity.session.use',
    'organisation.members.read',
  ],
} as const satisfies Readonly<Record<MembershipRole, readonly Permission[]>>;

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

function uniquePermissions(permissions: readonly Permission[]): readonly Permission[] {
  return Object.freeze([...new Set(permissions)]);
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
    explicitPermissions: uniquePermissions(input.explicitPermissions ?? []),
  });
}

export function withExplicitPermissions(
  membership: Membership,
  explicitPermissions: readonly Permission[],
): Membership {
  return Object.freeze({
    ...membership,
    explicitPermissions: uniquePermissions(explicitPermissions),
  });
}

export function permissionsForMembership(membership: Membership): ReadonlySet<Permission> {
  return new Set<Permission>([
    ...ROLE_PERMISSIONS[membership.role],
    ...membership.explicitPermissions,
  ]);
}
