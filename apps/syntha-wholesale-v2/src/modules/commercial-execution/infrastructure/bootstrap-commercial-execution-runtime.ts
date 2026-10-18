import type { CommercialExecutionMigrationResult } from "./commercial-execution-migrations";
import { runPostgresCommercialExecutionMigrations } from "./commercial-execution-migrations";
import {
  createPostgresCommercialExecutionRuntime,
  registerCommercialExecutionRuntime,
  type CommercialExecutionRuntime,
} from "./commercial-execution-runtime";
import { EnvironmentHttpIntegrationTransportRegistry } from "./environment-http-integration-transport-registry";
import {
  createNodePostgresPoolFromEnvironment,
  type NodePostgresModuleLoader,
  type NodePostgresPoolAdapter,
} from "./node-postgres-pool-adapter";

export interface BootstrappedCommercialExecutionRuntime {
  readonly runtime: CommercialExecutionRuntime;
  readonly pool: NodePostgresPoolAdapter;
  readonly migrations: CommercialExecutionMigrationResult;
  close(): Promise<void>;
}

let bootstrapPromise: Promise<BootstrappedCommercialExecutionRuntime> | null = null;

export function bootstrapCommercialExecutionRuntimeFromEnvironment(input: {
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly loadPostgresModule?: NodePostgresModuleLoader;
  readonly fetcher?: typeof fetch;
} = {}): Promise<BootstrappedCommercialExecutionRuntime> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const environment = input.environment ?? process.env;
    const pool = await createNodePostgresPoolFromEnvironment({
      environment,
      loadModule: input.loadPostgresModule,
    });
    try {
      const migrations = await runPostgresCommercialExecutionMigrations({ pool });
      const transports = new EnvironmentHttpIntegrationTransportRegistry(
        environment,
        input.fetcher,
      );
      const runtime = createPostgresCommercialExecutionRuntime({
        pool,
        transports,
        environment,
      });
      registerCommercialExecutionRuntime(runtime);
      return Object.freeze({
        runtime,
        pool,
        migrations,
        async close() {
          await pool.close();
          bootstrapPromise = null;
        },
      });
    } catch (error) {
      await pool.close();
      bootstrapPromise = null;
      throw error;
    }
  })();
  return bootstrapPromise;
}

export function resetCommercialExecutionBootstrap(): void {
  bootstrapPromise = null;
}
