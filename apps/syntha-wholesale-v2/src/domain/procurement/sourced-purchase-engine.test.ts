import { describe, expect, it } from "vitest";

import type { CommercialDecision } from "@/domain/decision/decision";
import type { SupplyPlanRecommendation } from "@/domain/inventory/supply-planning-engine";

import { createSourcedPurchase } from "./sourced-purchase-engine";

const supplyPlan: SupplyPlanRecommendation = {
  id: "SP-1",
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  planningDate: "2026-07-29",
  reorderPoint: 80,
  projectedPositionAtReceipt: 10,
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
  actions: [
    {
      type: "create_replenishment",
      priority: "high",
      title: "Replenish",
      description: "Projected shortage",
      quantity: 100,
    },
  ],
  createdAt: "2026-07-29T00:00:00.000Z",
  source: "inventory-health-engine",
  version: 1,
};

const baseInput = {
  id: "SOURCE-1",
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  supplyPlan,
  classification: {
    segment: "AX" as const,
    coefficientOfVariation: 0.1,
    policy: {
      serviceLevelTarget: 0.98,
      reviewCadence: "daily" as const,
      replenishmentMode: "continuous" as const,
      priority: "critical" as const,
    },
  },
  healthDecision,
  budget: {
    currency: "RUB",
    availableAmount: 200000,
  },
  supplierCandidates: [
    {
      supplierId: "SUP-1",
      active: true,
      approved: true,
      unitCost: 1000,
      currency: "RUB",
      leadTimeDays: 7,
      availableCapacityUnits: 200,
      reliabilityScore: 0.98,
      onTimeDeliveryScore: 0.97,
      qualityAcceptanceScore: 0.99,
      paymentTermsDays: 45,
    },
  ],
  generatedAt: "2026-07-29T00:00:00.000Z",
} as const;

describe("createSourcedPurchase", () => {
  it("selects a supplier and creates a purchase recommendation", () => {
    const result = createSourcedPurchase(baseInput);

    expect(result.supplierSelection.selected?.supplierId).toBe("SUP-1");
    expect(result.purchase?.status).toBe("ready");
    expect(result.purchase?.recommendedUnits).toBe(100);
    expect(result.decisions).toHaveLength(3);
    expect(result.decisionResolution.status).toBe("clear");
  });

  it("stops before purchase creation when no supplier is eligible", () => {
    const result = createSourcedPurchase({
      ...baseInput,
      supplierCandidates: [
        {
          ...baseInput.supplierCandidates[0],
          active: false,
          approved: false,
          availableCapacityUnits: 0,
        },
      ],
    });

    expect(result.supplierSelection.status).toBe("blocked");
    expect(result.purchase).toBeUndefined();
    expect(result.decisionResolution.status).toBe("blocked");
  });

  it("deducts open purchase orders before sourcing", () => {
    const result = createSourcedPurchase({
      ...baseInput,
      openPurchaseOrderUnits: 40,
    });

    expect(result.supplierSelection.requestedUnits).toBe(60);
    expect(result.purchase?.requestedUnits).toBe(60);
    expect(result.purchase?.recommendedUnits).toBe(60);
  });

  it("skips supplier selection when open orders fully cover demand", () => {
    const result = createSourcedPurchase({
      ...baseInput,
      openPurchaseOrderUnits: 100,
      supplierCandidates: [],
    });

    expect(result.supplierSelection.status).toBe("not_required");
    expect(result.supplierSelection.selected).toBeUndefined();
    expect(result.purchase).toBeUndefined();
    expect(result.supplierSelection.decision.actions[0]?.type).toBe("none");
  });
});
