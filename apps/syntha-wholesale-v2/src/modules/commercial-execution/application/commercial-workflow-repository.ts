import type { TransactionalOutbox } from "@/domain/events/transactional-outbox";
import { createTransactionalOutbox } from "@/domain/events/transactional-outbox";
import type { ApprovalWorkflow } from "@/domain/execution/approval-workflow";
import type { ExecutionJournal } from "@/domain/execution/execution-journal";
import type { IdempotencyRegistry } from "@/domain/execution/idempotency-engine";
import { createIdempotencyRegistry } from "@/domain/execution/idempotency-engine";
import type { IntegrationCircuit } from "@/domain/execution/integration-resilience";

import type { CommercialOperationsAuditRecord } from "../domain/commercial-operations-audit";
import type { IntegrationCommand } from "../domain/integration-command";
import type { IntegrationInboxRecord } from "../domain/integration-inbox";

export interface CommercialWorkflowState {
  readonly id: string;
  readonly version: number;
  readonly idempotencyRegistry: IdempotencyRegistry;
  readonly approvalWorkflows: readonly ApprovalWorkflow[];
  readonly executionJournals: readonly ExecutionJournal[];
  readonly outbox: TransactionalOutbox;
  readonly integrationCircuits: readonly IntegrationCircuit[];
  readonly integrationCommands: readonly IntegrationCommand[];
  readonly integrationInbox: readonly IntegrationInboxRecord[];
  readonly operationsAudit: readonly CommercialOperationsAuditRecord[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class WorkflowVersionConflictError extends Error {
  constructor(
    readonly workflowId: string,
    readonly expectedVersion: number,
    readonly actualVersion: number | null,
  ) {
    super(
      `Workflow ${workflowId} version conflict: expected ${expectedVersion}, actual ${actualVersion ?? "missing"}.`,
    );
    this.name = "WorkflowVersionConflictError";
  }
}

export interface CommercialWorkflowRepository {
  findById(id: string): Promise<CommercialWorkflowState | null>;
  save(
    state: CommercialWorkflowState,
    expectedVersion: number,
  ): Promise<CommercialWorkflowState>;
}

export function createCommercialWorkflowState(input: {
  readonly id: string;
  readonly createdAt?: string;
}): CommercialWorkflowState {
  if (!input.id.trim()) throw new Error("Commercial workflow id is required.");
  const createdAt = new Date(
    input.createdAt ?? new Date().toISOString(),
  ).toISOString();
  return Object.freeze({
    id: input.id,
    version: 0,
    idempotencyRegistry: createIdempotencyRegistry(),
    approvalWorkflows: Object.freeze([]),
    executionJournals: Object.freeze([]),
    outbox: createTransactionalOutbox(),
    integrationCircuits: Object.freeze([]),
    integrationCommands: Object.freeze([]),
    integrationInbox: Object.freeze([]),
    operationsAudit: Object.freeze([]),
    createdAt,
    updatedAt: createdAt,
  });
}
