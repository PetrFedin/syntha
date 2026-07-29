import type { IntegrationSigningKeyProvider } from "../application/integration-signing-key-provider";
import type { IntegrationSigningKey } from "./hmac-integration-callback-verifier";

function validateDate(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(value).toISOString();
}

function decodeKeys(raw: string): readonly IntegrationSigningKey[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("SYNTHA_INTEGRATION_SIGNING_KEYS_JSON must contain a JSON array.");
  }
  const seen = new Set<string>();
  return Object.freeze(
    parsed.map((value, index) => {
      if (!value || typeof value !== "object") {
        throw new Error(`Signing key at index ${index} must be an object.`);
      }
      const candidate = value as Record<string, unknown>;
      const keyId = candidate.keyId;
      const integrationId = candidate.integrationId;
      const secret = candidate.secret;
      if (typeof keyId !== "string" || !keyId.trim()) {
        throw new Error(`Signing key at index ${index} requires keyId.`);
      }
      if (typeof integrationId !== "string" || !integrationId.trim()) {
        throw new Error(`Signing key at index ${index} requires integrationId.`);
      }
      if (typeof secret !== "string" || secret.length < 16) {
        throw new Error(
          `Signing key at index ${index} requires a secret of at least 16 characters.`,
        );
      }
      const identity = `${integrationId}:${keyId}`;
      if (seen.has(identity)) {
        throw new Error(`Duplicate integration signing key: ${identity}.`);
      }
      seen.add(identity);
      return Object.freeze({
        keyId,
        integrationId,
        secret,
        activeFrom: validateDate(candidate.activeFrom, "Signing key activeFrom"),
        activeUntil: validateDate(candidate.activeUntil, "Signing key activeUntil"),
      });
    }),
  );
}

export class EnvironmentIntegrationSigningKeyProvider
  implements IntegrationSigningKeyProvider
{
  constructor(
    private readonly environment: Readonly<Record<string, string | undefined>> =
      process.env,
  ) {}

  async load(integrationId?: string): Promise<readonly IntegrationSigningKey[]> {
    const raw = this.environment.SYNTHA_INTEGRATION_SIGNING_KEYS_JSON;
    if (!raw?.trim()) {
      throw new Error("SYNTHA_INTEGRATION_SIGNING_KEYS_JSON is not configured.");
    }
    const keys = decodeKeys(raw);
    return integrationId
      ? Object.freeze(keys.filter((key) => key.integrationId === integrationId))
      : keys;
  }
}
