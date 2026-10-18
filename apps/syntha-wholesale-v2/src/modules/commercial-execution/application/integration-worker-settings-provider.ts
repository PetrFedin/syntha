export interface IntegrationWorkerSettings {
  readonly workerId: string;
  readonly maximumCommands: number;
}

export interface IntegrationWorkerSettingsProvider {
  load(): Promise<IntegrationWorkerSettings>;
}
