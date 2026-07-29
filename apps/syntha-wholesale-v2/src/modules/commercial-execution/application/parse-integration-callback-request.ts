import type { IntegrationCallbackVerificationRequest } from "./integration-callback-verifier";
import type { IntegrationCallback } from "./reconcile-integration-callback";

export interface ParsedIntegrationCallbackRequest {
  readonly callback: IntegrationCallback;
  readonly verificationRequest: IntegrationCallbackVerificationRequest;
}

function requiredString(
  value: unknown,
  field: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string when provided.`);
  }
  return value;
}

function iso(value: unknown, field: string): string {
  const text = requiredString(value, field);
  const timestamp = Date.parse(text);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp).toISOString();
}

function payload(value: unknown): Readonly<Record<string, unknown>> | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Callback payload must be an object when provided.");
  }
  return Object.freeze({ ...(value as Record<string, unknown>) });
}

export function parseIntegrationCallbackRequest(input: {
  readonly integrationId: string;
  readonly rawBody: string;
  readonly signature: string | null;
  readonly timestamp: string | null;
  readonly keyId?: string | null;
}): ParsedIntegrationCallbackRequest {
  const integrationId = requiredString(input.integrationId, "Integration id");
  const signature = requiredString(input.signature, "Callback signature");
  const timestamp = requiredString(input.timestamp, "Callback timestamp");
  let parsed: unknown;
  try {
    parsed = JSON.parse(input.rawBody);
  } catch {
    throw new Error("Callback body must contain valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Callback body must contain a JSON object.");
  }
  const body = parsed as Record<string, unknown>;
  if (
    body.integrationId !== undefined &&
    body.integrationId !== integrationId
  ) {
    throw new Error("Callback integration id does not match the route.");
  }
  const outcome = body.outcome;
  if (
    outcome !== "succeeded" &&
    outcome !== "rejected" &&
    outcome !== "cancelled"
  ) {
    throw new Error("Callback outcome must be succeeded, rejected or cancelled.");
  }

  return Object.freeze({
    callback: Object.freeze({
      externalEventId: requiredString(
        body.externalEventId,
        "External event id",
      ),
      integrationId,
      outcome,
      occurredAt: iso(body.occurredAt, "Callback occurredAt"),
      commandId: optionalString(body.commandId, "Callback commandId"),
      idempotencyKey: optionalString(
        body.idempotencyKey,
        "Callback idempotencyKey",
      ),
      externalReference: optionalString(
        body.externalReference,
        "Callback externalReference",
      ),
      error: optionalString(body.error, "Callback error"),
      payload: payload(body.payload),
    }),
    verificationRequest: Object.freeze({
      integrationId,
      signature,
      timestamp,
      keyId: optionalString(input.keyId, "Callback key id"),
      rawBody: input.rawBody,
    }),
  });
}
