import { describe, expect, it } from "vitest";

import {
  createCommercialWorkflowState,
  PostgresCommercialWorkflowRepository,
  type SqlExecutor,
  WorkflowVersionConflictError,
} from "../index";

describe("PostgresCommercialWorkflowRepository", () => {
  it("returns null when workflow state is absent", async () => {
    const executor: SqlExecutor = {
      async query<Row>() {
        return { rows: [] as Row[], rowCount: 0 };
      },
    };
    const repository = new PostgresCommercialWorkflowRepository(executor);

    await expect(repository.findById("missing")).resolves.toBeNull();
  });

  it("reports optimistic concurrency conflicts", async () => {
    const executor: SqlExecutor = {
      async query<Row>() {
        return { rows: [] as Row[], rowCount: 0 };
      },
    };
    const repository = new PostgresCommercialWorkflowRepository(executor);
    const state = createCommercialWorkflowState({ id: "WF-1" });

    await expect(repository.save(state, 0)).rejects.toBeInstanceOf(
      WorkflowVersionConflictError,
    );
  });
});
