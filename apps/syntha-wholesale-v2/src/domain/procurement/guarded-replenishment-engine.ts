import {
  assessCommercialDataQuality,
  type CommercialDataQualityResult,
} from "@/domain/data-quality/commercial-data-quality-engine";
import {
  resolveCommercialDecisions,
  type UnifiedDecisionResult,
} from "@/domain/decision/unified-decision-engine";
import {
  analyzeReplenishment,
  type ReplenishmentIntelligenceInput,
  type ReplenishmentIntelligenceResult,
} from "@/domain/procurement/replenishment-intelligence-engine";

export interface GuardedReplenishmentInput
  extends ReplenishmentIntelligenceInput {
  readonly minimumDataQualityScore?: number;
}

export interface GuardedReplenishmentResult {
  readonly id: string;
  readonly status: "ready" | "review" | "blocked";
  readonly dataQuality: CommercialDataQualityResult;
  readonly replenishment?: ReplenishmentIntelligenceResult;
  readonly decisionResolution: UnifiedDecisionResult;
}

export function analyzeGuardedReplenishment(
  input: GuardedReplenishmentInput,
): GuardedReplenishmentResult {
  const dataQuality = assessCommercialDataQuality({
    id: `${input.id}:data-quality`,
    skuId: input.skuId,
    warehouseId: input.warehouseId,
    currency: input.inventory.currency,
    unitCost: input.inventory.unitCost,
    availableUnits: input.inventory.availableUnits,
    reservedUnits: input.inventory.reservedUnits,
    inboundUnits: input.inventory.inboundUnits,
    daysSinceLastSale: input.inventory.daysSinceLastSale,
    observations: input.forecast.observations,
    asOfDate: input.planningDate,
    minimumScore: input.minimumDataQualityScore,
    generatedAt: input.analysisAt,
  });

  if (!dataQuality.automationReady && dataQuality.status === "block") {
    return Object.freeze({
      id: input.id,
      status: "blocked",
      dataQuality,
      decisionResolution: resolveCommercialDecisions({
        contextId: input.id,
        decisions: [dataQuality.decision],
        generatedAt: input.analysisAt,
      }),
    });
  }

  const replenishment = analyzeReplenishment(input);
  const decisionResolution = resolveCommercialDecisions({
    contextId: input.id,
    decisions: [dataQuality.decision, ...replenishment.decisions],
    generatedAt: input.analysisAt,
  });
  const status: GuardedReplenishmentResult["status"] =
    dataQuality.status === "review" ||
    decisionResolution.status === "requires_review"
      ? "review"
      : decisionResolution.status === "blocked"
        ? "blocked"
        : "ready";

  return Object.freeze({
    id: input.id,
    status,
    dataQuality,
    replenishment,
    decisionResolution,
  });
}
