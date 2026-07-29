import { describe, expect, it } from "vitest";

import {
  runPostgresCommercialExecutionMigrations,
  type SqlQueryResult,
  type TransactionalSqlClient,
  type TransactionalSqlPool,
} from "../index";

function fixture(applied: readonly { version: number; name: string; checksum: string }[] = []) {
  const statements: string[] = [];
  let released = false;
  const client: TransactionalSqlClient = {
    async query<Row>(sql: string): Promise<SqlQueryResult<Row>> {
      statements.push(sql);
      if (sql.includes("SELECT version, name, checksum")) {
        return { rows: applied as Row[], rowCount: applied.length };
      }
      return { rows: [], rowCount: 0 };
    },
    release() {
      released = true;
    },
  };
  const pool: TransactionalSqlPool = {
    async query<Row>(): Promise<SqlQueryResult<Row>> {
      return { rows: [], rowCount: 0 };
    },
    async connect() {
      return client;
    },
  };
  return { pool, statements, released: () => released };
}

describe("commercial execution migrations", () => {
  it("applies workflow and scheduler migrations under an advisory lock", async () => {
    const value = fixture();
    const result = await runPostgresCommercialExecutionMigrations({
      pool: value.pool,
      appliedAt: "2026-07-29T00:00:00.000Z",
    });

    expect(result.appliedVersions).toEqual([1, 2]);
    expect(value.statements[0]).toBe("BEGIN");
    expect(value.statements.some((sql) => sql.includes("SKIP LOCKED") || sql.includes("commercial_execution_schedule"))).toBe(true);
    expect(value.statements.at(-1)).toBe("COMMIT");
    expect(value.released()).toBe(true);
  });

  it("rolls back when an applied migration definition was modified", async () => {
    const value = fixture([
      { version: 1, name: "commercial_workflow_state", checksum: "wrong" },
    ]);
    await expect(
      runPostgresCommercialExecutionMigrations({ pool: value.pool }),
    ).rejects.toThrow("differs from the already applied definition");
    expect(value.statements.at(-1)).toBe("ROLLBACK");
  });
});
