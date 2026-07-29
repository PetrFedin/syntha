import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";
import {
  createCommercialWorkflowState,
  createIntegrationCommand,
  InMemoryCommercialWorkflowRepository,
  scopeCommercialWorkflowRepository,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create purchase order.",
};

describe("OrganizationScopedCommercialWorkflowRepository", () => {
  it("isolates equal workflow ids and namespaces outbound idempotency", async () => {
    const base = new InMemoryCommercialWorkflowRepository();
    const first = scopeCommercialWorkflowRepository(base, "ORG-A");
    const second = scopeCommercialWorkflowRepository(base, "ORG-B");
    const initial = createCommercialWorkflowState({ id: "WF-1" });
    await first.save(
      Object.freeze({
        ...initial,
        integrationCommands: Object.freeze([
          createIntegrationCommand({
            id: "CMD-1",
            workflowId: "WF-1",
            integrationId: "erp",
            action,
            idempotencyKey: "CMD-1",
          }),
        ]),
      }),
      0,
    );

    expect(await second.findById("WF-1")).toBeNull();
    const stored = await first.findById("WF-1");
    expect(stored?.integrationCommands[0]?.organizationId).toBe("ORG-A");
    expect(stored?.integrationCommands[0]?.idempotencyKey).toBe(
      "org:ORG-A:CMD-1",
    );
  });
});
