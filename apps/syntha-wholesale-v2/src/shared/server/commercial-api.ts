import {
  EnvironmentCommercialOperationsAuthorizer,
  requireCommercialOrganizationId,
  type CommercialOperationsAuthorizer,
  type CommercialOperationsPermission,
} from '@/modules/commercial-execution';
import { organisationId, type OrganisationId } from '@/modules/organisations';

export class CommercialApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message = code,
  ) {
    super(message);
    this.name = 'CommercialApiError';
  }
}

let authorizer: CommercialOperationsAuthorizer | null = null;

function getAuthorizer(): CommercialOperationsAuthorizer {
  if (!authorizer) {
    try {
      authorizer = new EnvironmentCommercialOperationsAuthorizer();
    } catch {
      throw new CommercialApiError(
        503,
        'commercial_authorization_unavailable',
        'Commercial authorization is not configured',
      );
    }
  }
  return authorizer;
}

export function resetCommercialApiAuthorizer(): void {
  authorizer = null;
}

export async function requireCommercialApiAccess(
  request: Request,
  permission: CommercialOperationsPermission,
): Promise<{
  readonly organisationId: OrganisationId;
  readonly actorCredentialId: string;
}> {
  const operationsAuthorizer = getAuthorizer();
  if (!(await operationsAuthorizer.authorize(request))) {
    throw new CommercialApiError(401, 'unauthorized');
  }

  let normalizedOrganisationId: string;
  try {
    normalizedOrganisationId = requireCommercialOrganizationId(
      request.headers.get('x-syntha-organization-id'),
    );
  } catch {
    throw new CommercialApiError(400, 'organization_id_required');
  }

  if (
    !(await operationsAuthorizer.authorizeAccess(request, {
      permission,
      organizationId: normalizedOrganisationId,
    }))
  ) {
    throw new CommercialApiError(403, 'forbidden');
  }

  const actorCredentialId = await operationsAuthorizer.identifyCredential?.(request);
  if (!actorCredentialId) {
    throw new CommercialApiError(401, 'credential_identity_unavailable');
  }

  return Object.freeze({
    organisationId: organisationId(normalizedOrganisationId),
    actorCredentialId,
  });
}

export async function requireJsonObject(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new CommercialApiError(400, 'invalid_json');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CommercialApiError(400, 'json_object_required');
  }
  return value as Record<string, unknown>;
}

export function requiredString(
  value: unknown,
  field: string,
): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new CommercialApiError(400, 'invalid_field', `${field} is required`);
  }
  return value.trim();
}

export function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !value.trim()) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be a non-empty string`);
  }
  return value.trim();
}

export function requiredDate(value: unknown, field: string): Date {
  const raw = requiredString(value, field);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be an ISO date`);
  }
  return date;
}

export function optionalDate(value: unknown, field: string): Date | undefined {
  if (value === undefined) return undefined;
  return requiredDate(value, field);
}

export function requiredPositiveInteger(value: unknown, field: string): number {
  if (!Number.isInteger(value) || Number(value) < 1) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be a positive integer`);
  }
  return Number(value);
}
