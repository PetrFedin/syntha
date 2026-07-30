export type Permission =
  | 'identity.session.use'
  | 'organisation.members.read'
  | 'organisation.members.manage';

export class PermissionDenied extends Error {
  readonly permission: Permission;

  constructor(permission: Permission) {
    super(`Permission denied: ${permission}`);
    this.name = 'PermissionDenied';
    this.permission = permission;
  }
}

export function hasPermission(
  permissions: ReadonlySet<Permission>,
  permission: Permission,
): boolean {
  return permissions.has(permission);
}

export function assertPermission(
  permissions: ReadonlySet<Permission>,
  permission: Permission,
): void {
  if (!hasPermission(permissions, permission)) throw new PermissionDenied(permission);
}
