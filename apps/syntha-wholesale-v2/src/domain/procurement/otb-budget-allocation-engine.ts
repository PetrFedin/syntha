import type { AbcXyzSegment } from "@/domain/assortment/abc-xyz-classifier";
import {
  clampConfidence,
  type CommercialDecision,
  type DecisionReason,
} from "@/domain/decision/decision";

export type OtbUrgency = "none" | "planned" | "urgent" | "overdue";

export interface OtbCandidateInput {
  readonly skuId: string;
  readonly requestedUnits: number;
  readonly unitCost: number;
  readonly currency: string;
  readonly segment: AbcXyzSegment;
  readonly urgency: OtbUrgency;
  readonly stockoutRisk: number;
  readonly expectedGrossMarginRate: number;
  readonly decisionConfidence: number;
  readonly minimumAllocationUnits?: number;
  readonly orderMultiple?: number;
  readonly maximumAllocationUnits?: number;
}

export interface OtbAllocationWeights {
  readonly segment?: number;
  readonly stockoutRisk?: number;
  readonly urgency?: number;
  readonly margin?: number;
  readonly confidence?: number;
}

export interface OtbBudgetAllocationInput {
  readonly id: string;
  readonly budgetId: string;
  readonly currency: string;
  readonly availableBudget: number;
  readonly candidates: readonly OtbCandidateInput[];
  readonly weights?: OtbAllocationWeights;
  readonly generatedAt?: string;
}

export interface OtbAllocationLine {
  readonly rank: number;
  readonly skuId: string;
  readonly score: number;
  readonly requestedUnits: number;
  readonly allocatedUnits: number;
  readonly unfundedUnits: number;
  readonly allocatedSpend: number;
  readonly fulfillmentRatio: number;
  readonly status: "full" | "partial" | "unfunded" | "ineligible";
  readonly reason?: string;
}

export interface OtbBudgetAllocationResult {
  readonly id: string;
  readonly budgetId: string;
  readonly currency: string;
  readonly availableBudget: number;
  readonly allocatedBudget: number;
  readonly remainingBudget: number;
  readonly totalRequestedSpend: number;
  readonly totalUnfundedSpend: number;
  readonly lines: readonly OtbAllocationLine[];
  readonly decision: CommercialDecision;
}

const segmentScore: Record<AbcXyzSegment, number> = {
  AX: 1,
  AY: 0.95,
  AZ: 0.85,
  BX: 0.8,
  BY: 0.7,
  BZ: 0.6,
  CX: 0.5,
  CY: 0.35,
  CZ: 0.15,
};

const urgencyScore: Record<OtbUrgency, number> = {
  none: 0.1,
  planned: 0.5,
  urgent: 0.85,
  overdue: 1,
};

const round = (value: number, digits = 4): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number.`);
  }
}

function normalizedWeights(
  weights: OtbAllocationWeights = {},
): Required<OtbAllocationWeights> {
  const raw = {
    segment: Math.max(0, weights.segment ?? 0.2),
    stockoutRisk: Math.max(0, weights.stockoutRisk ?? 0.25),
    urgency: Math.max(0, weights.urgency ?? 0.2),
    margin: Math.max(0, weights.margin ?? 0.2),
    confidence: Math.max(0, weights.confidence ?? 0.15),
  };
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return {
      segment: 1,
      stockoutRisk: 0,
      urgency: 0,
      margin: 0,
      confidence: 0,
    };
  }
  return {
    segment: raw.segment / total,
    stockoutRisk: raw.stockoutRisk / total,
    urgency: raw.urgency / total,
    margin: raw.margin / total,
    confidence: raw.confidence / total,
  };
}

function roundDownToMultiple(quantity: number, multiple: number): number {
  if (quantity <= 0) return 0;
  return Math.floor(quantity / multiple) * multiple;
}

interface ScoredCandidate {
  input: OtbCandidateInput;
  score: number;
  requestedUnits: number;
  maximumUnits: number;
  minimumUnits: number;
  orderMultiple: number;
  eligible: boolean;
  ineligibleReason?: string;
}

function scoreCandidates(
  input: OtbBudgetAllocationInput,
): ScoredCandidate[] {
  const seen = new Set<string>();
  const weights = normalizedWeights(input.weights);

  return input.candidates.map((candidate) => {
    if (seen.has(candidate.skuId)) {
      throw new Error(`Duplicate SKU in OTB allocation: ${candidate.skuId}`);
    }
    seen.add(candidate.skuId);

    assertFiniteNonNegative(candidate.requestedUnits, "Requested units");
    assertFiniteNonNegative(candidate.unitCost, "Unit cost");
    assertFiniteNonNegative(
      candidate.minimumAllocationUnits ?? 0,
      "Minimum allocation units",
    );
    assertFiniteNonNegative(
      candidate.maximumAllocationUnits ?? candidate.requestedUnits,
      "Maximum allocation units",
    );

    const orderMultiple = Math.floor(candidate.orderMultiple ?? 1);
    if (!Number.isInteger(orderMultiple) || orderMultiple <= 0) {
      throw new Error("Order multiple must be a positive integer.");
    }

    const requestedUnits = Math.floor(candidate.requestedUnits);
    const maximumUnits = Math.min(
      requestedUnits,
      Math.floor(candidate.maximumAllocationUnits ?? requestedUnits),
    );
    const minimumUnits = Math.floor(candidate.minimumAllocationUnits ?? 0);
    const eligible = candidate.currency === input.currency && requestedUnits > 0;
    const marginScore = clamp01(candidate.expectedGrossMarginRate / 0.8);
    const score =
      segmentScore[candidate.segment] * weights.segment +
      clamp01(candidate.stockoutRisk) * weights.stockoutRisk +
      urgencyScore[candidate.urgency] * weights.urgency +
      marginScore * weights.margin +
      clampConfidence(candidate.decisionConfidence) * weights.confidence;

    return {
      input: candidate,
      score: round(score),
      requestedUnits,
      maximumUnits,
      minimumUnits,
      orderMultiple,
      eligible,
      ineligibleReason:
        candidate.currency !== input.currency
          ? "currency_mismatch"
          : requestedUnits <= 0
            ? "no_requested_units"
            : undefined,
    };
  });
}

export function allocateOtbBudget(
  input: OtbBudgetAllocationInput,
): OtbBudgetAllocationResult {
  if (!input.id.trim()) throw new Error("OTB allocation id is required.");
  if (!input.budgetId.trim()) throw new Error("OTB budget id is required.");
  assertFiniteNonNegative(input.availableBudget, "Available budget");
  if (input.candidates.length === 0) {
    throw new Error("OTB allocation requires at least one candidate.");
  }

  const scored = scoreCandidates(input).sort(
    (left, right) =>
      Number(right.eligible) - Number(left.eligible) ||
      right.score - left.score ||
      left.input.skuId.localeCompare(right.input.skuId),
  );
  let remainingBudget = input.availableBudget;
  const lines: OtbAllocationLine[] = [];

  for (const [index, candidate] of scored.entries()) {
    if (!candidate.eligible) {
      lines.push({
        rank: index + 1,
        skuId: candidate.input.skuId,
        score: candidate.score,
        requestedUnits: candidate.requestedUnits,
        allocatedUnits: 0,
        unfundedUnits: candidate.requestedUnits,
        allocatedSpend: 0,
        fulfillmentRatio: 0,
        status: "ineligible",
        reason: candidate.ineligibleReason,
      });
      continue;
    }

    const affordableUnits =
      candidate.input.unitCost === 0
        ? candidate.maximumUnits
        : Math.floor(remainingBudget / candidate.input.unitCost);
    let allocatedUnits = roundDownToMultiple(
      Math.min(candidate.maximumUnits, affordableUnits),
      candidate.orderMultiple,
    );
    if (allocatedUnits > 0 && allocatedUnits < candidate.minimumUnits) {
      allocatedUnits = 0;
    }

    const allocatedSpend = allocatedUnits * candidate.input.unitCost;
    remainingBudget = Math.max(0, remainingBudget - allocatedSpend);
    const unfundedUnits = Math.max(
      0,
      candidate.requestedUnits - allocatedUnits,
    );
    const fulfillmentRatio =
      candidate.requestedUnits === 0
        ? 1
        : allocatedUnits / candidate.requestedUnits;
    const status =
      allocatedUnits >= candidate.requestedUnits
        ? "full"
        : allocatedUnits > 0
          ? "partial"
          : "unfunded";

    lines.push({
      rank: index + 1,
      skuId: candidate.input.skuId,
      score: candidate.score,
      requestedUnits: candidate.requestedUnits,
      allocatedUnits,
      unfundedUnits,
      allocatedSpend: round(allocatedSpend, 2),
      fulfillmentRatio: round(fulfillmentRatio),
      status,
      reason:
        status === "unfunded" && candidate.minimumUnits > 0
          ? "minimum_allocation_not_funded"
          : undefined,
    });
  }

  const allocatedBudget = lines.reduce(
    (total, line) => total + line.allocatedSpend,
    0,
  );
  const totalRequestedSpend = scored.reduce(
    (total, candidate) =>
      total + candidate.requestedUnits * candidate.input.unitCost,
    0,
  );
  const totalUnfundedSpend = lines.reduce((total, line) => {
    const candidate = scored.find(
      (item) => item.input.skuId === line.skuId,
    );
    return total + line.unfundedUnits * (candidate?.input.unitCost ?? 0);
  }, 0);
  const criticalUnfunded = lines.filter((line) => {
    const candidate = scored.find(
      (item) => item.input.skuId === line.skuId,
    );
    return (
      line.unfundedUnits > 0 &&
      candidate !== undefined &&
      (candidate.input.urgency === "overdue" ||
        candidate.input.stockoutRisk >= 0.8)
    );
  });
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const reasons: DecisionReason[] = [
    {
      code: "otb.allocated",
      message: `${lines.filter((line) => line.allocatedUnits > 0).length} SKU received budget allocation.`,
      metric: "allocatedBudget",
      actual: round(allocatedBudget, 2),
      threshold: input.availableBudget,
      unit: input.currency,
    },
  ];
  if (totalUnfundedSpend > 0) {
    reasons.push({
      code: "otb.unfunded",
      message:
        "The available OTB budget does not fully cover all prioritized purchase requirements.",
      metric: "unfundedSpend",
      actual: round(totalUnfundedSpend, 2),
      threshold: 0,
      unit: input.currency,
    });
  }

  const weightedConfidenceNumerator = scored.reduce(
    (total, candidate) =>
      total +
      candidate.score * clampConfidence(candidate.input.decisionConfidence),
    0,
  );
  const totalScore = scored.reduce(
    (total, candidate) => total + candidate.score,
    0,
  );
  const confidence =
    totalScore === 0
      ? 0
      : clampConfidence(weightedConfidenceNumerator / totalScore);

  return Object.freeze({
    id: input.id,
    budgetId: input.budgetId,
    currency: input.currency,
    availableBudget: round(input.availableBudget, 2),
    allocatedBudget: round(allocatedBudget, 2),
    remainingBudget: round(remainingBudget, 2),
    totalRequestedSpend: round(totalRequestedSpend, 2),
    totalUnfundedSpend: round(totalUnfundedSpend, 2),
    lines: Object.freeze(lines),
    decision: {
      id: `otb-allocation:${input.id}`,
      entityType: "budget",
      entityId: input.budgetId,
      decisionType: "otb_budget_allocation",
      severity:
        criticalUnfunded.length > 0
          ? "critical"
          : totalUnfundedSpend > 0
            ? "high"
            : "medium",
      confidence,
      reasons,
      impacts: [
        {
          metric: "allocatedBudget",
          value: round(allocatedBudget, 2),
          unit: input.currency,
          direction: allocatedBudget > 0 ? "increase" : "neutral",
        },
        {
          metric: "remainingBudget",
          value: round(remainingBudget, 2),
          unit: input.currency,
          direction: "neutral",
        },
        {
          metric: "unfundedSpend",
          value: round(totalUnfundedSpend, 2),
          unit: input.currency,
          direction: totalUnfundedSpend > 0 ? "decrease" : "neutral",
        },
      ],
      actions: [
        {
          type: "allocate_budget",
          priority: criticalUnfunded.length > 0 ? "critical" : "high",
          title: "Apply OTB budget allocation",
          description:
            "Fund purchase requirements in portfolio priority order and preserve the remaining budget for the next planning cycle.",
          metadata: {
            allocatedBudget: round(allocatedBudget, 2),
            remainingBudget: round(remainingBudget, 2),
            currency: input.currency,
            fundedSkuCount: lines.filter((line) => line.allocatedUnits > 0).length,
          },
        },
        ...(totalUnfundedSpend > 0
          ? [
              {
                type: "budget_review" as const,
                priority: criticalUnfunded.length > 0 ? "critical" as const : "high" as const,
                title: "Review unfunded purchase requirements",
                description:
                  "Increase OTB, reduce quantities, defer lower-priority purchases, or renegotiate supplier terms.",
                metadata: {
                  unfundedSpend: round(totalUnfundedSpend, 2),
                  currency: input.currency,
                  unfundedSkuCount: lines.filter((line) => line.unfundedUnits > 0).length,
                },
              },
            ]
          : []),
      ],
      createdAt: generatedAt,
      source: "otb-budget-allocation-engine",
      version: 1,
    },
  });
}
