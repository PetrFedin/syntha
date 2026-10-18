import type { OrganisationId } from './organisation-scope';
import { createOrganisationScope, type OrganisationScope } from './organisation-scope';

export interface AuthorizationFixture extends OrganisationScope {
  permissions: ReadonlySet<string>;
}

export class PermissionDenied extends Error {
  constructor(permission: string) {
    super(`Permission denied: ${permission}`);
    this.name = 'PermissionDenied';
  }
}

export function createAuthorizationFixture(input: {
  actorId?: string;
  activeOrganisationId?: OrganisationId;
  permissions?: readonly string[];
} = {}): AuthorizationFixture {
  const scope = createOrganisationScope(input);
  return {
    ...scope,
    permissions: new Set(input.permissions ?? []),
  };
}

export function requirePermission(
  fixture: AuthorizationFixture,
  permission: string,
): void {
  if (!fixture.permissions.has(permission)) {
    throw new PermissionDenied(permission);
  }
}
