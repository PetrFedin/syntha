import type { IntegrationCircuit } from "@/domain/execution/integration-resilience";
import {
  assessDecisionOperations,
  type DecisionOperationsAssessment,
  type DecisionOperationsPolicy,
} from "@/domain/operations/decision-operations-monitor";

import type { CommercialAuditIntegrityReport } from "../domain/commercial-audit-chain";
import type { IntegrationCommand } from "../domain/integration-command";
import type { IntegrationInboxRecord } from "../domain/integration-inbox";
import { verifyCommercialAuditChain } from "./commercial-audit-integrity";
import type { CommercialWorkflowRepository } from "./commercial-workflow-repository";

export interface IntegrationCommandReadModel {
  readonly id: string;
  readonly integrationId: string;
  readonly actionType: IntegrationCommand["actionType"];
  readonly status: IntegrationCommand["status"];
  readonly attempts: number;
  readonly availableAt: string;
  readonly updatedAt: string;
  readonly externalReference?: string;
  readonly lastError?: string;
}

export interface IntegrationInboxReadModel {
  readonly id: string;
  readonly integrationId: string;
  readonly externalEventId: string;
  readonly outcome: IntegrationInboxRecord["outcome"];
  readonly status: IntegrationInboxRecord["status"];
  readonly commandId?: string;
  readonly occurredAt: string;
  readonly receivedAt: string;
  readonly error?: string;
  readonly conflictReason?: string;
}

export interface IntegrationCircuitReadModel {
  readonly integrationId: string;
  readonly state: IntegrationCircuit["state"];
  readonly consecutiveFailures: number;
  readonly updatedAt: string;
  readonly retryAt?: string;
  readonly lastError?: string;
}

export interface CommercialOperationsMetrics {
  readonly pendingCommands: number;
  readonly processingCommands: number;
  readonly succeededCommands: number;
  readonly deadLetterCommands: number;
  readonly cancelledCommands: number;
  readonly appliedCallbacks: number;
  readonly orphanedCallbacks: number;
  readonly conflictingCallbacks: number;
  readonly openCircuits: number;
}

export interface CommercialOperationsReadModel {
  readonly workflowId: string;
  readonly version: number;
  readonly updatedAt: string;
  readonly assessment: DecisionOperationsAssessment;
  readonly auditIntegrity: CommercialAuditIntegrityReport;
  readonly metrics: CommercialOperationsMetrics;
  readonly commands: readonly IntegrationCommandReadModel[];
  readonly callbacks: readonly IntegrationInboxReadModel[];
  readonly circuits: readonly IntegrationCircuitReadModel[];
}

function countByStatus<T extends { readonly status: string }>(
  items: readonly T[],
  status: string,
): number {
  return items.filter((item) => item.status === status).length;
}

export async function getCommercialOperationsReadModel(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly workflowId: string;
  readonly assessedAt?: string;
  readonly policy?: DecisionOperationsPolicy;
}): Promise<CommercialOperationsReadModel | null> {
  const state = await input.repository.findById(input.workflowId);
  if (!state) return null;

  const assessment = assessDecisionOperations({
    monitorId: `commercial-execution:${state.id}`,
    approvalWorkflows: state.approvalWorkflows,
    executionJournals: state.executionJournals,
    outboxes: [state.outbox],
    policy: input.policy,
    assessedAt: input.assessedAt,
  });
  const auditIntegrity = verifyCommercialAuditChain({
    operationsAudit: state.operationsAudit,
    reconciliationAudit: state.integrationReconciliationAudit,
  });

  const commands = [...state.integrationCommands]
    .sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt) ||
      left.id.localeCompare(right.id),
    )
    .map<IntegrationCommandReadModel>((command) =>
      Object.freeze({
        id: command.id,
        integrationId: command.integrationId,
        actionType: command.actionType,
        status: command.status,
        attempts: command.attempts,
        availableAt: command.availableAt,
        updatedAt: command.updatedAt,
        externalReference: command.externalReference,
        lastError: command.lastError,
      }),
    );

  const callbacks = [...state.integrationInbox]
    .sort((left, right) =>
      right.receivedAt.localeCompare(left.receivedAt) ||
      left.id.localeCompare(right.id),
    )
    .map<IntegrationInboxReadModel>((callback) =>
      Object.freeze({
        id: callback.id,
        integrationId: callback.integrationId,
        externalEventId: callback.externalEventId,
        outcome: callback.outcome,
        status: callback.status,
        commandId: callback.commandId,
        occurredAt: callback.occurredAt,
        receivedAt: callback.receivedAt,
        error: callback.error,
        conflictReason: callback.conflictReason,
      }),
    );

  const circuits = [...state.integrationCircuits]
    .sort((left, right) => left.integrationId.localeCompare(right.integrationId))
    .map<IntegrationCircuitReadModel>((circuit) =>
      Object.freeze({
        integrationId: circuit.integrationId,
        state: circuit.state,
        consecutiveFailures: circuit.consecutiveFailures,
        updatedAt: circuit.updatedAt,
        retryAt: circuit.retryAt,
        lastError: circuit.lastError,
      }),
    );

  return Object.freeze({
    workflowId: state.id,
    version: state.version,
    updatedAt: state.updatedAt,
    assessment,
    auditIntegrity,
    metrics: Object.freeze({
      pendingCommands: countByStatus(state.integrationCommands, "pending"),
      processingCommands: countByStatus(state.integrationCommands, "processing"),
      succeededCommands: countByStatus(state.integrationCommands, "succeeded"),
      deadLetterCommands: countByStatus(
        state.integrationCommands,
        "dead_letter",
      ),
      cancelledCommands: countByStatus(state.integrationCommands, "cancelled"),
      appliedCallbacks: countByStatus(state.integrationInbox, "applied"),
      orphanedCallbacks: countByStatus(state.integrationInbox, "orphaned"),
      conflictingCallbacks: countByStatus(state.integrationInbox, "conflict"),
      openCircuits: state.integrationCircuits.filter(
        (circuit) => circuit.state === "open",
      ).length,
    }),
    commands: Object.freeze(commands),
    callbacks: Object.freeze(callbacks),
    circuits: Object.freeze(circuits),
  });
}
