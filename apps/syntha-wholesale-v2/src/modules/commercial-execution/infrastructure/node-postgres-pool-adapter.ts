import { createRequire } from "node:module";

import type {
  TransactionalSqlClient,
  TransactionalSqlPool,
} from "./postgres-commercial-execution-unit-of-work";
import type {
  SqlQueryResult,
} from "./postgres-commercial-workflow-repository";

export interface NodePostgresQueryResult<Row> {
  readonly rows: readonly Row[];
  readonly rowCount: number | null;
}

export type NodePostgresQueryResponse<Row> =
  | NodePostgresQueryResult<Row>
  | readonly NodePostgresQueryResult<Row>[];

export interface NodePostgresClientLike {
  query<Row>(
    sql: string,
    parameters?: readonly unknown[],
  ): Promise<NodePostgresQueryResponse<Row>>;
  release(): void;
}

export interface NodePostgresPoolLike {
  query<Row>(
    sql: string,
    parameters?: readonly unknown[],
  ): Promise<NodePostgresQueryResponse<Row>>;
  connect(): Promise<NodePostgresClientLike>;
  end(): Promise<void>;
}

export interface NodePostgresPoolConstructor {
  new (configuration: Readonly<Record<string, unknown>>): NodePostgresPoolLike;
}

export interface NodePostgresModule {
  readonly Pool: NodePostgresPoolConstructor;
}

export type NodePostgresModuleLoader = () => Promise<NodePostgresModule>;

function result<Row>(value: NodePostgresQueryResponse<Row>): SqlQueryResult<Row> {
  const results: readonly NodePostgresQueryResult<Row>[] = Array.isArray(value)
    ? value
    : [value as NodePostgresQueryResult<Row>];
  const rows = results.flatMap((item) => [...item.rows]);
  return Object.freeze({
    rows: Object.freeze(rows),
    rowCount: results.reduce(
      (total, item) => total + (item.rowCount ?? item.rows.length),
      0,
    ),
  });
}

function clientAdapter(client: NodePostgresClientLike): TransactionalSqlClient {
  return Object.freeze({
    async query<Row>(sql: string, parameters?: readonly unknown[]) {
      return result(await client.query<Row>(sql, parameters));
    },
    release() {
      client.release();
    },
  });
}

export class NodePostgresPoolAdapter implements TransactionalSqlPool {
  constructor(private readonly pool: NodePostgresPoolLike) {}

  async query<Row>(
    sql: string,
    parameters?: readonly unknown[],
  ): Promise<SqlQueryResult<Row>> {
    return result(await this.pool.query<Row>(sql, parameters));
  }

  async connect(): Promise<TransactionalSqlClient> {
    return clientAdapter(await this.pool.connect());
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

async function defaultModuleLoader(): Promise<NodePostgresModule> {
  const load = createRequire(import.meta.url);
  const loaded = load("pg") as Partial<NodePostgresModule>;
  if (typeof loaded.Pool !== "function") {
    throw new Error("The installed pg module does not export Pool.");
  }
  return loaded as NodePostgresModule;
}

function integer(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(
      `PostgreSQL numeric setting must be between ${minimum} and ${maximum}.`,
    );
  }
  return parsed;
}

export async function createNodePostgresPoolFromEnvironment(input: {
  readonly environment?: Readonly<Record<string, string | undefined>>;
  readonly loadModule?: NodePostgresModuleLoader;
} = {}): Promise<NodePostgresPoolAdapter> {
  const environment = input.environment ?? process.env;
  const connectionString = environment.SYNTHA_DATABASE_URL;
  if (!connectionString?.trim()) {
    throw new Error("SYNTHA_DATABASE_URL is not configured.");
  }
  const sslMode = environment.SYNTHA_DATABASE_SSL_MODE ?? "require";
  if (sslMode !== "require" && sslMode !== "disable") {
    throw new Error("SYNTHA_DATABASE_SSL_MODE must be require or disable.");
  }
  const postgresModule = await (input.loadModule ?? defaultModuleLoader)();
  const pool = new postgresModule.Pool({
    connectionString,
    max: integer(environment.SYNTHA_DATABASE_POOL_MAX, 10, 1, 100),
    idleTimeoutMillis: integer(
      environment.SYNTHA_DATABASE_IDLE_TIMEOUT_MS,
      30_000,
      1_000,
      600_000,
    ),
    connectionTimeoutMillis: integer(
      environment.SYNTHA_DATABASE_CONNECTION_TIMEOUT_MS,
      10_000,
      1_000,
      120_000,
    ),
    ssl: sslMode === "require" ? { rejectUnauthorized: true } : false,
  });
  const adapter = new NodePostgresPoolAdapter(pool);
  await adapter.query("SELECT 1");
  return adapter;
}
