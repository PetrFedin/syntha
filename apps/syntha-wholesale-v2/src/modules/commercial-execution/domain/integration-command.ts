import type {
  DecisionActionType,
  RecommendedAction,
} from "@/domain/decision/decision";

export type IntegrationCommandStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "dead_letter"
  | "cancelled";

export interface IntegrationCommand {
  readonly id: string;
  readonly workflowId: string;
  readonly integrationId: string;
  readonly actionType: DecisionActionType;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly idempotencyKey: string;
  readonly status: IntegrationCommandStatus;
  readonly attempts: number;
  readonly availableAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lockedBy?: string;
  readonly lockedUntil?: string;
  readonly completedAt?: string;
  readonly externalReference?: string;
  readonly lastError?: string;
}

function validDate(value: string, field: string): string {
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(value).toISOString();
}

export function createIntegrationCommand(input: {
  readonly id: string;
  readonly workflowId: string;
  readonly integrationId: string;
  readonly action: RecommendedAction;
  readonly idempotencyKey: string;
  readonly createdAt?: string;
}): IntegrationCommand {
  if (!input.id.trim()) throw new Error("Integration command id is required.");
  if (!input.workflowId.trim()) throw new Error("Workflow id is required.");
  if (!input.integrationId.trim()) throw new Error("Integration id is required.");
  if (!input.idempotencyKey.trim()) {
    throw new Error("Integration command idempotency key is required.");
  }
  if (input.action.type === "none") {
    throw new Error("Informational actions cannot become integration commands.");
  }
  const createdAt = validDate(
    input.createdAt ?? new Date().toISOString(),
    "Integration command creation time",
  );
  return Object.freeze({
    id: input.id,
    workflowId: input.workflowId,
    integrationId: input.integrationId,
    actionType: input.action.type,
    payload: Object.freeze({
      title: input.action.title,
      description: input.action.description,
      priority: input.action.priority,
      quantity: input.action.quantity,
      dueAt: input.action.dueAt,
      metadata: input.action.metadata,
    }),
    idempotencyKey: input.idempotencyKey,
    status: "pending",
    attempts: 0,
    availableAt: createdAt,
    createdAt,
    updatedAt: createdAt,
  });
}
