import type { CommercialDecision } from "@/domain/decision/decision";
import {
  deriveInventoryDemandProjection,
  forecastDemand,
  type DemandForecastInput,
  type DemandForecastResult,
  type InventoryDemandProjection,
} from "@/domain/forecast/demand-forecast-engine";
import {
  assessInventoryHealth,
  type InventoryHealthAssessment,
  type InventoryHealthInput,
} from "@/domain/inventory/inventory-health-engine";

export type InventorySnapshotInput = Omit<
  InventoryHealthInput,
  | "skuId"
  | "warehouseId"
  | "averageDailyDemand"
  | "forecastDemandDuringLeadTime"
  | "confidence"
>;

export type InventoryForecastInput = Omit<DemandForecastInput, "skuId">;

export interface InventoryIntelligenceInput {
  skuId: string;
  warehouseId: string;
  inventory: InventorySnapshotInput;
  forecast: InventoryForecastInput;
  analysisAt?: string;
}

export interface InventoryIntelligenceResult {
  skuId: string;
  warehouseId: string;
  analysisAt: string;
  forecast: DemandForecastResult;
  demandProjection: InventoryDemandProjection;
  health: InventoryHealthAssessment;
  decisions: CommercialDecision[];
}

/**
 * Runs the connected inventory decision flow:
 * demand history -> forecast -> lead-time demand -> inventory health -> action.
 */
export function analyzeInventoryPosition(
  input: InventoryIntelligenceInput,
): InventoryIntelligenceResult {
  const analysisAt = input.analysisAt ?? new Date().toISOString();
  const leadTimeDays = Math.max(0, Math.floor(input.inventory.leadTimeDays));

  // The forecast must cover the complete supplier lead time. Otherwise the
  // health engine would systematically understate stockout risk.
  const forecastHorizonDays = Math.max(
    1,
    Math.floor(input.forecast.horizonDays),
    leadTimeDays,
  );

  const forecast = forecastDemand({
    ...input.forecast,
    skuId: input.skuId,
    horizonDays: forecastHorizonDays,
    generatedAt: input.forecast.generatedAt ?? analysisAt,
  });
  const demandProjection = deriveInventoryDemandProjection(
    forecast,
    leadTimeDays,
  );
  const health = assessInventoryHealth({
    ...input.inventory,
    skuId: input.skuId,
    warehouseId: input.warehouseId,
    averageDailyDemand: demandProjection.averageDailyDemand,
    forecastDemandDuringLeadTime:
      demandProjection.forecastDemandDuringLeadTime,
    confidence: demandProjection.forecastConfidence,
    calculatedAt: input.inventory.calculatedAt ?? analysisAt,
  });

  return {
    skuId: input.skuId,
    warehouseId: input.warehouseId,
    analysisAt,
    forecast,
    demandProjection,
    health,
    decisions: [health.decision],
  };
}
