import type { CommercialWorkflowRepository } from "./commercial-workflow-repository";

export interface CommercialExecutionUnitOfWork {
  execute<Result>(
    work: (repository: CommercialWorkflowRepository) => Promise<Result>,
  ): Promise<Result>;
}
