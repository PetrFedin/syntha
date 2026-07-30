import type { IntegrationCommand } from "../domain/integration-command";
import type { IntegrationInboxRecord } from "../domain/integration-inbox";
import type { IntegrationReconciliationAuditRecord } from "../domain/integration-reconciliation-audit";
import { sealCommercialAuditRecord } from "./commercial-audit-integrity";
import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "./commercial-workflow-repository";
import { WorkflowVersionConflictError } from "./commercial-workflow-repository";

export interface IntegrationReconciliationJobResult {
  readonly status: "completed" | "completed_with_unresolved" | "duplicate" | "not_found";
  readonly workflowId: string;
  readonly audit?: IntegrationReconciliationAuditRecord;
  readonly state?: CommercialWorkflowState;
}

function required(value: string, field: string): string {
  if (!value.trim()) throw new Error(`${field} is required.`);
  return value;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function findCommand(
  state: CommercialWorkflowState,
  record: IntegrationInboxRecord,
): IntegrationCommand | undefined {
  if (record.commandId) {
    const direct = state.integrationCommands.find((command) => command.id === record.commandId);
    if (direct) return direct;
  }
  if (record.externalReference) {
    const byReference = state.integrationCommands.find(
      (command) => command.externalReference === record.externalReference,
    );
    if (byReference) return byReference;
  }
  const commandId = stringValue(record.payload.commandId);
  const idempotencyKey = stringValue(record.payload.idempotencyKey);
  const externalReference = stringValue(record.payload.externalReference);
  return state.integrationCommands.find(
    (command) =>
      (commandId && command.id === commandId) ||
      (idempotencyKey && command.idempotencyKey === idempotencyKey) ||
      (externalReference && command.externalReference === externalReference),
  );
}

function reconcile(input: {
  readonly command: IntegrationCommand;
  readonly record: IntegrationInboxRecord;
  readonly occurredAt: string;
}): IntegrationCommand | null {
  const { command, record, occurredAt } = input;
  if (command.integrationId !== record.integrationId) return null;
  if (record.outcome === "succeeded") {
    if (command.status === "dead_letter" || command.status === "cancelled") return null;
    return Object.freeze({
      ...command,
      status: "succeeded",
      completedAt: record.occurredAt,
      updatedAt: occurredAt,
      externalReference: record.externalReference ?? command.externalReference,
      lockedBy: undefined,
      lockedUntil: undefined,
      lastError: undefined,
    });
  }
  if (command.status === "succeeded") return null;
  if (record.outcome === "rejected") {
    return Object.freeze({
      ...command,
      status: "dead_letter",
      completedAt: record.occurredAt,
      updatedAt: occurredAt,
      externalReference: record.externalReference ?? command.externalReference,
      lockedBy: undefined,
      lockedUntil: undefined,
      lastError: record.error ?? "External integration rejected the command.",
    });
  }
  return Object.freeze({
    ...command,
    status: "cancelled",
    completedAt: record.occurredAt,
    updatedAt: occurredAt,
    externalReference: record.externalReference ?? command.externalReference,
    lockedBy: undefined,
    lockedUntil: undefined,
    lastError: record.error,
  });
}

function replaceCommand(
  commands: readonly IntegrationCommand[],
  command: IntegrationCommand,
): readonly IntegrationCommand[] {
  return Object.freeze(
    commands.map((candidate) => (candidate.id === command.id ? command : candidate)),
  );
}

export async function runIntegrationReconciliationJob(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly workflowId: string;
  readonly jobId: string;
  readonly actorId: string;
  readonly occurredAt?: string;
  readonly maximumRecords?: number;
  readonly maximumSaveAttempts?: number;
}): Promise<IntegrationReconciliationJobResult> {
  required(input.workflowId, "Workflow id");
  required(input.jobId, "Reconciliation job id");
  required(input.actorId, "Reconciliation actor id");
  const occurredAt = new Date(input.occurredAt ?? new Date().toISOString()).toISOString();
  const maximumRecords = Math.max(1, Math.min(1000, Math.floor(input.maximumRecords ?? 100)));
  const maximumSaveAttempts = Math.max(1, Math.floor(input.maximumSaveAttempts ?? 5));

  for (let attempt = 1; attempt <= maximumSaveAttempts; attempt += 1) {
    const current = await input.repository.findById(input.workflowId);
    if (!current) return Object.freeze({ status: "not_found", workflowId: input.workflowId });
    const existing = current.integrationReconciliationAudit.find(
      (record) => record.jobId === input.jobId,
    );
    if (existing) {
      return Object.freeze({
        status: "duplicate",
        workflowId: input.workflowId,
        audit: existing,
        state: current,
      });
    }

    let commands = current.integrationCommands;
    let appliedRecords = 0;
    let unresolvedRecords = 0;
    const selected = current.integrationInbox
      .filter((record) => record.status === "orphaned" || record.status === "conflict")
      .slice(0, maximumRecords);
    const selectedIds = new Set(selected.map((record) => record.id));
    const inbox = current.integrationInbox.map((record) => {
      if (!selectedIds.has(record.id)) return record;
      const command = findCommand({ ...current, integrationCommands: commands }, record);
      if (!command) {
        unresolvedRecords += 1;
        return record;
      }
      const updated = reconcile({ command, record, occurredAt });
      if (!updated) {
        unresolvedRecords += 1;
        return record;
      }
      commands = replaceCommand(commands, updated);
      appliedRecords += 1;
      return Object.freeze({
        ...record,
        status: "applied" as const,
        commandId: updated.id,
        conflictReason: undefined,
        reconciledAt: occurredAt,
      });
    });
    const audit = sealCommercialAuditRecord({
      stream: "reconciliation",
      record: Object.freeze({
        jobId: input.jobId,
        actorId: input.actorId,
        workflowId: input.workflowId,
        status: unresolvedRecords > 0 ? "completed_with_unresolved" : "completed",
        scannedRecords: selected.length,
        appliedRecords,
        unresolvedRecords,
        occurredAt,
      }) satisfies IntegrationReconciliationAuditRecord,
      operationsAudit: current.operationsAudit,
      reconciliationAudit: current.integrationReconciliationAudit,
    });
    const next: CommercialWorkflowState = Object.freeze({
      ...current,
      integrationCommands: Object.freeze([...commands]),
      integrationInbox: Object.freeze(inbox),
      integrationReconciliationAudit: Object.freeze([
        ...current.integrationReconciliationAudit,
        audit,
      ]),
      updatedAt: occurredAt,
    });
    try {
      const saved = await input.repository.save(next, current.version);
      return Object.freeze({
        status: audit.status,
        workflowId: input.workflowId,
        audit,
        state: saved,
      });
    } catch (error) {
      if (!(error instanceof WorkflowVersionConflictError) || attempt === maximumSaveAttempts) {
        throw error;
      }
    }
  }
  throw new Error("Integration reconciliation save attempts were exhausted.");
}
