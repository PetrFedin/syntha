import { describe, expect, it } from "vitest";

import {
  PostgresCommercialExecutionUnitOfWork,
  type SqlQueryResult,
  type TransactionalSqlClient,
  type TransactionalSqlPool,
} from "../index";

function setup() {
  const statements: string[] = [];
  let released = false;
  const client: TransactionalSqlClient = {
    async query<Row>(sql: string): Promise<SqlQueryResult<Row>> {
      statements.push(sql);
      return { rows: [], rowCount: 0 };
    },
    release() {
      released = true;
    },
  };
  const pool: TransactionalSqlPool = {
    async connect() {
      return client;
    },
    async query<Row>(): Promise<SqlQueryResult<Row>> {
      return { rows: [], rowCount: 0 };
    },
  };
  return { pool, statements, released: () => released };
}

describe("PostgresCommercialExecutionUnitOfWork", () => {
  it("commits successful work and releases the client", async () => {
    const fixture = setup();
    const unitOfWork = new PostgresCommercialExecutionUnitOfWork(fixture.pool);

    const result = await unitOfWork.execute(async () => "ok");

    expect(result).toBe("ok");
    expect(fixture.statements).toEqual(["BEGIN", "COMMIT"]);
    expect(fixture.released()).toBe(true);
  });

  it("rolls back failed work and preserves the original error", async () => {
    const fixture = setup();
    const unitOfWork = new PostgresCommercialExecutionUnitOfWork(fixture.pool);

    await expect(
      unitOfWork.execute(async () => {
        throw new Error("write failed");
      }),
    ).rejects.toThrow("write failed");

    expect(fixture.statements).toEqual(["BEGIN", "ROLLBACK"]);
    expect(fixture.released()).toBe(true);
  });
});
