export type IntegrationCallbackOutcome =
  | "succeeded"
  | "rejected"
  | "cancelled";

export type IntegrationInboxStatus =
  | "applied"
  | "orphaned"
  | "conflict";

export interface IntegrationInboxRecord {
  readonly id: string;
  readonly integrationId: string;
  readonly externalEventId: string;
  readonly outcome: IntegrationCallbackOutcome;
  readonly status: IntegrationInboxStatus;
  readonly occurredAt: string;
  readonly receivedAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly commandId?: string;
  readonly externalReference?: string;
  readonly error?: string;
  readonly conflictReason?: string;
}
