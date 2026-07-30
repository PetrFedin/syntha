import type { CommercialAuditChainFields } from "./commercial-audit-chain";

export type CommercialOperationsActionType =
  | "retry_command"
  | "cancel_command"
  | "reset_circuit";

export type CommercialOperationsActionOutcome =
  | "applied"
  | "not_found"
  | "invalid_state";

export interface CommercialOperationsAuditRecord
  extends CommercialAuditChainFields {
  readonly actionId: string;
  readonly actionType: CommercialOperationsActionType;
  readonly targetId: string;
  readonly actorId: string;
  readonly reason?: string;
  readonly outcome: CommercialOperationsActionOutcome;
  readonly occurredAt: string;
  readonly beforeStatus?: string;
  readonly afterStatus?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}
