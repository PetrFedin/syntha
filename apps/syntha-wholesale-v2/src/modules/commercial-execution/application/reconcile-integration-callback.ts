import type { IntegrationCommand } from "../domain/integration-command";
import type {
  IntegrationCallbackOutcome,
  IntegrationInboxRecord,
  IntegrationInboxStatus,
} from "../domain/integration-inbox";
import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "./commercial-workflow-repository";
import { WorkflowVersionConflictError } from "./commercial-workflow-repository";

export interface IntegrationCallback {
  readonly externalEventId: string;
  readonly integrationId: string;
  readonly outcome: IntegrationCallbackOutcome;
  readonly occurredAt: string;
  readonly commandId?: string;
  readonly idempotencyKey?: string;
  readonly externalReference?: string;
  readonly error?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
}

export interface IntegrationCallbackResult {
  readonly status:
    | "applied"
    | "duplicate"
    | "orphaned"
    | "conflict";
  readonly workflowId: string;
  readonly inboxRecord: IntegrationInboxRecord;
  readonly state: CommercialWorkflowState;
}

function iso(value: string, field: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp).toISOString();
}

function findCommand(
  state: CommercialWorkflowState,
  callback: IntegrationCallback,
): IntegrationCommand | undefined {
  if (callback.commandId) {
    return state.integrationCommands.find(
      (command) => command.id === callback.commandId,
    );
  }
  if (callback.idempotencyKey) {
    return state.integrationCommands.find(
      (command) => command.idempotencyKey === callback.idempotencyKey,
    );
  }
  if (callback.externalReference) {
    return state.integrationCommands.find(
      (command) => command.externalReference === callback.externalReference,
    );
  }
  return undefined;
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

function inboxRecord(input: {
  callback: IntegrationCallback;
  receivedAt: string;
  status: IntegrationInboxStatus;
  commandId?: string;
  conflictReason?: string;
}): IntegrationInboxRecord {
  return Object.freeze({
    id: `${input.callback.integrationId}:${input.callback.externalEventId}`,
    integrationId: input.callback.integrationId,
    externalEventId: input.callback.externalEventId,
    outcome: input.callback.outcome,
    status: input.status,
    occurredAt: iso(input.callback.occurredAt, "Callback occurrence time"),
    receivedAt: input.receivedAt,
    payload: Object.freeze({ ...(input.callback.payload ?? {}) }),
    commandId: input.commandId,
    externalReference: input.callback.externalReference,
    error: input.callback.error,
    conflictReason: input.conflictReason,
  });
}

function applyOutcome(input: {
  command: IntegrationCommand;
  callback: IntegrationCallback;
  occurredAt: string;
}): { command?: IntegrationCommand; conflictReason?: string } {
  if (input.command.integrationId !== input.callback.integrationId) {
    return { conflictReason: "Callback integration does not match the command integration." };
  }

  if (input.callback.outcome === "succeeded") {
    if (
      input.command.status === "dead_letter" ||
      input.command.status === "cancelled"
    ) {
      return {
        conflictReason: `A ${input.command.status} command cannot be acknowledged as succeeded.`,
      };
    }
    return {
      command: Object.freeze({
        ...input.command,
        status: "succeeded",
        completedAt: input.occurredAt,
        updatedAt: input.occurredAt,
        externalReference:
          input.callback.externalReference ?? input.command.externalReference,
        lockedBy: undefined,
        lockedUntil: undefined,
        lastError: undefined,
      }),
    };
  }

  if (input.command.status === "succeeded") {
    return {
      conflictReason: `A succeeded command cannot be changed to ${input.callback.outcome}.`,
    };
  }

  if (input.callback.outcome === "rejected") {
    return {
      command: Object.freeze({
        ...input.command,
        status: "dead_letter",
        completedAt: input.occurredAt,
        updatedAt: input.occurredAt,
        externalReference:
          input.callback.externalReference ?? input.command.externalReference,
        lastError: input.callback.error ?? "External integration rejected the command.",
        lockedBy: undefined,
        lockedUntil: undefined,
      }),
    };
  }

  return {
    command: Object.freeze({
      ...input.command,
      status: "cancelled",
      completedAt: input.occurredAt,
      updatedAt: input.occurredAt,
      externalReference:
        input.callback.externalReference ?? input.command.externalReference,
      lastError: input.callback.error,
      lockedBy: undefined,
      lockedUntil: undefined,
    }),
  };
}

export async function reconcileIntegrationCallback(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly workflowId: string;
  readonly callback: IntegrationCallback;
  readonly receivedAt?: string;
  readonly maximumSaveAttempts?: number;
}): Promise<IntegrationCallbackResult> {
  if (!input.callback.externalEventId.trim()) {
    throw new Error("External callback event id is required.");
  }
  if (!input.callback.integrationId.trim()) {
    throw new Error("Callback integration id is required.");
  }
  const receivedAt = iso(
    input.receivedAt ?? new Date().toISOString(),
    "Callback receive time",
  );
  const maximumSaveAttempts = Math.max(
    1,
    Math.floor(input.maximumSaveAttempts ?? 5),
  );

  for (let attempt = 1; attempt <= maximumSaveAttempts; attempt += 1) {
    const state = await input.repository.findById(input.workflowId);
    if (!state) throw new Error(`Workflow ${input.workflowId} was not found.`);
    const existing = state.integrationInbox.find(
      (record) =>
        record.integrationId === input.callback.integrationId &&
        record.externalEventId === input.callback.externalEventId,
    );
    if (existing) {
      return Object.freeze({
        status: "duplicate",
        workflowId: input.workflowId,
        inboxRecord: existing,
        state,
      });
    }

    const command = findCommand(state, input.callback);
    let status: IntegrationInboxStatus = "orphaned";
    let updatedCommand: IntegrationCommand | undefined;
    let conflictReason: string | undefined;
    if (command) {
      const applied = applyOutcome({
        command,
        callback: input.callback,
        occurredAt: iso(input.callback.occurredAt, "Callback occurrence time"),
      });
      updatedCommand = applied.command;
      conflictReason = applied.conflictReason;
      status = conflictReason ? "conflict" : "applied";
    }

    const record = inboxRecord({
      callback: input.callback,
      receivedAt,
      status,
      commandId: command?.id,
      conflictReason,
    });
    const next: CommercialWorkflowState = Object.freeze({
      ...state,
      integrationCommands: updatedCommand
        ? replaceCommand(state.integrationCommands, updatedCommand)
        : state.integrationCommands,
      integrationInbox: Object.freeze([...state.integrationInbox, record]),
      updatedAt: receivedAt,
    });

    try {
      const saved = await input.repository.save(next, state.version);
      return Object.freeze({
        status,
        workflowId: input.workflowId,
        inboxRecord: record,
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
  throw new Error("Integration callback reconciliation attempts were exhausted.");
}
