import type { IntegrationCircuit } from "@/domain/execution/integration-resilience";

import type {
  CommercialOperationsActionOutcome,
  CommercialOperationsActionType,
  CommercialOperationsAuditRecord,
} from "../domain/commercial-operations-audit";
import type { IntegrationCommand } from "../domain/integration-command";
import { sealCommercialAuditRecord } from "./commercial-audit-integrity";
import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "./commercial-workflow-repository";
import { WorkflowVersionConflictError } from "./commercial-workflow-repository";

export interface CommercialOperationsAction {
  readonly actionId: string;
  readonly actionType: CommercialOperationsActionType;
  readonly targetId: string;
  readonly actorId: string;
  readonly reason?: string;
}

export interface CommercialOperationsActionResult {
  readonly status: CommercialOperationsActionOutcome | "duplicate";
  readonly workflowId: string;
  readonly audit?: CommercialOperationsAuditRecord;
  readonly state?: CommercialWorkflowState;
}

function required(value: string, field: string): string {
  if (!value.trim()) throw new Error(`${field} is required.`);
  return value;
}

function replaceCommand(
  commands: readonly IntegrationCommand[],
  command: IntegrationCommand,
): readonly IntegrationCommand[] {
  return Object.freeze(
    commands.map((candidate) =>
      candidate.id === command.id ? command : candidate,
    ),
  );
}

function replaceCircuit(
  circuits: readonly IntegrationCircuit[],
  circuit: IntegrationCircuit,
): readonly IntegrationCircuit[] {
  return Object.freeze(
    circuits.map((candidate) =>
      candidate.integrationId === circuit.integrationId ? circuit : candidate,
    ),
  );
}

function applyToState(input: {
  readonly state: CommercialWorkflowState;
  readonly action: CommercialOperationsAction;
  readonly occurredAt: string;
}): {
  readonly state: CommercialWorkflowState;
  readonly audit: CommercialOperationsAuditRecord;
} {
  const { state, action, occurredAt } = input;
  let outcome: CommercialOperationsActionOutcome = "not_found";
  let beforeStatus: string | undefined;
  let afterStatus: string | undefined;
  let metadata: Readonly<Record<string, string | number | boolean>> | undefined;
  let nextState = state;

  if (action.actionType === "reset_circuit") {
    const circuit = state.integrationCircuits.find(
      (candidate) => candidate.integrationId === action.targetId,
    );
    if (circuit) {
      beforeStatus = circuit.state;
      afterStatus = "closed";
      outcome = "applied";
      const reset: IntegrationCircuit = Object.freeze({
        integrationId: circuit.integrationId,
        state: "closed",
        consecutiveFailures: 0,
        halfOpenSuccesses: 0,
        updatedAt: occurredAt,
        lastFailureAt: circuit.lastFailureAt,
        lastSuccessAt: circuit.lastSuccessAt,
      });
      nextState = Object.freeze({
        ...state,
        integrationCircuits: replaceCircuit(state.integrationCircuits, reset),
      });
    }
  } else {
    const command = state.integrationCommands.find(
      (candidate) => candidate.id === action.targetId,
    );
    if (command) {
      beforeStatus = command.status;
      if (action.actionType === "retry_command") {
        if (command.status === "dead_letter") {
          outcome = "applied";
          afterStatus = "pending";
          metadata = Object.freeze({ previousAttempts: command.attempts });
          const retried: IntegrationCommand = Object.freeze({
            ...command,
            status: "pending",
            attempts: 0,
            availableAt: occurredAt,
            updatedAt: occurredAt,
            completedAt: undefined,
            lockedBy: undefined,
            lockedUntil: undefined,
            lastError: undefined,
          });
          nextState = Object.freeze({
            ...state,
            integrationCommands: replaceCommand(
              state.integrationCommands,
              retried,
            ),
          });
        } else {
          outcome = "invalid_state";
          afterStatus = command.status;
        }
      } else if (command.status === "succeeded" || command.status === "cancelled") {
        outcome = "invalid_state";
        afterStatus = command.status;
      } else {
        outcome = "applied";
        afterStatus = "cancelled";
        const cancelled: IntegrationCommand = Object.freeze({
          ...command,
          status: "cancelled",
          updatedAt: occurredAt,
          completedAt: occurredAt,
          lockedBy: undefined,
          lockedUntil: undefined,
        });
        nextState = Object.freeze({
          ...state,
          integrationCommands: replaceCommand(
            state.integrationCommands,
            cancelled,
          ),
        });
      }
    }
  }

  const audit = sealCommercialAuditRecord({
    stream: "operations",
    record: Object.freeze({
      actionId: action.actionId,
      actionType: action.actionType,
      targetId: action.targetId,
      actorId: action.actorId,
      reason: action.reason,
      outcome,
      occurredAt,
      beforeStatus,
      afterStatus,
      metadata,
    }) satisfies CommercialOperationsAuditRecord,
    operationsAudit: state.operationsAudit,
    reconciliationAudit: state.integrationReconciliationAudit,
  });
  return Object.freeze({
    audit,
    state: Object.freeze({
      ...nextState,
      operationsAudit: Object.freeze([...state.operationsAudit, audit]),
      updatedAt: occurredAt,
    }),
  });
}

export async function applyCommercialOperationsAction(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly workflowId: string;
  readonly action: CommercialOperationsAction;
  readonly occurredAt?: string;
  readonly maximumSaveAttempts?: number;
}): Promise<CommercialOperationsActionResult> {
  required(input.workflowId, "Workflow id");
  required(input.action.actionId, "Operations action id");
  required(input.action.targetId, "Operations action target id");
  required(input.action.actorId, "Operations actor id");
  const occurredAt = new Date(
    input.occurredAt ?? new Date().toISOString(),
  ).toISOString();
  const maximumSaveAttempts = Math.max(
    1,
    Math.floor(input.maximumSaveAttempts ?? 5),
  );

  for (let attempt = 1; attempt <= maximumSaveAttempts; attempt += 1) {
    const current = await input.repository.findById(input.workflowId);
    if (!current) {
      return Object.freeze({
        status: "not_found",
        workflowId: input.workflowId,
      });
    }
    const existingAudit = current.operationsAudit.find(
      (record) => record.actionId === input.action.actionId,
    );
    if (existingAudit) {
      return Object.freeze({
        status: "duplicate",
        workflowId: input.workflowId,
        audit: existingAudit,
        state: current,
      });
    }
    const applied = applyToState({
      state: current,
      action: input.action,
      occurredAt,
    });
    try {
      const saved = await input.repository.save(applied.state, current.version);
      return Object.freeze({
        status: applied.audit.outcome,
        workflowId: input.workflowId,
        audit: applied.audit,
        state: saved,
      });
    } catch (error) {
      if (
        !(error instanceof WorkflowVersionConflictError) ||
        attempt === maximumSaveAttempts
      ) {
        throw error;
      }
    }
  }
  throw new Error("Commercial operations action save attempts were exhausted.");
}
