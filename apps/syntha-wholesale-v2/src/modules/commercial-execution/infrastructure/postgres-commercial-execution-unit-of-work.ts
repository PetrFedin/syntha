import type { CommercialExecutionUnitOfWork } from "../application/commercial-execution-unit-of-work";
import { PostgresCommercialWorkflowRepository } from "./postgres-commercial-workflow-repository";
import type {
  SqlExecutor,
  SqlQueryResult,
} from "./postgres-commercial-workflow-repository";

export interface TransactionalSqlClient extends SqlExecutor {
  release(): void;
}

export interface TransactionalSqlPool extends SqlExecutor {
  connect(): Promise<TransactionalSqlClient>;
}

export class PostgresCommercialExecutionUnitOfWork
  implements CommercialExecutionUnitOfWork
{
  constructor(private readonly pool: TransactionalSqlPool) {}

  async execute<Result>(
    work: (
      repository: PostgresCommercialWorkflowRepository,
    ) => Promise<Result>,
  ): Promise<Result> {
    const client = await this.pool.connect();
    await client.query("BEGIN");
    try {
      const result = await work(new PostgresCommercialWorkflowRepository(client));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original transactional failure.
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

export type { SqlQueryResult };
