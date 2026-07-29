import { describe, expect, it } from "vitest";

import { createNodePostgresPoolFromEnvironment } from "../index";

describe("node postgres pool adapter", () => {
  it("creates a pool, verifies connectivity and exposes transactions", async () => {
    const statements: string[] = [];
    class Pool {
      async query<Row>(sql: string) {
        statements.push(sql);
        return { rows: [] as Row[], rowCount: 0 };
      }
      async connect() {
        return {
          query: this.query.bind(this),
          release() {},
        };
      }
      async end() {}
    }

    const pool = await createNodePostgresPoolFromEnvironment({
      environment: {
        SYNTHA_DATABASE_URL: "postgresql://user:password@example.test/syntha",
        SYNTHA_DATABASE_SSL_MODE: "require",
      },
      loadModule: async () => ({ Pool }),
    });

    expect(statements).toEqual(["SELECT 1"]);
    const client = await pool.connect();
    await client.query("BEGIN");
    expect(statements).toEqual(["SELECT 1", "BEGIN"]);
  });

  it("normalizes the result array returned for multi-statement SQL", async () => {
    class Pool {
      async query<Row>(sql: string) {
        if (sql === "SELECT 1; SELECT 2") {
          return [
            { rows: [{ value: 1 } as Row], rowCount: 1 },
            { rows: [{ value: 2 } as Row], rowCount: 1 },
          ];
        }
        return { rows: [] as Row[], rowCount: 0 };
      }
      async connect() {
        return {
          query: this.query.bind(this),
          release() {},
        };
      }
      async end() {}
    }

    const pool = await createNodePostgresPoolFromEnvironment({
      environment: {
        SYNTHA_DATABASE_URL: "postgresql://user:password@example.test/syntha",
        SYNTHA_DATABASE_SSL_MODE: "disable",
      },
      loadModule: async () => ({ Pool }),
    });
    const result = await pool.query<{ readonly value: number }>("SELECT 1; SELECT 2");

    expect(result).toEqual({
      rows: [{ value: 1 }, { value: 2 }],
      rowCount: 2,
    });
  });
});
