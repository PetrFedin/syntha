import type { RecommendedAction } from "@/domain/decision/decision";
import type { TransactionalOutbox } from "@/domain/events/transactional-outbox";
import type { DurableReplenishmentAccepted } from "@/domain/procurement/durable-replenishment-workflow";

import { createIntegrationCommand } from "../domain/integration-command";
import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "./commercial-workflow-repository";
import {
  createCommercialWorkflowState,
  WorkflowVersionConflictError,
} from "./commercial-workflow-repository";

function replaceByContext<T extends { readonly contextId: string }>(
  items: readonly T[],
  item: T,
): readonly T[] {
  return Object.freeze([
    ...items.filter((candidate) => candidate.contextId !== item.contextId),
    item,
  ]);
}

function mergeOutboxes(
  current: TransactionalOutbox,
  incoming: TransactionalOutbox,
): TransactionalOutbox {
  const records = new Map(current.records.map((record) => [record.id, record]));
  for (const record of incoming.records) records.set(record.id, record);
  return Object.freeze({ records: Object.freeze([...records.values()]) });
}

function commandForAction(input: {
  readonly workflowId: string;
  readonly contextId: string;
  readonly action: RecommendedAction;
  readonly index: number;
  readonly integrationId: string;
  readonly createdAt: string;
}) {
  return createIntegrationCommand({
    id: `${input.contextId}:command:${input.index}:${input.action.type}`,
    workflowId: input.workflowId,
    integrationId: input.integrationId,
    action: input.action,
    idempotencyKey: `${input.contextId}:${input.index}:${input.action.type}`,
    createdAt: input.createdAt,
  });
}

export async function persistDurableReplenishment(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly workflowId: string;
  readonly accepted: DurableReplenishmentAccepted;
  readonly integrationId?: string;
  readonly updatedAt?: string;
  readonly maximumSaveAttempts?: number;
}): Promise<CommercialWorkflowState> {
  const maximumSaveAttempts = Math.max(
    1,
    Math.floor(input.maximumSaveAttempts ?? 5),
  );
  const updatedAt = new Date(
    input.updatedAt ?? new Date().toISOString(),
  ).toISOString();
  const contextId = input.accepted.result.executionPlan.contextId;
  const commands = input.accepted.result.executionPlan.automaticActions
    .filter((action) => action.type !== "none")
    .map((action, index) =>
      commandForAction({
        workflowId: input.workflowId,
        contextId,
        action,
        index,
        integrationId: input.integrationId ?? "erp",
        createdAt: updatedAt,
      }),
    );

  for (let attempt = 1; attempt <= maximumSaveAttempts; attempt += 1) {
    const current =
      (await input.repository.findById(input.workflowId)) ??
      createCommercialWorkflowState({ id: input.workflowId, createdAt: updatedAt });
    const commandMap = new Map(
      current.integrationCommands.map((command) => [command.id, command]),
    );
    for (const command of commands) commandMap.set(command.id, command);
    const next: CommercialWorkflowState = Object.freeze({
      ...current,
      idempotencyRegistry: input.accepted.idempotencyRegistry,
      approvalWorkflows: replaceByContext(
        current.approvalWorkflows,
        input.accepted.approvals,
      ),
      executionJournals: replaceByContext(
        current.executionJournals,
        input.accepted.journal,
      ),
      outbox: mergeOutboxes(current.outbox, input.accepted.outbox),
      integrationCommands: Object.freeze([...commandMap.values()]),
      updatedAt,
    });
    try {
      return await input.repository.save(next, current.version);
    } catch (error) {
      if (!(error instanceof WorkflowVersionConflictError) || attempt === maximumSaveAttempts) {
        throw error;
      }
    }
  }
  throw new Error("Commercial workflow persistence attempts were exhausted.");
}
