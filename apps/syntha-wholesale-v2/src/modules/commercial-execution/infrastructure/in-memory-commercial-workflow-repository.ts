import type {
  CommercialWorkflowRepository,
  CommercialWorkflowState,
} from "../application/commercial-workflow-repository";
import { WorkflowVersionConflictError } from "../application/commercial-workflow-repository";

function cloneState(state: CommercialWorkflowState): CommercialWorkflowState {
  return JSON.parse(JSON.stringify(state)) as CommercialWorkflowState;
}

export class InMemoryCommercialWorkflowRepository
  implements CommercialWorkflowRepository
{
  private readonly records = new Map<string, CommercialWorkflowState>();

  async findById(id: string): Promise<CommercialWorkflowState | null> {
    const state = this.records.get(id);
    return state ? cloneState(state) : null;
  }

  async save(
    state: CommercialWorkflowState,
    expectedVersion: number,
  ): Promise<CommercialWorkflowState> {
    const current = this.records.get(state.id);
    const actualVersion = current?.version ?? null;
    const validCreate = current === undefined && expectedVersion === 0;
    const validUpdate = current !== undefined && current.version === expectedVersion;
    if (!validCreate && !validUpdate) {
      throw new WorkflowVersionConflictError(
        state.id,
        expectedVersion,
        actualVersion,
      );
    }
    const next: CommercialWorkflowState = Object.freeze({
      ...cloneState(state),
      version: expectedVersion + 1,
    });
    this.records.set(state.id, cloneState(next));
    return cloneState(next);
  }
}
