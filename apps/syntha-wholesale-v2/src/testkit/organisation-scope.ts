export type OrganisationId = string & { readonly __brand: 'OrganisationId' };

export interface OrganisationScope {
  actorId: string;
  activeOrganisationId: OrganisationId;
}

export interface OrganisationOwnedRecord {
  organisationId: OrganisationId;
}

export class OrganisationScopeViolation extends Error {
  constructor(expected: OrganisationId, received: OrganisationId) {
    super(`Cross-organisation access denied: expected ${expected}, received ${received}`);
    this.name = 'OrganisationScopeViolation';
  }
}

export function organisationId(value: string): OrganisationId {
  const normalized = value.trim();
  if (!normalized) throw new Error('Organisation id must not be empty');
  return normalized as OrganisationId;
}

export function createOrganisationScope(input: {
  actorId?: string;
  activeOrganisationId?: OrganisationId;
} = {}): OrganisationScope {
  return {
    actorId: input.actorId ?? 'actor-test',
    activeOrganisationId: input.activeOrganisationId ?? organisationId('org-active'),
  };
}

export function assertOrganisationScope(
  scope: OrganisationScope,
  resourceOrganisationId: OrganisationId,
): void {
  if (scope.activeOrganisationId !== resourceOrganisationId) {
    throw new OrganisationScopeViolation(
      scope.activeOrganisationId,
      resourceOrganisationId,
    );
  }
}

export function selectOrganisationRecords<T extends OrganisationOwnedRecord>(
  scope: OrganisationScope,
  records: readonly T[],
): T[] {
  return records.filter(
    (record) => record.organisationId === scope.activeOrganisationId,
  );
}
