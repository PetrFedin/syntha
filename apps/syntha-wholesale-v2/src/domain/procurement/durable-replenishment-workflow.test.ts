import { describe, expect, it } from "vitest";

import { verifyDecisionProvenanceManifest } from "@/domain/decision/decision-provenance";
import { createIdempotencyRegistry } from "@/domain/execution/idempotency-engine";
import type { AtpProjection } from "@/domain/inventory/available-to-promise";

import {
  createDurableReplenishmentFingerprint,
  runDurableReplenishment,
} from "./durable-replenishment-workflow";

const observations = Array.from({ length: 28 }, (_, index) => ({
  date: `2026-07-${String(index + 1).padStart(2, "0")}`,
  units: 5,
}));

const atp: AtpProjection = {
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  asOf: "2026-07-29",
  horizonEnd: "2026-08-31",
  currentOnHand: 20,
  currentCommitted: 0,
  currentAvailable: 20,
  firstShortageDate: "2026-08-03",
  minimumAtp: -15,
  buckets: [
    {
      date: "2026-08-03",
      openingAvailable: 20,
      incomingSupply: 0,
      outgoingDemand: 35,
      safetyStock: 10,
      availableToPromise: -25,
      shortage: 25,
    },
  ],
};

const baseInput = {
  id: "AUTO-1",
  organizationId: "ORG-1",
  warehouseId: "WH-1",
  skuId: "SKU-1",
  planningDate: "2026-07-29",
  inventory: {
    availableUnits: 20,
    reservedUnits: 0,
    inboundUnits: 0,
    daysSinceLastSale: 1,
    unitCost: 1000,
    currency: "RUB",
  },
  forecast: {
    observations,
    horizonDays: 7,
    forecastStartDate: "2026-07-29",
    generatedAt: "2026-07-29T00:00:00.000Z",
  },
  atp,
  supplyPolicy: {
    leadTimeDays: 7,
    reviewPeriodDays: 7,
    safetyStock: 10,
    targetCoverDays: 21,
    minimumOrderQuantity: 10,
    orderMultiple: 10,
  },
  classification: {
    segment: "AX" as const,
    coefficientOfVariation: 0,
    policy: {
      serviceLevelTarget: 0.98,
      reviewCadence: "daily" as const,
      replenishmentMode: "continuous" as const,
      priority: "critical" as const,
    },
  },
  supplier: {
    supplierId: "SUP-1",
    active: true,
    approved: true,
    unitCost: 1000,
    currency: "RUB",
    availableCapacityUnits: 500,
  },
  budget: {
    currency: "RUB",
    availableAmount: 500000,
  },
  executionPolicy: {
    minimumConfidence: 0.5,
    maximumAutomaticPriority: "critical" as const,
    automaticActionTypes: [
      "create_replenishment" as const,
      "create_purchase_order" as const,
      "none" as const,
    ],
  },
  analysisAt: "2026-07-29T00:00:00.000Z",
  idempotencyKey: "REQ-1",
} as const;

describe("durable replenishment workflow", () => {
  it("creates durable, auditable state and prevents duplicate execution", () => {
    const accepted = runDurableReplenishment({
      ...baseInput,
      policyReferences: [
        {
          kind: "execution",
          policyId: "execution:v1",
          version: 1,
          configFingerprint: "policy-hash",
        },
      ],
      sourceDataReferences: [
        { sourceType: "sales", sourceId: "sales-history-1", version: "1" },
      ],
      idempotencyRegistry: createIdempotencyRegistry(),
    });
    expect(accepted.status).toBe("accepted");
    if (accepted.status !== "accepted") return;

    const replay = runDurableReplenishment({
      ...baseInput,
      policyReferences: [
        {
          kind: "execution",
          policyId: "execution:v1",
          version: 1,
          configFingerprint: "policy-hash",
        },
      ],
      sourceDataReferences: [
        { sourceType: "sales", sourceId: "sales-history-1", version: "1" },
      ],
      idempotencyRegistry: accepted.idempotencyRegistry,
    });

    expect(accepted.requestFingerprint).toBe(
      createDurableReplenishmentFingerprint({
        ...baseInput,
        policyReferences: [
          {
            kind: "execution",
            policyId: "execution:v1",
            version: 1,
            configFingerprint: "policy-hash",
          },
        ],
        sourceDataReferences: [
          { sourceType: "sales", sourceId: "sales-history-1", version: "1" },
        ],
        idempotencyRegistry: createIdempotencyRegistry(),
      }),
    );
    expect(verifyDecisionProvenanceManifest(accepted.provenance).valid).toBe(true);
    expect(accepted.events.at(-1)?.eventType).toBe(
      "commercial.decision.provenance_recorded",
    );
    expect(accepted.outbox.records.length).toBe(accepted.events.length);
    expect(accepted.journal.entries.length).toBeGreaterThan(0);
    expect(replay.status).toBe("replay");
  });

  it("detects a changed commercial payload under the same key", () => {
    const accepted = runDurableReplenishment({
      ...baseInput,
      idempotencyRegistry: createIdempotencyRegistry(),
    });
    expect(accepted.status).toBe("accepted");
    if (accepted.status !== "accepted") return;

    const conflict = runDurableReplenishment({
      ...baseInput,
      budget: {
        ...baseInput.budget,
        availableAmount: baseInput.budget.availableAmount - 1,
      },
      idempotencyRegistry: accepted.idempotencyRegistry,
    });

    expect(conflict.status).toBe("conflict");
    expect(conflict.requestFingerprint).not.toBe(accepted.requestFingerprint);
  });

  it("accepts an explicit upstream fingerprint for compatibility", () => {
    const accepted = runDurableReplenishment({
      ...baseInput,
      requestFingerprint: "upstream-hash",
      idempotencyRegistry: createIdempotencyRegistry(),
    });

    expect(accepted.requestFingerprint).toBe("upstream-hash");
  });
});
