import { describe, expect, it } from "vitest";

import {
  PostgresCommercialExecutionHealthCheck,
  type SqlQueryResult,
  type TransactionalSqlPool,
} from "../index";

describe("PostgresCommercialExecutionHealthCheck", () => {
  it("reports ready when the database and integration configuration are present", async () => {
    const pool: TransactionalSqlPool = {
      async query<Row>(): Promise<SqlQueryResult<Row>> {
        return { rows: [], rowCount: 0 };
      },
      async connect() {
        throw new Error("not used");
      },
    };
    const health = new PostgresCommercialExecutionHealthCheck(
      pool,
      {
        get() {
          return null;
        },
        integrationIds() {
          return ["erp"];
        },
      },
      {
        async load() {
          return [
            {
              keyId: "current",
              organizationId: "ORG-A",
              integrationId: "erp",
              secret: "1234567890abcdef",
            },
          ];
        },
      },
    );

    const report = await health.check("2026-07-29T00:00:00.000Z");

    expect(report.status).toBe("ready");
    expect(report.components.database.status).toBe("up");
  });
});
