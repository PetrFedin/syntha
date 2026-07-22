export {
  MembershipAccessDenied,
  createMembership,
  membershipId,
  permissionsForMembership,
  withExplicitPermissions,
  type Membership,
  type MembershipId,
  type MembershipRole,
  type MembershipStatus,
} from './domain/membership';
export {
  PermissionDenied,
  assertPermission,
  hasPermission,
  type Permission,
} from './domain/permissions';
export {
  MembershipAlreadyExists,
  MembershipNotFound,
  OrganisationUnavailable,
} from './application/errors';
export type { MembershipRepository } from './application/membership-repository';
export {
  switchActiveOrganisation,
  type ActiveOrganisationChanged,
  type ActiveOrganisationContext,
  type SwitchActiveOrganisationCommand,
  type SwitchActiveOrganisationResult,
} from './application/switch-active-organisation';
export { activateOrganisation } from './application/activate-organisation';
export {
  inviteMember,
  type InviteMemberCommand,
  type InviteMemberResult,
  type MemberInvited,
} from './application/invite-member';
export {
  changeMembershipPermissions,
  type ChangeMembershipPermissionsCommand,
  type ChangeMembershipPermissionsResult,
  type MembershipPermissionsChanged,
} from './application/change-membership-permissions';
export {
  InMemoryMembershipRepository,
  MembershipRepositoryConflict,
} from './infrastructure/in-memory-membership-repository';
