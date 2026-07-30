import type { AbcXyzClassification } from "@/domain/assortment/abc-xyz-classifier";
import {
  clampConfidence,
  type CommercialDecision,
  type DecisionReason,
  type DecisionSeverity,
  type RecommendedAction,
} from "@/domain/decision/decision";
import type { SupplyPlanRecommendation } from "@/domain/inventory/supply-planning-engine";

export type PurchaseRecommendationStatus =
  | "no_order"
  | "ready"
  | "partial"
  | "manual_review"
  | "blocked";

export interface SupplierPurchaseTerms {
  readonly supplierId: string;
  readonly active: boolean;
  readonly approved: boolean;
  readonly unitCost: number;
  readonly currency: string;
  readonly availableCapacityUnits?: number;
  readonly minimumOrderValue?: number;
  readonly maximumOrderValue?: number;
  readonly paymentTermsDays?: number;
}

export interface PurchaseBudget {
  readonly currency: string;
  readonly availableAmount: number;
}

export interface PurchaseRecommendationInput {
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
  readonly supplier: SupplierPurchaseTerms;
  readonly budget: PurchaseBudget;
  readonly openPurchaseOrderUnits?: number;
  readonly createdAt?: string;
}

export interface PurchaseRecommendation {
  readonly id: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly skuId: string;
  readonly supplierId: string;
  readonly status: PurchaseRecommendationStatus;
  readonly requestedUnits: number;
  readonly openPurchaseOrderUnits: number;
  readonly recommendedUnits: number;
  readonly unfundedUnits: number;
  readonly expectedSpend: number;
  readonly currency: string;
  readonly orderByDate?: string;
  readonly expectedReceiptDate?: string;
  readonly decision: CommercialDecision;
}

const severityRank: Record<DecisionSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function maxSeverity(...values: DecisionSeverity[]): DecisionSeverity {
  return values.reduce((highest, current) =>
    severityRank[current] > severityRank[highest] ? current : highest,
  );
}

function urgencySeverity(
  urgency: SupplyPlanRecommendation["urgency"],
): DecisionSeverity {
  if (urgency === "overdue") return "critical";
  if (urgency === "urgent") return "high";
  if (urgency === "planned") return "medium";
  return "info";
}

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number.`);
  }
}

function floorUnits(value: number): number {
  return Math.max(0, Math.floor(value));
}

function segmentConfidence(segment: AbcXyzClassification["segment"]): number {
  if (segment.endsWith("X")) return 0.95;
  if (segment.endsWith("Y")) return 0.8;
  return 0.55;
}

function buildReadyAction(input: {
  units: number;
  supplierId: string;
  dueAt?: string;
  expectedReceiptDate?: string;
  expectedSpend: number;
  currency: string;
  priority: DecisionSeverity;
}): RecommendedAction {
  return {
    type: "create_purchase_order",
    priority: input.priority,
    title: "Create purchase order",
    description:
      "The replenishment requirement is commercially executable within supplier and budget constraints.",
    quantity: input.units,
    dueAt: input.dueAt,
    metadata: {
      supplierId: input.supplierId,
      expectedSpend: input.expectedSpend,
      currency: input.currency,
      ...(input.expectedReceiptDate
        ? { expectedReceiptDate: input.expectedReceiptDate }
        : {}),
    },
  };
}

export function createPurchaseRecommendation(
  input: PurchaseRecommendationInput,
): PurchaseRecommendation {
  if (!input.id.trim()) throw new Error("Purchase recommendation id is required.");
  if (
    input.organizationId !== input.supplyPlan.organizationId ||
    input.warehouseId !== input.supplyPlan.warehouseId ||
    input.skuId !== input.supplyPlan.skuId
  ) {
    throw new Error(
      "Purchase recommendation scope must match the supply plan scope.",
    );
  }

  assertFiniteNonNegative(input.supplier.unitCost, "Supplier unit cost");
  assertFiniteNonNegative(input.budget.availableAmount, "Available budget");
  assertFiniteNonNegative(
    input.openPurchaseOrderUnits ?? 0,
    "Open purchase order units",
  );
  if (input.supplier.availableCapacityUnits !== undefined) {
    assertFiniteNonNegative(
      input.supplier.availableCapacityUnits,
      "Supplier available capacity units",
    );
  }
  if (input.supplier.minimumOrderValue !== undefined) {
    assertFiniteNonNegative(
      input.supplier.minimumOrderValue,
      "Supplier minimum order value",
    );
  }
  if (input.supplier.maximumOrderValue !== undefined) {
    assertFiniteNonNegative(
      input.supplier.maximumOrderValue,
      "Supplier maximum order value",
    );
  }

  const createdAt = input.createdAt ?? new Date().toISOString();
  const openPurchaseOrderUnits = floorUnits(input.openPurchaseOrderUnits ?? 0);
  const requestedUnits = Math.max(
    0,
    input.supplyPlan.recommendedOrderQuantity - openPurchaseOrderUnits,
  );
  const reasons: DecisionReason[] = [];
  const actions: RecommendedAction[] = [];
  let status: PurchaseRecommendationStatus = "ready";
  let recommendedUnits = requestedUnits;

  if (input.supplyPlan.recommendedOrderQuantity <= 0) {
    status = "no_order";
    recommendedUnits = 0;
    reasons.push({
      code: "purchase.no_requirement",
      message: "The active supply plan does not require a new purchase order.",
    });
  } else if (requestedUnits === 0) {
    status = "no_order";
    recommendedUnits = 0;
    reasons.push({
      code: "purchase.covered_by_open_orders",
      message: "Existing open purchase orders fully cover the supply requirement.",
      metric: "openPurchaseOrderUnits",
      actual: openPurchaseOrderUnits,
      threshold: input.supplyPlan.recommendedOrderQuantity,
      unit: "units",
    });
  }

  if (status !== "no_order" && !input.supplier.active) {
    status = "blocked";
    recommendedUnits = 0;
    reasons.push({
      code: "purchase.supplier_inactive",
      message: "The selected supplier is inactive.",
    });
    actions.push({
      type: "supplier_review",
      priority: "critical",
      title: "Select an active supplier",
      description: "A purchase order cannot be created for an inactive supplier.",
    });
  } else if (status !== "no_order" && !input.supplier.approved) {
    status = "blocked";
    recommendedUnits = 0;
    reasons.push({
      code: "purchase.supplier_not_approved",
      message: "The selected supplier has not completed commercial approval.",
    });
    actions.push({
      type: "supplier_review",
      priority: "high",
      title: "Complete supplier approval",
      description:
        "Approve the supplier or select an approved alternative before ordering.",
    });
  }

  if (
    status !== "no_order" &&
    status !== "blocked" &&
    input.supplier.currency !== input.budget.currency
  ) {
    status = "blocked";
    recommendedUnits = 0;
    reasons.push({
      code: "purchase.currency_mismatch",
      message: "Supplier and budget currencies do not match.",
    });
    actions.push({
      type: "budget_review",
      priority: "high",
      title: "Resolve purchase currency",
      description:
        "Allocate budget in the supplier currency or provide an approved FX conversion policy.",
    });
  }

  if (status !== "no_order" && status !== "blocked") {
    const affordableUnits =
      input.supplier.unitCost === 0
        ? requestedUnits
        : floorUnits(input.budget.availableAmount / input.supplier.unitCost);
    const capacityUnits = floorUnits(
      input.supplier.availableCapacityUnits ?? requestedUnits,
    );
    const maximumValueUnits =
      input.supplier.maximumOrderValue === undefined ||
      input.supplier.unitCost === 0
        ? requestedUnits
        : floorUnits(
            input.supplier.maximumOrderValue / input.supplier.unitCost,
          );

    recommendedUnits = Math.min(
      requestedUnits,
      affordableUnits,
      capacityUnits,
      maximumValueUnits,
    );

    if (input.classification.policy.replenishmentMode === "do_not_replenish") {
      status = "manual_review";
      recommendedUnits = 0;
      reasons.push({
        code: "purchase.policy_do_not_replenish",
        message: `ABC/XYZ segment ${input.classification.segment} is configured not to replenish automatically.`,
      });
      actions.push({
        type: "defer_purchase",
        priority: "medium",
        title: "Defer automatic purchase",
        description:
          "Review the assortment role and exit strategy before creating a purchase order.",
      });
    } else if (
      input.classification.policy.replenishmentMode === "manual_review"
    ) {
      status = "manual_review";
      reasons.push({
        code: "purchase.policy_manual_review",
        message: `ABC/XYZ segment ${input.classification.segment} requires manual replenishment approval.`,
      });
      actions.push({
        type: "review",
        priority: input.classification.policy.priority,
        title: "Approve replenishment manually",
        description:
          "Demand variability requires buyer approval before a purchase order is created.",
        quantity: recommendedUnits,
      });
    } else if (recommendedUnits <= 0) {
      status = "blocked";
      reasons.push({
        code: "purchase.no_executable_quantity",
        message:
          "Budget, supplier capacity, or maximum order value leaves no executable quantity.",
      });
      actions.push({
        type: "budget_review",
        priority: "critical",
        title: "Resolve purchase constraints",
        description:
          "Increase budget, release supplier capacity, or choose another supplier.",
      });
    } else if (recommendedUnits < requestedUnits) {
      status = "partial";
      reasons.push({
        code: "purchase.partially_constrained",
        message:
          "The requirement can only be partially covered within current commercial constraints.",
        metric: "recommendedUnits",
        actual: recommendedUnits,
        threshold: requestedUnits,
        unit: "units",
      });
      actions.push(
        buildReadyAction({
          units: recommendedUnits,
          supplierId: input.supplier.supplierId,
          dueAt: input.supplyPlan.orderByDate,
          expectedReceiptDate: input.supplyPlan.expectedReceiptDate,
          expectedSpend: recommendedUnits * input.supplier.unitCost,
          currency: input.supplier.currency,
          priority: urgencySeverity(input.supplyPlan.urgency),
        }),
        {
          type: "split_order",
          priority: "high",
          title: "Cover the remaining requirement",
          description:
            "Allocate additional budget, split the order, or source the remaining units from another supplier.",
          quantity: requestedUnits - recommendedUnits,
        },
      );
    }

    const expectedSpend = recommendedUnits * input.supplier.unitCost;
    if (
      status !== "blocked" &&
      input.supplier.minimumOrderValue !== undefined &&
      expectedSpend < input.supplier.minimumOrderValue
    ) {
      status = "manual_review";
      reasons.push({
        code: "purchase.minimum_order_value",
        message:
          "The executable quantity does not meet the supplier minimum order value.",
        metric: "expectedSpend",
        actual: expectedSpend,
        threshold: input.supplier.minimumOrderValue,
        unit: input.supplier.currency,
      });
      actions.splice(0, actions.length, {
        type: "review",
        priority: "high",
        title: "Review supplier minimum order value",
        description:
          "Consolidate demand, negotiate the minimum, or choose another supplier.",
        quantity: recommendedUnits,
      });
    }
  }

  const expectedSpend = recommendedUnits * input.supplier.unitCost;
  const unfundedUnits = Math.max(0, requestedUnits - recommendedUnits);
  const baseSeverity = maxSeverity(
    urgencySeverity(input.supplyPlan.urgency),
    input.healthDecision.severity,
    input.classification.policy.priority,
  );

  if (status === "ready") {
    reasons.push({
      code: "purchase.ready",
      message:
        "The supply requirement fits the active supplier, budget, and assortment policy.",
    });
    actions.push(
      buildReadyAction({
        units: recommendedUnits,
        supplierId: input.supplier.supplierId,
        dueAt: input.supplyPlan.orderByDate,
        expectedReceiptDate: input.supplyPlan.expectedReceiptDate,
        expectedSpend,
        currency: input.supplier.currency,
        priority: baseSeverity,
      }),
    );
  } else if (status === "no_order") {
    actions.push({
      type: "none",
      priority: "info",
      title: "No purchase order required",
      description:
        "Continue monitoring the forecast, ATP position, and open purchase orders.",
    });
  }

  const decisionConfidence = clampConfidence(
    input.healthDecision.confidence *
      segmentConfidence(input.classification.segment) *
      (status === "ready" || status === "no_order" ? 1 : 0.8),
  );
  const decision: CommercialDecision = {
    id: `purchase:${input.id}`,
    entityType: "sku",
    entityId: input.skuId,
    decisionType: "purchase_recommendation",
    severity:
      status === "blocked"
        ? "critical"
        : status === "partial" || status === "manual_review"
          ? maxSeverity(baseSeverity, "high")
          : baseSeverity,
    confidence: decisionConfidence,
    reasons,
    impacts: [
      {
        metric: "expectedSpend",
        value: expectedSpend,
        unit: input.supplier.currency,
        direction: expectedSpend > 0 ? "increase" : "neutral",
      },
      {
        metric: "unfundedUnits",
        value: unfundedUnits,
        unit: "units",
        direction: unfundedUnits > 0 ? "decrease" : "neutral",
      },
    ],
    actions,
    createdAt,
    source: "purchase-recommendation-engine",
    version: 1,
  };

  return Object.freeze({
    id: input.id,
    organizationId: input.organizationId,
    warehouseId: input.warehouseId,
    skuId: input.skuId,
    supplierId: input.supplier.supplierId,
    status,
    requestedUnits,
    openPurchaseOrderUnits,
    recommendedUnits,
    unfundedUnits,
    expectedSpend,
    currency: input.supplier.currency,
    orderByDate: input.supplyPlan.orderByDate,
    expectedReceiptDate:
      recommendedUnits > 0 ? input.supplyPlan.expectedReceiptDate : undefined,
    decision,
  });
}
