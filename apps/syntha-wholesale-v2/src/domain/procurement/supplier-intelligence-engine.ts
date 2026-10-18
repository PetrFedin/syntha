import {
  clampConfidence,
  type CommercialDecision,
  type DecisionReason,
} from "@/domain/decision/decision";
import type {
  PurchaseBudget,
  SupplierPurchaseTerms,
} from "@/domain/procurement/purchase-recommendation-engine";

export interface SupplierCandidateInput {
  readonly supplierId: string;
  readonly active: boolean;
  readonly approved: boolean;
  readonly unitCost: number;
  readonly freightPerUnit?: number;
  readonly dutyRate?: number;
  readonly currency: string;
  readonly leadTimeDays: number;
  readonly availableCapacityUnits: number;
  readonly minimumOrderQuantity?: number;
  readonly orderMultiple?: number;
  readonly maximumOrderQuantity?: number;
  readonly reliabilityScore: number;
  readonly onTimeDeliveryScore: number;
  readonly qualityAcceptanceScore: number;
  readonly paymentTermsDays?: number;
}

export interface SupplierSelectionWeights {
  readonly cost?: number;
  readonly reliability?: number;
  readonly quality?: number;
  readonly leadTime?: number;
  readonly capacity?: number;
  readonly paymentTerms?: number;
}

export interface SupplierSelectionInput {
  readonly id: string;
  readonly skuId: string;
  readonly requestedUnits: number;
  readonly planningDate: string;
  readonly requiredByDate?: string;
  readonly budget: PurchaseBudget;
  readonly candidates: readonly SupplierCandidateInput[];
  readonly weights?: SupplierSelectionWeights;
  readonly generatedAt?: string;
}

export interface SupplierCandidateAssessment {
  readonly supplierId: string;
  readonly eligible: boolean;
  readonly blockers: readonly string[];
  readonly landedUnitCost: number;
  readonly executableUnits: number;
  readonly coverageRatio: number;
  readonly expectedSpend: number;
  readonly expectedReceiptDate: string;
  readonly lateByDays: number;
  readonly costScore: number;
  readonly reliabilityScore: number;
  readonly qualityScore: number;
  readonly leadTimeScore: number;
  readonly capacityScore: number;
  readonly paymentTermsScore: number;
  readonly totalScore: number;
  readonly riskScore: number;
}

export interface SupplierSelectionResult {
  readonly id: string;
  readonly skuId: string;
  readonly requestedUnits: number;
  readonly status: "not_required" | "selected" | "partial" | "blocked";
  readonly rankedCandidates: readonly SupplierCandidateAssessment[];
  readonly selected?: SupplierCandidateAssessment;
  readonly selectedTerms?: SupplierPurchaseTerms;
  readonly decision: CommercialDecision;
}

interface RawCandidateAssessment {
  readonly candidate: SupplierCandidateInput;
  readonly blockers: string[];
  readonly landedUnitCost: number;
  readonly executableUnits: number;
  readonly coverageRatio: number;
  readonly expectedSpend: number;
  readonly expectedReceiptDate: string;
  readonly lateByDays: number;
}

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

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function addUtcDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function dayDifference(left: Date, right: Date): number {
  return Math.ceil((left.getTime() - right.getTime()) / 86_400_000);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function roundUpToMultiple(quantity: number, multiple: number): number {
  if (quantity <= 0) return 0;
  return Math.ceil(quantity / multiple) * multiple;
}

function roundDownToMultiple(quantity: number, multiple: number): number {
  if (quantity <= 0) return 0;
  return Math.floor(quantity / multiple) * multiple;
}

function normalizedWeights(
  weights: SupplierSelectionWeights = {},
): Required<SupplierSelectionWeights> {
  const raw = {
    cost: Math.max(0, weights.cost ?? 0.3),
    reliability: Math.max(0, weights.reliability ?? 0.2),
    quality: Math.max(0, weights.quality ?? 0.15),
    leadTime: Math.max(0, weights.leadTime ?? 0.15),
    capacity: Math.max(0, weights.capacity ?? 0.15),
    paymentTerms: Math.max(0, weights.paymentTerms ?? 0.05),
  };
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return {
      cost: 1,
      reliability: 0,
      quality: 0,
      leadTime: 0,
      capacity: 0,
      paymentTerms: 0,
    };
  }
  return {
    cost: raw.cost / total,
    reliability: raw.reliability / total,
    quality: raw.quality / total,
    leadTime: raw.leadTime / total,
    capacity: raw.capacity / total,
    paymentTerms: raw.paymentTerms / total,
  };
}

function assessRawCandidate(
  candidate: SupplierCandidateInput,
  input: SupplierSelectionInput,
  planningDate: Date,
  requiredByDate?: Date,
): RawCandidateAssessment {
  assertFiniteNonNegative(candidate.unitCost, "Supplier unit cost");
  assertFiniteNonNegative(
    candidate.freightPerUnit ?? 0,
    "Supplier freight per unit",
  );
  assertFiniteNonNegative(candidate.dutyRate ?? 0, "Supplier duty rate");
  assertFiniteNonNegative(
    candidate.availableCapacityUnits,
    "Supplier available capacity units",
  );
  if (!Number.isInteger(candidate.leadTimeDays) || candidate.leadTimeDays < 0) {
    throw new Error("Supplier lead time days must be a non-negative integer.");
  }

  const minimumOrderQuantity = Math.max(
    1,
    Math.floor(candidate.minimumOrderQuantity ?? 1),
  );
  const orderMultiple = Math.max(1, Math.floor(candidate.orderMultiple ?? 1));
  const maximumOrderQuantity = Math.max(
    0,
    Math.floor(candidate.maximumOrderQuantity ?? Number.MAX_SAFE_INTEGER),
  );
  const blockers: string[] = [];
  if (!candidate.active) blockers.push("supplier_inactive");
  if (!candidate.approved) blockers.push("supplier_not_approved");
  if (candidate.currency !== input.budget.currency) {
    blockers.push("currency_mismatch");
  }

  const landedUnitCost =
    candidate.unitCost +
    (candidate.freightPerUnit ?? 0) +
    candidate.unitCost * (candidate.dutyRate ?? 0);
  const targetUnits = Math.min(
    roundUpToMultiple(
      Math.max(input.requestedUnits, minimumOrderQuantity),
      orderMultiple,
    ),
    maximumOrderQuantity,
  );
  const affordableUnits =
    landedUnitCost === 0
      ? targetUnits
      : Math.floor(input.budget.availableAmount / landedUnitCost);
  const executableUnits = roundDownToMultiple(
    Math.min(
      targetUnits,
      Math.floor(candidate.availableCapacityUnits),
      maximumOrderQuantity,
      affordableUnits,
    ),
    orderMultiple,
  );

  if (executableUnits < minimumOrderQuantity) {
    blockers.push("minimum_order_quantity_not_met");
  }
  if (executableUnits <= 0) blockers.push("no_executable_capacity");

  const expectedReceipt = addUtcDays(planningDate, candidate.leadTimeDays);
  const lateByDays = requiredByDate
    ? Math.max(0, dayDifference(expectedReceipt, requiredByDate))
    : 0;

  return {
    candidate,
    blockers,
    landedUnitCost,
    executableUnits,
    coverageRatio: Math.min(1, executableUnits / input.requestedUnits),
    expectedSpend: executableUnits * landedUnitCost,
    expectedReceiptDate: isoDate(expectedReceipt),
    lateByDays,
  };
}

function buildNotRequiredResult(
  input: SupplierSelectionInput,
  generatedAt: string,
): SupplierSelectionResult {
  const decision: CommercialDecision = {
    id: `supplier-selection:${input.id}`,
    entityType: "sku",
    entityId: input.skuId,
    decisionType: "supplier_selection",
    severity: "info",
    confidence: 1,
    reasons: [
      {
        code: "supplier.not_required",
        message:
          "Supplier selection is not required because the net purchase requirement is zero.",
      },
    ],
    impacts: [],
    actions: [
      {
        type: "none",
        priority: "info",
        title: "No supplier selection required",
        description:
          "Existing supply or open purchase orders already cover the requirement.",
      },
    ],
    createdAt: generatedAt,
    source: "supplier-intelligence-engine",
    version: 1,
  };

  return Object.freeze({
    id: input.id,
    skuId: input.skuId,
    requestedUnits: 0,
    status: "not_required",
    rankedCandidates: Object.freeze([] as SupplierCandidateAssessment[]),
    decision,
  });
}

export function selectSupplier(
  input: SupplierSelectionInput,
): SupplierSelectionResult {
  if (!input.id.trim()) throw new Error("Supplier selection id is required.");
  if (!input.skuId.trim()) throw new Error("Supplier selection SKU is required.");
  assertFiniteNonNegative(input.requestedUnits, "Requested units");
  assertFiniteNonNegative(input.budget.availableAmount, "Available budget");

  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (input.requestedUnits === 0) {
    return buildNotRequiredResult(input, generatedAt);
  }
  if (input.candidates.length === 0) {
    throw new Error("Supplier selection requires at least one candidate.");
  }

  const planningDate = parseDate(input.planningDate, "Planning date");
  const requiredByDate = input.requiredByDate
    ? parseDate(input.requiredByDate, "Required-by date")
    : undefined;
  const weights = normalizedWeights(input.weights);
  const raw = input.candidates.map((candidate) =>
    assessRawCandidate(candidate, input, planningDate, requiredByDate),
  );
  const eligibleRaw = raw.filter((candidate) => candidate.blockers.length === 0);
  const minimumCost = Math.min(
    ...eligibleRaw.map((candidate) => candidate.landedUnitCost),
  );
  const minimumLeadTime = Math.min(
    ...eligibleRaw.map((candidate) => candidate.candidate.leadTimeDays),
  );

  const rankedCandidates = raw
    .map<SupplierCandidateAssessment>((assessment) => {
      const candidate = assessment.candidate;
      const eligible = assessment.blockers.length === 0;
      const costScore =
        !eligible ||
        assessment.landedUnitCost <= 0 ||
        !Number.isFinite(minimumCost)
          ? eligible && assessment.landedUnitCost === 0
            ? 1
            : 0
          : minimumCost / assessment.landedUnitCost;
      const reliabilityScore = clamp01(
        (candidate.reliabilityScore + candidate.onTimeDeliveryScore) / 2,
      );
      const qualityScore = clamp01(candidate.qualityAcceptanceScore);
      const leadTimeScore =
        !eligible || !Number.isFinite(minimumLeadTime)
          ? 0
          : candidate.leadTimeDays === 0
            ? 1
            : Math.min(
                1,
                Math.max(0.1, minimumLeadTime / candidate.leadTimeDays),
              );
      const capacityScore = clamp01(assessment.coverageRatio);
      const paymentTermsScore = clamp01(
        (candidate.paymentTermsDays ?? 0) / 90,
      );
      const latenessPenalty = assessment.lateByDays > 0 ? 0.7 : 1;
      const totalScore = eligible
        ? (costScore * weights.cost +
            reliabilityScore * weights.reliability +
            qualityScore * weights.quality +
            leadTimeScore * weights.leadTime +
            capacityScore * weights.capacity +
            paymentTermsScore * weights.paymentTerms) *
          latenessPenalty
        : 0;
      const riskScore =
        1 -
        (reliabilityScore +
          qualityScore +
          clamp01(candidate.onTimeDeliveryScore)) /
          3;

      return {
        supplierId: candidate.supplierId,
        eligible,
        blockers: Object.freeze([...assessment.blockers]),
        landedUnitCost: round(assessment.landedUnitCost, 2),
        executableUnits: assessment.executableUnits,
        coverageRatio: round(assessment.coverageRatio),
        expectedSpend: round(assessment.expectedSpend, 2),
        expectedReceiptDate: assessment.expectedReceiptDate,
        lateByDays: assessment.lateByDays,
        costScore: round(costScore),
        reliabilityScore: round(reliabilityScore),
        qualityScore: round(qualityScore),
        leadTimeScore: round(leadTimeScore),
        capacityScore: round(capacityScore),
        paymentTermsScore: round(paymentTermsScore),
        totalScore: round(totalScore),
        riskScore: round(riskScore),
      };
    })
    .sort(
      (left, right) =>
        Number(right.eligible) - Number(left.eligible) ||
        right.totalScore - left.totalScore ||
        left.landedUnitCost - right.landedUnitCost ||
        left.supplierId.localeCompare(right.supplierId),
    );

  const selected = rankedCandidates.find((candidate) => candidate.eligible);
  const selectedInput = selected
    ? input.candidates.find(
        (candidate) => candidate.supplierId === selected.supplierId,
      )
    : undefined;
  const status: SupplierSelectionResult["status"] = !selected
    ? "blocked"
    : selected.coverageRatio < 1
      ? "partial"
      : "selected";
  const reasons: DecisionReason[] = [];

  if (selected) {
    reasons.push({
      code: "supplier.selected",
      message: `Supplier ${selected.supplierId} achieved the highest feasible commercial score.`,
      metric: "supplierScore",
      actual: selected.totalScore,
      threshold: 0,
      unit: "score",
    });
    if (selected.coverageRatio < 1) {
      reasons.push({
        code: "supplier.partial_coverage",
        message:
          "The selected supplier cannot cover the full requested quantity within current constraints.",
        metric: "coverageRatio",
        actual: selected.coverageRatio,
        threshold: 1,
        unit: "ratio",
      });
    }
  } else {
    reasons.push({
      code: "supplier.no_eligible_candidate",
      message:
        "No supplier satisfies approval, currency, MOQ, capacity, and budget constraints.",
    });
  }

  const selectedTerms: SupplierPurchaseTerms | undefined =
    selected && selectedInput
      ? {
          supplierId: selectedInput.supplierId,
          active: selectedInput.active,
          approved: selectedInput.approved,
          unitCost: selectedInput.unitCost,
          currency: selectedInput.currency,
          availableCapacityUnits: selected.executableUnits,
          minimumOrderValue:
            (selectedInput.minimumOrderQuantity ?? 0) * selectedInput.unitCost,
          maximumOrderValue:
            selectedInput.maximumOrderQuantity === undefined
              ? undefined
              : selectedInput.maximumOrderQuantity * selectedInput.unitCost,
          paymentTermsDays: selectedInput.paymentTermsDays,
        }
      : undefined;

  const decision: CommercialDecision = {
    id: `supplier-selection:${input.id}`,
    entityType: selected ? "supplier" : "sku",
    entityId: selected?.supplierId ?? input.skuId,
    decisionType: "supplier_selection",
    severity:
      status === "blocked"
        ? "critical"
        : status === "partial"
          ? "high"
          : "medium",
    confidence: selected
      ? clampConfidence(
          selected.totalScore * (status === "partial" ? 0.8 : 1),
        )
      : 0,
    reasons,
    impacts: selected
      ? [
          {
            metric: "expectedSpend",
            value: selected.expectedSpend,
            unit: input.budget.currency,
            direction: "increase",
          },
          {
            metric: "supplierRisk",
            value: selected.riskScore,
            unit: "score",
            direction: "decrease",
          },
        ]
      : [],
    actions: selected
      ? [
          {
            type: "select_supplier",
            priority: status === "partial" ? "high" : "medium",
            title: `Select supplier ${selected.supplierId}`,
            description:
              status === "partial"
                ? "Use the selected supplier for the executable quantity and source the remaining requirement separately."
                : "Use the highest-ranked feasible supplier for the purchase recommendation.",
            quantity: selected.executableUnits,
            metadata: {
              supplierId: selected.supplierId,
              totalScore: selected.totalScore,
              landedUnitCost: selected.landedUnitCost,
              expectedReceiptDate: selected.expectedReceiptDate,
            },
          },
        ]
      : [
          {
            type: "supplier_review",
            priority: "critical",
            title: "Resolve supplier constraints",
            description:
              "Approve a supplier, align currency, increase budget or capacity, or renegotiate MOQ.",
          },
        ],
    createdAt: generatedAt,
    source: "supplier-intelligence-engine",
    version: 1,
  };

  return Object.freeze({
    id: input.id,
    skuId: input.skuId,
    requestedUnits: input.requestedUnits,
    status,
    rankedCandidates: Object.freeze(rankedCandidates),
    selected,
    selectedTerms,
    decision,
  });
}
