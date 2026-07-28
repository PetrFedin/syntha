import type { AbcXyzClassification } from "@/domain/assortment/abc-xyz-classifier";
import type { CommercialDecision } from "@/domain/decision/decision";
import type { AtpProjection } from "@/domain/inventory/available-to-promise";
import {
  analyzeInventoryPosition,
  type InventoryForecastInput,
  type InventoryIntelligenceResult,
  type InventorySnapshotInput,
} from "@/domain/inventory/inventory-intelligence-engine";
import {
  createSupplyPlanRecommendation,
  type SupplyPlanRecommendation,
  type SupplyPlanningPolicy,
} from "@/domain/inventory/supply-planning-engine";
import {
  createPurchaseRecommendation,
  type PurchaseBudget,
  type PurchaseRecommendation,
  type SupplierPurchaseTerms,
} from "@/domain/procurement/purchase-recommendation-engine";

export type ReplenishmentInventoryInput = Omit<
  InventorySnapshotInput,
  "leadTimeDays" | "safetyStockUnits" | "targetCoverageDays"
>;

export interface ReplenishmentIntelligenceInput {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly planningDate: string;
  readonly inventory: ReplenishmentInventoryInput;
  readonly forecast: InventoryForecastInput;
  readonly atp: AtpProjection;
  readonly supplyPolicy: SupplyPlanningPolicy;
  readonly classification: Pick<
    AbcXyzClassification,
    "segment" | "policy" | "coefficientOfVariation"
  >;
  readonly supplier: SupplierPurchaseTerms;
  readonly budget: PurchaseBudget;
  readonly openPurchaseOrderUnits?: number;
  readonly analysisAt?: string;
}

export interface ReplenishmentIntelligenceResult {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly analysisAt: string;
  readonly inventory: InventoryIntelligenceResult;
  readonly supplyPlan: SupplyPlanRecommendation;
  readonly purchase: PurchaseRecommendation;
  readonly decisions: readonly CommercialDecision[];
}

function assertMatchingAtpScope(
  input: ReplenishmentIntelligenceInput,
): void {
  if (
    input.organizationId !== input.atp.organizationId ||
    input.warehouseId !== input.atp.warehouseId ||
    input.skuId !== input.atp.skuId
  ) {
    throw new Error(
      "Replenishment intelligence scope must match the ATP projection scope.",
    );
  }
}

export function analyzeReplenishment(
  input: ReplenishmentIntelligenceInput,
): ReplenishmentIntelligenceResult {
  if (!input.id.trim()) {
    throw new Error("Replenishment intelligence id is required.");
  }
  assertMatchingAtpScope(input);

  const analysisAt = input.analysisAt ?? new Date().toISOString();
  const leadTimeDays = Math.max(0, Math.floor(input.supplyPolicy.leadTimeDays));
  const reviewPeriodDays = Math.max(
    0,
    Math.floor(input.supplyPolicy.reviewPeriodDays ?? 0),
  );
  const targetCoverageDays =
    input.supplyPolicy.targetCoverDays ?? leadTimeDays + reviewPeriodDays;

  const inventory = analyzeInventoryPosition({
    skuId: input.skuId,
    warehouseId: input.warehouseId,
    inventory: {
      ...input.inventory,
      leadTimeDays,
      safetyStockUnits: input.supplyPolicy.safetyStock,
      targetCoverageDays,
    },
    forecast: input.forecast,
    analysisAt,
  });

  const supplyPlan = createSupplyPlanRecommendation({
    id: `${input.id}:supply-plan`,
    organizationId: input.organizationId,
    warehouseId: input.warehouseId,
    skuId: input.skuId,
    planningDate: input.planningDate,
    policy: input.supplyPolicy,
    demandRate: {
      averageDailyDemand: inventory.demandProjection.averageDailyDemand,
      demandStandardDeviation:
        inventory.forecast.diagnostics.residualStdDev,
    },
    atp: input.atp,
  });

  const purchase = createPurchaseRecommendation({
    id: `${input.id}:purchase`,
    organizationId: input.organizationId,
    warehouseId: input.warehouseId,
    skuId: input.skuId,
    supplyPlan,
    classification: input.classification,
    healthDecision: inventory.health.decision,
    supplier: input.supplier,
    budget: input.budget,
    openPurchaseOrderUnits: input.openPurchaseOrderUnits,
    createdAt: analysisAt,
  });

  return Object.freeze({
    id: input.id,
    organizationId: input.organizationId,
    warehouseId: input.warehouseId,
    skuId: input.skuId,
    analysisAt,
    inventory,
    supplyPlan,
    purchase,
    decisions: Object.freeze([
      inventory.health.decision,
      purchase.decision,
    ]),
  });
}
