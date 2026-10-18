export type OrganisationId = string & { readonly __brand: 'OrganisationId' };

export type OrganisationType = 'BRAND' | 'SHOP';
export type OrganisationStatus = 'ACTIVE' | 'SUSPENDED';

export interface Organisation {
  readonly id: OrganisationId;
  readonly type: OrganisationType;
  readonly displayName: string;
  readonly legalName?: string;
  readonly countryCode?: string;
  readonly status: OrganisationStatus;
  readonly createdAt: string;
}

export interface OrganisationRegistered {
  readonly type: 'OrganisationRegistered';
  readonly organisationId: OrganisationId;
  readonly organisationType: OrganisationType;
  readonly occurredAt: string;
}

export interface OrganisationRegistration {
  readonly organisation: Organisation;
  readonly event: OrganisationRegistered;
}

export interface RegisterOrganisationInput {
  readonly id: string;
  readonly type: OrganisationType;
  readonly displayName: string;
  readonly legalName?: string;
  readonly countryCode?: string;
  readonly status?: OrganisationStatus;
  readonly now?: Date;
}

export class OrganisationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrganisationDomainError';
  }
}

function requiredText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new OrganisationDomainError(`${label} must not be empty`);
  return normalized;
}

function optionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function organisationId(value: string): OrganisationId {
  return requiredText(value, 'Organisation id') as OrganisationId;
}

export function registerOrganisation(input: RegisterOrganisationInput): OrganisationRegistration {
  const occurredAt = (input.now ?? new Date()).toISOString();
  const organisation: Organisation = Object.freeze({
    id: organisationId(input.id),
    type: input.type,
    displayName: requiredText(input.displayName, 'Display name'),
    legalName: optionalText(input.legalName),
    countryCode: optionalText(input.countryCode)?.toUpperCase(),
    status: input.status ?? 'ACTIVE',
    createdAt: occurredAt,
  });

  const event: OrganisationRegistered = Object.freeze({
    type: 'OrganisationRegistered',
    organisationId: organisation.id,
    organisationType: organisation.type,
    occurredAt,
  });

  return Object.freeze({ organisation, event });
}
