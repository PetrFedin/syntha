import { describe, expect, it } from "vitest";

import type { AbcXyzClassification } from "@/domain/assortment/abc-xyz-classifier";
import type { CommercialDecision } from "@/domain/decision/decision";
import type { SupplyPlanRecommendation } from "@/domain/inventory/supply-planning-engine";

import { createPurchaseRecommendation } from "./purchase-recommendation-engine";

const supplyPlan: SupplyPlanRecommendation = {
  id: "SP-1",
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  planningDate: "2026-07-29",
  reorderPoint: 100,
  projectedPositionAtReceipt: 20,
  netRequirement: 100,
  recommendedOrderQuantity: 100,
  orderByDate: "2026-07-29",
  expectedReceiptDate: "2026-08-08",
  shortageDate: "2026-08-08",
  urgency: "urgent",
  reasons: ["Projected shortage"],
};

const healthDecision: CommercialDecision = {
  id: "health-1",
  entityType: "sku",
  entityId: "SKU-1",
  decisionType: "inventory_health",
  severity: "high",
  confidence: 0.9,
  reasons: [],
  impacts: [],
  actions: [],
  createdAt: "2026-07-29T00:00:00.000Z",
  source: "inventory-health-engine",
  version: 1,
};

function classification(
  segment: AbcXyzClassification["segment"],
  mode: AbcXyzClassification["policy"]["replenishmentMode"] = "continuous",
): Pick<
  AbcXyzClassification,
  "segment" | "policy" | "coefficientOfVariation"
> {
  return {
    segment,
    coefficientOfVariation: segment.endsWith("X") ? 0.2 : 1.2,
    policy: {
      serviceLevelTarget: 0.98,
      reviewCadence: "daily",
      replenishmentMode: mode,
      priority: segment.startsWith("A") ? "critical" : "medium",
    },
  };
}

const baseInput = {
  id: "PR-1",
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  supplyPlan,
  classification: classification("AX"),
  healthDecision,
  supplier: {
    supplierId: "SUP-1",
    active: true,
    approved: true,
    unitCost: 1000,
    currency: "RUB",
  },
  budget: {
    currency: "RUB",
    availableAmount: 200000,
  },
  createdAt: "2026-07-29T00:00:00.000Z",
} as const;

describe("createPurchaseRecommendation", () => {
  it("creates an executable purchase order after deducting open orders", () => {
    const result = createPurchaseRecommendation({
      ...baseInput,
      openPurchaseOrderUnits: 20,
    });

    expect(result.status).toBe("ready");
    expect(result.requestedUnits).toBe(80);
    expect(result.recommendedUnits).toBe(80);
    expect(result.expectedSpend).toBe(80000);
    expect(result.decision.actions[0]?.type).toBe("create_purchase_order");
  });

  it("returns a partial recommendation when budget is insufficient", () => {
    const result = createPurchaseRecommendation({
      ...baseInput,
      budget: { currency: "RUB", availableAmount: 40000 },
    });

    expect(result.status).toBe("partial");
    expect(result.recommendedUnits).toBe(40);
    expect(result.unfundedUnits).toBe(60);
    expect(result.decision.actions.map((action) => action.type)).toContain(
      "split_order",
    );
  });

  it("blocks automatic replenishment for a CZ assortment policy", () => {
    const result = createPurchaseRecommendation({
      ...baseInput,
      classification: classification("CZ", "do_not_replenish"),
    });

    expect(result.status).toBe("manual_review");
    expect(result.recommendedUnits).toBe(0);
    expect(result.decision.actions[0]?.type).toBe("defer_purchase");
  });

  it("blocks an order when the supplier is inactive", () => {
    const result = createPurchaseRecommendation({
      ...baseInput,
      supplier: { ...baseInput.supplier, active: false },
    });

    expect(result.status).toBe("blocked");
    expect(result.recommendedUnits).toBe(0);
    expect(result.decision.actions[0]?.type).toBe("supplier_review");
  });

  it("does not order when open purchase orders cover the requirement", () => {
    const result = createPurchaseRecommendation({
      ...baseInput,
      openPurchaseOrderUnits: 100,
    });

    expect(result.status).toBe("no_order");
    expect(result.recommendedUnits).toBe(0);
    expect(result.decision.actions[0]?.type).toBe("none");
  });
});
