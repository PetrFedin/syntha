import type { CommercialExecutionHealthCheck } from "../application/commercial-execution-health-check";
import type { CommercialExecutionScheduleRepository } from "../application/commercial-execution-schedule-repository";
import type { CommercialExecutionUnitOfWork } from "../application/commercial-execution-unit-of-work";
import type { CommercialOperationsAuthorizer } from "../application/commercial-operations-authorizer";
import type { CommercialWorkflowRepository } from "../application/commercial-workflow-repository";
import type { IntegrationSigningKeyProvider } from "../application/integration-signing-key-provider";
import type { IntegrationTransportRegistry } from "../application/run-integration-worker-cycle";
import type { IntegrationWorkerSettingsProvider } from "../application/integration-worker-settings-provider";
import { EnvironmentCommercialOperationsAuthorizer } from "./environment-commercial-operations-authorizer";
import { EnvironmentIntegrationSigningKeyProvider } from "./environment-integration-signing-key-provider";
import { EnvironmentIntegrationWorkerSettingsProvider } from "./environment-integration-worker-settings-provider";
import { PostgresCommercialExecutionHealthCheck } from "./postgres-commercial-execution-health-check";
import { PostgresCommercialExecutionScheduleRepository } from "./postgres-commercial-execution-schedule-repository";
import { PostgresCommercialExecutionUnitOfWork } from "./postgres-commercial-execution-unit-of-work";
import { PostgresCommercialWorkflowRepository } from "./postgres-commercial-workflow-repository";
import type { TransactionalSqlPool } from "./postgres-commercial-execution-unit-of-work";

export interface CommercialExecutionRuntime {
  readonly repository: CommercialWorkflowRepository;
  readonly unitOfWork: CommercialExecutionUnitOfWork;
  readonly schedules: CommercialExecutionScheduleRepository;
  readonly transports: IntegrationTransportRegistry;
  readonly signingKeys: IntegrationSigningKeyProvider;
  readonly workerSettings: IntegrationWorkerSettingsProvider;
  readonly operationsAuthorizer: CommercialOperationsAuthorizer;
  readonly healthCheck: CommercialExecutionHealthCheck;
}

let configuredRuntime:
  | CommercialExecutionRuntime
  | Promise<CommercialExecutionRuntime>
  | null = null;

export function createPostgresCommercialExecutionRuntime(input: {
  readonly pool: TransactionalSqlPool;
  readonly transports: IntegrationTransportRegistry;
  readonly environment?: Readonly<Record<string, string | undefined>>;
}): CommercialExecutionRuntime {
  const environment = input.environment ?? process.env;
  const signingKeys = new EnvironmentIntegrationSigningKeyProvider(environment);
  return Object.freeze({
    repository: new PostgresCommercialWorkflowRepository(input.pool),
    unitOfWork: new PostgresCommercialExecutionUnitOfWork(input.pool),
    schedules: new PostgresCommercialExecutionScheduleRepository(input.pool),
    transports: input.transports,
    signingKeys,
    workerSettings: new EnvironmentIntegrationWorkerSettingsProvider(environment),
    operationsAuthorizer: new EnvironmentCommercialOperationsAuthorizer(environment),
    healthCheck: new PostgresCommercialExecutionHealthCheck(
      input.pool,
      input.transports,
      signingKeys,
    ),
  });
}

export function registerCommercialExecutionRuntime(
  runtime:
    | CommercialExecutionRuntime
    | Promise<CommercialExecutionRuntime>,
): void {
  configuredRuntime = runtime;
}

export async function getCommercialExecutionRuntime(): Promise<CommercialExecutionRuntime> {
  if (!configuredRuntime) {
    throw new Error("Commercial execution runtime is not configured.");
  }
  return configuredRuntime;
}

export function resetCommercialExecutionRuntime(): void {
  configuredRuntime = null;
}
