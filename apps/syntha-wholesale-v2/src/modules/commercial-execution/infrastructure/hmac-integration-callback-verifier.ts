import { createHmac, timingSafeEqual } from "node:crypto";

import type {
  IntegrationCallbackVerificationRequest,
  IntegrationCallbackVerificationResult,
  IntegrationCallbackVerifier,
} from "../application/integration-callback-verifier";
import { normalizeCommercialOrganizationId } from "../application/organization-scoped-commercial-workflow-repository";

export interface IntegrationSigningKey {
  readonly keyId: string;
  readonly organizationId: string;
  readonly integrationId: string;
  readonly secret: string;
  readonly activeFrom?: string;
  readonly activeUntil?: string;
}

function parsedDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function normalizedSignature(signature: string): string {
  const trimmed = signature.trim().toLowerCase();
  return trimmed.startsWith("sha256=") ? trimmed.slice(7) : trimmed;
}

function activeAt(key: IntegrationSigningKey, timestamp: Date): boolean {
  if (key.activeFrom && parsedDate(key.activeFrom, "Signing key activeFrom") > timestamp) {
    return false;
  }
  if (key.activeUntil && parsedDate(key.activeUntil, "Signing key activeUntil") < timestamp) {
    return false;
  }
  return true;
}

export function createHmacIntegrationSignature(input: {
  readonly secret: string;
  readonly timestamp: string;
  readonly rawBody: string;
}): string {
  return `sha256=${createHmac("sha256", input.secret)
    .update(`${input.timestamp}.${input.rawBody}`, "utf8")
    .digest("hex")}`;
}

export class HmacIntegrationCallbackVerifier
  implements IntegrationCallbackVerifier
{
  private readonly toleranceSeconds: number;

  constructor(
    private readonly keys: readonly IntegrationSigningKey[],
    options: { readonly toleranceSeconds?: number } = {},
  ) {
    this.toleranceSeconds = Math.max(
      1,
      Math.floor(options.toleranceSeconds ?? 300),
    );
  }

  async verify(
    request: IntegrationCallbackVerificationRequest,
    now: string = new Date().toISOString(),
  ): Promise<IntegrationCallbackVerificationResult> {
    if (!request.integrationId.trim()) {
      return Object.freeze({
        verified: false,
        reason: "Integration id is required for callback verification.",
      });
    }
    let organizationId: string;
    try {
      organizationId = normalizeCommercialOrganizationId(request.organizationId);
    } catch {
      return Object.freeze({
        verified: false,
        reason: "Organization id is invalid for callback verification.",
      });
    }
    const requestTime = parsedDate(request.timestamp, "Callback signature timestamp");
    const currentTime = parsedDate(now, "Callback verification time");
    const ageSeconds = Math.abs(
      currentTime.getTime() - requestTime.getTime(),
    ) / 1000;
    if (ageSeconds > this.toleranceSeconds) {
      return Object.freeze({
        verified: false,
        reason: "Callback signature timestamp is outside the replay-protection window.",
      });
    }

    const candidates = this.keys.filter(
      (key) =>
        key.organizationId === organizationId &&
        key.integrationId === request.integrationId &&
        (!request.keyId || key.keyId === request.keyId) &&
        activeAt(key, requestTime),
    );
    if (candidates.length === 0) {
      return Object.freeze({
        verified: false,
        reason: "No active tenant signing key matches the callback.",
      });
    }

    const received = normalizedSignature(request.signature);
    if (!/^[a-f0-9]{64}$/.test(received)) {
      return Object.freeze({
        verified: false,
        reason: "Callback signature has an invalid format.",
      });
    }
    const receivedBytes = Buffer.from(received, "hex");
    for (const key of candidates) {
      const expected = normalizedSignature(
        createHmacIntegrationSignature({
          secret: key.secret,
          timestamp: request.timestamp,
          rawBody: request.rawBody,
        }),
      );
      const expectedBytes = Buffer.from(expected, "hex");
      if (
        receivedBytes.length === expectedBytes.length &&
        timingSafeEqual(receivedBytes, expectedBytes)
      ) {
        return Object.freeze({
          verified: true,
          reason: "Callback signature is valid.",
          keyId: key.keyId,
        });
      }
    }

    return Object.freeze({
      verified: false,
      reason: "Callback signature does not match any active tenant signing key.",
    });
  }
}
