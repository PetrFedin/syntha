import {
  type CommercialDecision,
  type DecisionReason,
  type RecommendedAction,
  clampConfidence,
} from "@/domain/decision/decision";

export type InventoryHealthStatus =
  | "excellent"
  | "healthy"
  | "risk"
  | "critical";

export type InventoryVelocity =
  | "fast"
  | "normal"
  | "slow"
  | "dead";

export interface InventoryHealthInput {
  skuId: string;
  warehouseId: string;
  availableUnits: number;
  reservedUnits: number;
  inboundUnits: number;
  averageDailyDemand: number;
  forecastDemandDuringLeadTime: number;
  safetyStockUnits: number;
  targetCoverageDays: number;
  leadTimeDays: number;
  daysSinceLastSale: number;
  unitCost: number;
  currency: string;
  confidence?: number;
  calculatedAt?: string;
}

export interface InventoryHealthAssessment {
  skuId: string;
  warehouseId: string;
  calculatedAt: string;
  netAvailableUnits: number;
  projectedAvailableUnits: number;
  daysOfCover: number | null;
  excessUnits: number;
  shortageUnits: number;
  capitalAtRisk: number;
  stockoutRisk: number;
  overstockRisk: number;
  velocity: InventoryVelocity;
  healthScore: number;
  status: InventoryHealthStatus;
  decision: CommercialDecision;
}

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

function velocityFromDays(daysSinceLastSale: number): InventoryVelocity {
  if (daysSinceLastSale >= 365) return "dead";
  if (daysSinceLastSale >= 180) return "slow";
  if (daysSinceLastSale >= 90) return "normal";
  return "fast";
}

function statusFromScore(score: number): InventoryHealthStatus {
  if (score >= 81) return "excellent";
  if (score >= 61) return "healthy";
  if (score >= 31) return "risk";
  return "critical";
}

function statusWithRiskGuardrails(input: {
  score: number;
  stockoutRisk: number;
  overstockRisk: number;
  velocity: InventoryVelocity;
}): InventoryHealthStatus {
  if (
    input.stockoutRisk >= 0.85 ||
    input.overstockRisk >= 0.85 ||
    input.velocity === "dead"
  ) {
    return "critical";
  }
  if (
    input.stockoutRisk >= 0.65 ||
    input.overstockRisk >= 0.65 ||
    input.velocity === "slow"
  ) {
    return "risk";
  }
  return statusFromScore(input.score);
}

function severityFromStatus(
  status: InventoryHealthStatus,
): CommercialDecision["severity"] {
  if (status === "critical") return "critical";
  if (status === "risk") return "high";
  if (status === "healthy") return "medium";
  return "info";
}

function buildActions(input: {
  excessUnits: number;
  shortageUnits: number;
  velocity: InventoryVelocity;
  stockoutRisk: number;
  overstockRisk: number;
}): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  if (input.shortageUnits > 0 || input.stockoutRisk >= 0.65) {
    actions.push({
      type: "create_replenishment",
      priority: input.stockoutRisk >= 0.85 ? "critical" : "high",
      title: "Create replenishment proposal",
      description:
        "Projected available stock is insufficient for lead-time demand and safety stock.",
      quantity: Math.max(1, Math.ceil(input.shortageUnits)),
    });
  }

  if (input.excessUnits > 0 || input.overstockRisk >= 0.65) {
    actions.push({
      type: "stop_replenishment",
      priority: input.overstockRisk >= 0.85 ? "critical" : "high",
      title: "Stop replenishment",
      description:
        "Projected inventory exceeds the target coverage and should not be replenished.",
    });
    actions.push({
      type: "transfer_stock",
      priority: "medium",
      title: "Review inter-warehouse transfer",
      description:
        "Move excess units to locations with stronger demand before applying markdowns.",
      quantity: Math.max(1, Math.floor(input.excessUnits)),
    });
  }

  if (input.velocity === "slow") {
    actions.push({
      type: "markdown_review",
      priority: "high",
      title: "Review markdown and promotion",
      description:
        "The SKU has not sold recently and is at risk of becoming dead stock.",
    });
  }

  if (input.velocity === "dead") {
    actions.push({
      type: "liquidate",
      priority: "critical",
      title: "Liquidate dead stock",
      description:
        "The SKU has had no recorded sale for at least 365 days.",
    });
  }

  if (actions.length === 0) {
    actions.push({
      type: "none",
      priority: "info",
      title: "Maintain current inventory policy",
      description: "Inventory is within the configured operating corridor.",
    });
  }

  return actions;
}

export function assessInventoryHealth(
  input: InventoryHealthInput,
): InventoryHealthAssessment {
  const availableUnits = Math.max(0, input.availableUnits);
  const reservedUnits = Math.max(0, input.reservedUnits);
  const inboundUnits = Math.max(0, input.inboundUnits);
  const averageDailyDemand = Math.max(0, input.averageDailyDemand);
  const safetyStockUnits = Math.max(0, input.safetyStockUnits);
  const targetCoverageDays = Math.max(0, input.targetCoverageDays);
  const leadTimeDemand = Math.max(0, input.forecastDemandDuringLeadTime);

  const netAvailableUnits = Math.max(0, availableUnits - reservedUnits);
  const projectedAvailableUnits = netAvailableUnits + inboundUnits;
  const daysOfCover =
    averageDailyDemand > 0
      ? round(projectedAvailableUnits / averageDailyDemand)
      : null;

  const targetUnits =
    safetyStockUnits + averageDailyDemand * targetCoverageDays;
  const requiredLeadTimeUnits = safetyStockUnits + leadTimeDemand;
  const excessUnits = Math.max(0, projectedAvailableUnits - targetUnits);
  const shortageUnits = Math.max(
    0,
    requiredLeadTimeUnits - projectedAvailableUnits,
  );

  const stockoutRisk = round(
    requiredLeadTimeUnits > 0
      ? clamp(shortageUnits / requiredLeadTimeUnits, 0, 1)
      : 0,
    4,
  );
  const overstockRisk = round(
    targetUnits > 0
      ? clamp(excessUnits / targetUnits, 0, 1)
      : excessUnits > 0
        ? 1
        : 0,
    4,
  );

  const velocity = velocityFromDays(Math.max(0, input.daysSinceLastSale));
  const velocityPenalty =
    velocity === "dead"
      ? 45
      : velocity === "slow"
        ? 25
        : velocity === "normal"
          ? 8
          : 0;
  const riskPenalty = stockoutRisk * 45 + overstockRisk * 35;
  const healthScore = round(
    clamp(100 - riskPenalty - velocityPenalty, 0, 100),
  );
  const status = statusWithRiskGuardrails({
    score: healthScore,
    stockoutRisk,
    overstockRisk,
    velocity,
  });
  const capitalAtRisk = round(excessUnits * Math.max(0, input.unitCost));

  const reasons: DecisionReason[] = [];
  if (shortageUnits > 0) {
    reasons.push({
      code: "inventory.shortage",
      message: "Projected stock is below lead-time demand plus safety stock.",
      metric: "shortageUnits",
      actual: round(shortageUnits),
      threshold: 0,
      unit: "units",
    });
  }
  if (excessUnits > 0) {
    reasons.push({
      code: "inventory.excess",
      message: "Projected stock exceeds the configured target coverage.",
      metric: "excessUnits",
      actual: round(excessUnits),
      threshold: 0,
      unit: "units",
    });
  }
  if (velocity === "slow" || velocity === "dead") {
    reasons.push({
      code: `inventory.${velocity}`,
      message:
        velocity === "dead"
          ? "No sale has been recorded for at least 365 days."
          : "The SKU has not sold for at least 180 days.",
      metric: "daysSinceLastSale",
      actual: Math.max(0, input.daysSinceLastSale),
      threshold: velocity === "dead" ? 365 : 180,
      unit: "days",
    });
  }
  if (reasons.length === 0) {
    reasons.push({
      code: "inventory.within_policy",
      message: "Inventory is within the configured operating corridor.",
    });
  }

  const calculatedAt = input.calculatedAt ?? new Date().toISOString();
  const actions = buildActions({
    excessUnits,
    shortageUnits,
    velocity,
    stockoutRisk,
    overstockRisk,
  });

  return {
    skuId: input.skuId,
    warehouseId: input.warehouseId,
    calculatedAt,
    netAvailableUnits: round(netAvailableUnits),
    projectedAvailableUnits: round(projectedAvailableUnits),
    daysOfCover,
    excessUnits: round(excessUnits),
    shortageUnits: round(shortageUnits),
    capitalAtRisk,
    stockoutRisk,
    overstockRisk,
    velocity,
    healthScore,
    status,
    decision: {
      id: `inventory-health:${input.skuId}:${input.warehouseId}:${calculatedAt}`,
      entityType: "sku",
      entityId: input.skuId,
      decisionType: "inventory_health",
      severity: severityFromStatus(status),
      confidence: clampConfidence(input.confidence ?? 0.8),
      reasons,
      impacts: [
        {
          metric: "capitalAtRisk",
          value: capitalAtRisk,
          unit: input.currency,
          direction: capitalAtRisk > 0 ? "decrease" : "neutral",
        },
        {
          metric: "healthScore",
          value: healthScore,
          unit: "score",
          direction: "increase",
        },
      ],
      actions,
      createdAt: calculatedAt,
      source: "inventory-health-engine",
      version: 1,
    },
  };
}
