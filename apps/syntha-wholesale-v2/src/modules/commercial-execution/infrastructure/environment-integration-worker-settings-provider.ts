import type {
  IntegrationWorkerSettings,
  IntegrationWorkerSettingsProvider,
} from "../application/integration-worker-settings-provider";

export class EnvironmentIntegrationWorkerSettingsProvider
  implements IntegrationWorkerSettingsProvider
{
  constructor(
    private readonly environment: Readonly<Record<string, string | undefined>> =
      process.env,
  ) {}

  async load(): Promise<IntegrationWorkerSettings> {
    const workerId = this.environment.SYNTHA_INTEGRATION_WORKER_ID;
    if (!workerId?.trim()) {
      throw new Error("SYNTHA_INTEGRATION_WORKER_ID is not configured.");
    }
    const rawMaximum =
      this.environment.SYNTHA_INTEGRATION_WORKER_MAX_COMMANDS ?? "100";
    const maximumCommands = Number(rawMaximum);
    if (
      !Number.isInteger(maximumCommands) ||
      maximumCommands < 1 ||
      maximumCommands > 1000
    ) {
      throw new Error(
        "SYNTHA_INTEGRATION_WORKER_MAX_COMMANDS must be an integer from 1 to 1000.",
      );
    }
    return Object.freeze({ workerId, maximumCommands });
  }
}
