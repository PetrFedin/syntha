import type { AbcXyzClassification } from "@/domain/assortment/abc-xyz-classifier";
import type { CommercialDecision } from "@/domain/decision/decision";
import {
  resolveCommercialDecisions,
  type UnifiedDecisionResult,
} from "@/domain/decision/unified-decision-engine";
import type { SupplyPlanRecommendation } from "@/domain/inventory/supply-planning-engine";
import {
  createPurchaseRecommendation,
  type PurchaseBudget,
  type PurchaseRecommendation,
} from "@/domain/procurement/purchase-recommendation-engine";
import {
  selectSupplier,
  type SupplierCandidateInput,
  type SupplierSelectionResult,
  type SupplierSelectionWeights,
} from "@/domain/procurement/supplier-intelligence-engine";

export interface SourcedPurchaseInput {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly supplyPlan: SupplyPlanRecommendation;
  readonly classification: Pick<
    AbcXyzClassification,
    "segment" | "policy" | "coefficientOfVariation"
  >;
  readonly healthDecision: CommercialDecision;
  readonly budget: PurchaseBudget;
  readonly supplierCandidates: readonly SupplierCandidateInput[];
  readonly supplierWeights?: SupplierSelectionWeights;
  readonly openPurchaseOrderUnits?: number;
  readonly generatedAt?: string;
}

export interface SourcedPurchaseResult {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly supplierSelection: SupplierSelectionResult;
  readonly purchase?: PurchaseRecommendation;
  readonly decisions: readonly CommercialDecision[];
  readonly decisionResolution: UnifiedDecisionResult;
}

export function createSourcedPurchase(
  input: SourcedPurchaseInput,
): SourcedPurchaseResult {
  if (!input.id.trim()) throw new Error("Sourced purchase id is required.");
  if (
    input.organizationId !== input.supplyPlan.organizationId ||
    input.warehouseId !== input.supplyPlan.warehouseId ||
    input.skuId !== input.supplyPlan.skuId
  ) {
    throw new Error("Sourced purchase scope must match the supply plan scope.");
  }

  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const openPurchaseOrderUnits = Math.max(
    0,
    Math.floor(input.openPurchaseOrderUnits ?? 0),
  );
  const requestedUnits = Math.max(
    0,
    input.supplyPlan.recommendedOrderQuantity - openPurchaseOrderUnits,
  );
  const supplierSelection = selectSupplier({
    id: `${input.id}:supplier-selection`,
    skuId: input.skuId,
    requestedUnits,
    planningDate: input.supplyPlan.planningDate,
    requiredByDate:
      input.supplyPlan.shortageDate ?? input.supplyPlan.expectedReceiptDate,
    budget: input.budget,
    candidates: input.supplierCandidates,
    weights: input.supplierWeights,
    generatedAt,
  });

  const purchase = supplierSelection.selectedTerms
    ? createPurchaseRecommendation({
        id: `${input.id}:purchase`,
        organizationId: input.organizationId,
        warehouseId: input.warehouseId,
        skuId: input.skuId,
        supplyPlan: input.supplyPlan,
        classification: input.classification,
        healthDecision: input.healthDecision,
        supplier: supplierSelection.selectedTerms,
        budget: input.budget,
        openPurchaseOrderUnits,
        createdAt: generatedAt,
      })
    : undefined;

  const decisions = Object.freeze(
    purchase
      ? [
          input.healthDecision,
          supplierSelection.decision,
          purchase.decision,
        ]
      : [input.healthDecision, supplierSelection.decision],
  );
  const decisionResolution = resolveCommercialDecisions({
    contextId: input.id,
    decisions,
    generatedAt,
  });

  return Object.freeze({
    id: input.id,
    organizationId: input.organizationId,
    warehouseId: input.warehouseId,
    skuId: input.skuId,
    supplierSelection,
    purchase,
    decisions,
    decisionResolution,
  });
}
