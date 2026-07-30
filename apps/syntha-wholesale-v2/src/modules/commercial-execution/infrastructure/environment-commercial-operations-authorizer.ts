import { timingSafeEqual } from "node:crypto";

import type {
  CommercialOperationsAccessRequest,
  CommercialOperationsAuthorizer,
  CommercialOperationsPermission,
} from "../application/commercial-operations-authorizer";
import { normalizeCommercialOrganizationId } from "../application/organization-scoped-commercial-workflow-repository";

interface OperationsCredential {
  readonly credentialId: string;
  readonly token: string;
  readonly organizations: readonly string[];
  readonly permissions: readonly CommercialOperationsPermission[];
}

const permissions = new Set<CommercialOperationsPermission>([
  "read",
  "operate",
  "worker",
  "schedule",
  "scheduler",
]);

function equal(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function strings(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must be a non-empty array.`);
  }
  return Object.freeze(
    value.map((item) => {
      if (typeof item !== "string" || !item.trim()) {
        throw new Error(`${field} must contain non-empty strings.`);
      }
      return item.trim();
    }),
  );
}

function decodeCredentials(raw: string): readonly OperationsCredential[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(
      "SYNTHA_OPERATIONS_CREDENTIALS_JSON must contain a non-empty JSON array.",
    );
  }
  const credentialIds = new Set<string>();
  const tokens = new Set<string>();
  return Object.freeze(
    parsed.map((value, index) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`Operations credential at index ${index} must be an object.`);
      }
      const candidate = value as Record<string, unknown>;
      const credentialId = candidate.credentialId;
      const token = candidate.token;
      if (typeof credentialId !== "string" || !credentialId.trim()) {
        throw new Error(`Operations credential at index ${index} requires credentialId.`);
      }
      if (credentialIds.has(credentialId)) {
        throw new Error(`Duplicate operations credential id: ${credentialId}.`);
      }
      credentialIds.add(credentialId);
      if (typeof token !== "string" || token.length < 24) {
        throw new Error(
          `Operations credential ${credentialId} requires a token of at least 24 characters.`,
        );
      }
      if (tokens.has(token)) {
        throw new Error("Operations credential tokens must be unique.");
      }
      tokens.add(token);
      const organizations = strings(
        candidate.organizations,
        `Operations credential ${credentialId} organizations`,
      ).map((organizationId) =>
        organizationId === "*"
          ? "*"
          : normalizeCommercialOrganizationId(organizationId),
      );
      const decodedPermissions = strings(
        candidate.permissions,
        `Operations credential ${credentialId} permissions`,
      ).map((permission) => {
        if (!permissions.has(permission as CommercialOperationsPermission)) {
          throw new Error(
            `Unsupported operations permission ${permission} for ${credentialId}.`,
          );
        }
        return permission as CommercialOperationsPermission;
      });
      return Object.freeze({
        credentialId,
        token,
        organizations: Object.freeze([...new Set(organizations)]),
        permissions: Object.freeze([...new Set(decodedPermissions)]),
      });
    }),
  );
}

function bearer(request: Request): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
}

export class EnvironmentCommercialOperationsAuthorizer
  implements CommercialOperationsAuthorizer
{
  private readonly credentials: readonly OperationsCredential[];

  constructor(
    environment: Readonly<Record<string, string | undefined>> = process.env,
  ) {
    const raw = environment.SYNTHA_OPERATIONS_CREDENTIALS_JSON;
    if (!raw?.trim()) {
      throw new Error("SYNTHA_OPERATIONS_CREDENTIALS_JSON is not configured.");
    }
    this.credentials = decodeCredentials(raw);
  }

  private matching(request: Request): readonly OperationsCredential[] {
    const token = bearer(request);
    if (!token) return Object.freeze([]);
    return Object.freeze(
      this.credentials.filter((credential) => equal(token, credential.token)),
    );
  }

  async authorize(request: Request): Promise<boolean> {
    return this.matching(request).length > 0;
  }

  async identifyCredential(request: Request): Promise<string | null> {
    return this.matching(request)[0]?.credentialId ?? null;
  }

  async authorizeAccess(
    request: Request,
    access: CommercialOperationsAccessRequest,
  ): Promise<boolean> {
    const organizationId = access.organizationId
      ? normalizeCommercialOrganizationId(access.organizationId)
      : undefined;
    return this.matching(request).some((credential) => {
      if (!credential.permissions.includes(access.permission)) return false;
      if (!organizationId) return credential.organizations.includes("*");
      return (
        credential.organizations.includes("*") ||
        credential.organizations.includes(organizationId)
      );
    });
  }
}
