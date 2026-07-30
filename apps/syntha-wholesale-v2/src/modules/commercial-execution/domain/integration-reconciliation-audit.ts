import type { CommercialAuditChainFields } from "./commercial-audit-chain";

export type IntegrationReconciliationJobStatus =
  | "completed"
  | "completed_with_unresolved";

export interface IntegrationReconciliationAuditRecord
  extends CommercialAuditChainFields {
  readonly jobId: string;
  readonly actorId: string;
  readonly workflowId: string;
  readonly status: IntegrationReconciliationJobStatus;
  readonly scannedRecords: number;
  readonly appliedRecords: number;
  readonly unresolvedRecords: number;
  readonly occurredAt: string;
}
