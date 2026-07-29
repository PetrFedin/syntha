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

function storageId(organizationId: string, workflowId: string): string {
  if (!workflowId.trim()) throw new Error("Commercial workflow id is required.");
  return `org/${encodeURIComponent(organizationId)}/workflow/${encodeURIComponent(workflowId)}`;
}

function logicalState(
  state: CommercialWorkflowState,
  workflowId: string,
): CommercialWorkflowState {
  return Object.freeze({ ...state, id: workflowId });
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
    return state ? logicalState(state, id) : null;
  }

  async save(
    state: CommercialWorkflowState,
    expectedVersion: number,
  ): Promise<CommercialWorkflowState> {
    const physicalId = storageId(this.organizationId, state.id);
    try {
      const saved = await this.repository.save(
        Object.freeze({ ...state, id: physicalId }),
        expectedVersion,
      );
      return logicalState(saved, state.id);
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
