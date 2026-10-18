import {
  createIntegrationCircuit,
  evaluateIntegrationAttempt,
  recordIntegrationFailure,
  recordIntegrationSuccess,
  type IntegrationCircuit,
  type IntegrationResiliencePolicy,
} from "@/domain/execution/integration-resilience";

import type { IntegrationCommand } from "../domain/integration-command";
import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "./commercial-workflow-repository";
import { WorkflowVersionConflictError } from "./commercial-workflow-repository";

export interface IntegrationCommandTransport {
  execute(command: IntegrationCommand): Promise<{
    readonly externalReference?: string;
  }>;
}

export type IntegrationDispatchStatus =
  | "no_command"
  | "circuit_open"
  | "succeeded"
  | "retry_scheduled"
  | "dead_letter"
  | "storage_conflict";

export interface IntegrationDispatchResult {
  readonly status: IntegrationDispatchStatus;
  readonly workflowId: string;
  readonly commandId?: string;
  readonly retryAt?: string;
  readonly externalReference?: string;
  readonly error?: string;
}

function date(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function replaceCircuit(
  state: CommercialWorkflowState,
  circuit: IntegrationCircuit,
): readonly IntegrationCircuit[] {
  return Object.freeze([
    ...state.integrationCircuits.filter(
      (candidate) => candidate.integrationId !== circuit.integrationId,
    ),
    circuit,
  ]);
}

function replaceCommand(
  state: CommercialWorkflowState,
  command: IntegrationCommand,
): readonly IntegrationCommand[] {
  return Object.freeze(
    state.integrationCommands.map((candidate) =>
      candidate.id === command.id ? command : candidate,
    ),
  );
}

async function mutateWithRetry(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly workflowId: string;
  readonly mutate: (state: CommercialWorkflowState) => CommercialWorkflowState;
  readonly maximumAttempts?: number;
}): Promise<CommercialWorkflowState> {
  const maximumAttempts = Math.max(1, Math.floor(input.maximumAttempts ?? 5));
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    const current = await input.repository.findById(input.workflowId);
    if (!current) throw new Error(`Workflow ${input.workflowId} was not found.`);
    try {
      return await input.repository.save(input.mutate(current), current.version);
    } catch (error) {
      if (
        !(error instanceof WorkflowVersionConflictError) ||
        attempt === maximumAttempts
      ) {
        throw error;
      }
    }
  }
  throw new WorkflowVersionConflictError(input.workflowId, -1, null);
}

export async function dispatchNextIntegrationCommand(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly transport: IntegrationCommandTransport;
  readonly workflowId: string;
  readonly integrationId: string;
  readonly workerId: string;
  readonly policy?: IntegrationResiliencePolicy;
  readonly now?: string;
  readonly leaseSeconds?: number;
  readonly retryable?: (error: unknown) => boolean;
}): Promise<IntegrationDispatchResult> {
  if (!input.workerId.trim()) {
    throw new Error("Integration worker id is required.");
  }
  const now = date(input.now ?? new Date().toISOString(), "Dispatch time");
  const leaseSeconds = Math.max(1, Math.floor(input.leaseSeconds ?? 60));
  const current = await input.repository.findById(input.workflowId);
  if (!current) {
    return Object.freeze({
      status: "no_command",
      workflowId: input.workflowId,
    });
  }

  const command = [...current.integrationCommands]
    .filter((candidate) => candidate.integrationId === input.integrationId)
    .filter((candidate) => {
      if (candidate.status === "pending") return true;
      return candidate.status === "processing" && candidate.lockedUntil
        ? date(candidate.lockedUntil, "Command lease expiry") <= now
        : false;
    })
    .sort(
      (left, right) =>
        left.availableAt.localeCompare(right.availableAt) ||
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id),
    )[0];
  if (!command) {
    return Object.freeze({
      status: "no_command",
      workflowId: input.workflowId,
    });
  }

  const circuit =
    current.integrationCircuits.find(
      (candidate) => candidate.integrationId === input.integrationId,
    ) ??
    createIntegrationCircuit({
      integrationId: input.integrationId,
      createdAt: now.toISOString(),
    });
  const attempt = command.attempts + 1;
  const decision = evaluateIntegrationAttempt({
    circuit,
    attempt,
    policy: input.policy,
    now: now.toISOString(),
  });
  if (!decision.allowed) {
    if (decision.status === "retry_exhausted") {
      await mutateWithRetry({
        repository: input.repository,
        workflowId: input.workflowId,
        mutate: (state) => {
          const target = state.integrationCommands.find(
            (candidate) => candidate.id === command.id,
          );
          if (!target) return state;
          const dead: IntegrationCommand = Object.freeze({
            ...target,
            status: "dead_letter",
            updatedAt: now.toISOString(),
            completedAt: now.toISOString(),
            lastError: decision.reason,
            lockedBy: undefined,
            lockedUntil: undefined,
          });
          return Object.freeze({
            ...state,
            integrationCommands: replaceCommand(state, dead),
            integrationCircuits: replaceCircuit(state, decision.circuit),
            updatedAt: now.toISOString(),
          });
        },
      });
      return Object.freeze({
        status: "dead_letter",
        workflowId: input.workflowId,
        commandId: command.id,
        error: decision.reason,
      });
    }
    return Object.freeze({
      status: "circuit_open",
      workflowId: input.workflowId,
      commandId: command.id,
      retryAt: decision.retryAt,
    });
  }

  if (
    command.status === "pending" &&
    date(command.availableAt, "Command availability") > now
  ) {
    return Object.freeze({
      status: "no_command",
      workflowId: input.workflowId,
      commandId: command.id,
      retryAt: command.availableAt,
    });
  }

  let claimed: CommercialWorkflowState;
  try {
    claimed = await input.repository.save(
      Object.freeze({
        ...current,
        integrationCommands: replaceCommand(
          current,
          Object.freeze({
            ...command,
            status: "processing",
            attempts: attempt,
            lockedBy: input.workerId,
            lockedUntil: new Date(
              now.getTime() + leaseSeconds * 1000,
            ).toISOString(),
            updatedAt: now.toISOString(),
          }),
        ),
        integrationCircuits: replaceCircuit(current, decision.circuit),
        updatedAt: now.toISOString(),
      }),
      current.version,
    );
  } catch (error) {
    if (error instanceof WorkflowVersionConflictError) {
      return Object.freeze({
        status: "storage_conflict",
        workflowId: input.workflowId,
      });
    }
    throw error;
  }

  const claimedCommand = claimed.integrationCommands.find(
    (candidate) => candidate.id === command.id,
  );
  if (!claimedCommand) {
    throw new Error("Claimed integration command disappeared.");
  }

  try {
    const transportResult = await input.transport.execute(claimedCommand);
    await mutateWithRetry({
      repository: input.repository,
      workflowId: input.workflowId,
      mutate: (state) => {
        const target = state.integrationCommands.find(
          (candidate) => candidate.id === claimedCommand.id,
        );
        if (
          !target ||
          target.status !== "processing" ||
          target.lockedBy !== input.workerId
        ) {
          return state;
        }
        const completedAt = now.toISOString();
        const completed: IntegrationCommand = Object.freeze({
          ...target,
          status: "succeeded",
          completedAt,
          externalReference: transportResult.externalReference,
          updatedAt: completedAt,
          lockedBy: undefined,
          lockedUntil: undefined,
          lastError: undefined,
        });
        const activeCircuit =
          state.integrationCircuits.find(
            (candidate) => candidate.integrationId === input.integrationId,
          ) ?? decision.circuit;
        return Object.freeze({
          ...state,
          integrationCommands: replaceCommand(state, completed),
          integrationCircuits: replaceCircuit(
            state,
            recordIntegrationSuccess({
              circuit: activeCircuit,
              policy: input.policy,
              succeededAt: completedAt,
            }),
          ),
          updatedAt: completedAt,
        });
      },
    });
    return Object.freeze({
      status: "succeeded",
      workflowId: input.workflowId,
      commandId: claimedCommand.id,
      externalReference: transportResult.externalReference,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown integration error";
    const retryable = input.retryable?.(error) ?? true;
    let dispatchStatus: IntegrationDispatchStatus = "dead_letter";
    let retryAt: string | undefined;
    await mutateWithRetry({
      repository: input.repository,
      workflowId: input.workflowId,
      mutate: (state) => {
        const target = state.integrationCommands.find(
          (candidate) => candidate.id === claimedCommand.id,
        );
        if (
          !target ||
          target.status !== "processing" ||
          target.lockedBy !== input.workerId
        ) {
          return state;
        }
        const activeCircuit =
          state.integrationCircuits.find(
            (candidate) => candidate.integrationId === input.integrationId,
          ) ?? decision.circuit;
        const failure = recordIntegrationFailure({
          circuit: activeCircuit,
          attempt: target.attempts,
          error: message,
          retryable,
          policy: input.policy,
          failedAt: now.toISOString(),
        });
        dispatchStatus = failure.retry ? "retry_scheduled" : "dead_letter";
        retryAt = failure.retryAt;
        const failed: IntegrationCommand = Object.freeze({
          ...target,
          status: failure.retry ? "pending" : "dead_letter",
          availableAt: failure.retryAt ?? now.toISOString(),
          updatedAt: now.toISOString(),
          completedAt: failure.retry ? undefined : now.toISOString(),
          lastError: message,
          lockedBy: undefined,
          lockedUntil: undefined,
        });
        return Object.freeze({
          ...state,
          integrationCommands: replaceCommand(state, failed),
          integrationCircuits: replaceCircuit(state, failure.circuit),
          updatedAt: now.toISOString(),
        });
      },
    });
    return Object.freeze({
      status: dispatchStatus,
      workflowId: input.workflowId,
      commandId: claimedCommand.id,
      retryAt,
      error: message,
    });
  }
}
