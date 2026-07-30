import type { IntegrationCommand } from "../domain/integration-command";
import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "./commercial-workflow-repository";
import { WorkflowVersionConflictError } from "./commercial-workflow-repository";

const ORGANIZATION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export function normalizeCommercialOrganizationId(value: string): string {
  const normalized = value.trim();
  if (!ORGANIZATION_ID_PATTERN.test(normalized)) {
    throw new Error(
      "Organization id must contain 1-128 letters, digits, dots, underscores or hyphens.",
    );
  }
  return normalized;
}

export function requireCommercialOrganizationId(
  value: string | null | undefined,
): string {
  if (!value?.trim()) throw new Error("Organization id is required.");
  return normalizeCommercialOrganizationId(value);
}

function storageId(organizationId: string, workflowId: string): string {
  if (!workflowId.trim()) throw new Error("Commercial workflow id is required.");
  return `org/${encodeURIComponent(organizationId)}/workflow/${encodeURIComponent(workflowId)}`;
}

function namespaceCommand(
  command: IntegrationCommand,
  organizationId: string,
): IntegrationCommand {
  const prefix = `org:${organizationId}:`;
  return Object.freeze({
    ...command,
    organizationId,
    idempotencyKey: command.idempotencyKey.startsWith(prefix)
      ? command.idempotencyKey
      : `${prefix}${command.idempotencyKey}`,
  });
}

function scopedState(input: {
  readonly state: CommercialWorkflowState;
  readonly stateId: string;
  readonly organizationId: string;
}): CommercialWorkflowState {
  return Object.freeze({
    ...input.state,
    id: input.stateId,
    integrationCommands: Object.freeze(
      input.state.integrationCommands.map((command) =>
        namespaceCommand(command, input.organizationId),
      ),
    ),
  });
}

export class OrganizationScopedCommercialWorkflowRepository
  implements CommercialWorkflowRepository
{
  readonly organizationId: string;

  constructor(
    private readonly repository: CommercialWorkflowRepository,
    organizationId: string,
  ) {
    this.organizationId = normalizeCommercialOrganizationId(organizationId);
  }

  async findById(id: string): Promise<CommercialWorkflowState | null> {
    const state = await this.repository.findById(storageId(this.organizationId, id));
    return state
      ? scopedState({
          state,
          stateId: id,
          organizationId: this.organizationId,
        })
      : null;
  }

  async save(
    state: CommercialWorkflowState,
    expectedVersion: number,
  ): Promise<CommercialWorkflowState> {
    const physicalId = storageId(this.organizationId, state.id);
    try {
      const saved = await this.repository.save(
        scopedState({
          state,
          stateId: physicalId,
          organizationId: this.organizationId,
        }),
        expectedVersion,
      );
      return scopedState({
        state: saved,
        stateId: state.id,
        organizationId: this.organizationId,
      });
    } catch (error) {
      if (error instanceof WorkflowVersionConflictError) {
        throw new WorkflowVersionConflictError(
          state.id,
          error.expectedVersion,
          error.actualVersion,
        );
      }
      throw error;
    }
  }
}

export function scopeCommercialWorkflowRepository(
  repository: CommercialWorkflowRepository,
  organizationId: string,
): CommercialWorkflowRepository {
  return new OrganizationScopedCommercialWorkflowRepository(
    repository,
    organizationId,
  );
}
