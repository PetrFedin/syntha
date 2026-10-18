import type { DemandObservation } from "@/domain/forecast/demand-forecast-engine";
import {
  clampConfidence,
  type CommercialDecision,
  type DecisionReason,
} from "@/domain/decision/decision";

export type DataQualitySeverity =
  | "info"
  | "warning"
  | "error"
  | "critical";

export type DataQualityStatus = "pass" | "review" | "block";

export interface DataQualityIssue {
  readonly code: string;
  readonly severity: DataQualitySeverity;
  readonly field: string;
  readonly message: string;
  readonly value?: string | number;
}

export interface CommercialDataQualityInput {
  readonly id: string;
  readonly skuId: string;
  readonly warehouseId: string;
  readonly currency: string;
  readonly unitCost: number;
  readonly availableUnits: number;
  readonly reservedUnits: number;
  readonly inboundUnits: number;
  readonly daysSinceLastSale: number;
  readonly observations: readonly DemandObservation[];
  readonly asOfDate: string;
  readonly minimumScore?: number;
  readonly generatedAt?: string;
}

export interface CommercialDataQualityResult {
  readonly id: string;
  readonly skuId: string;
  readonly warehouseId: string;
  readonly status: DataQualityStatus;
  readonly score: number;
  readonly automationReady: boolean;
  readonly validObservationCount: number;
  readonly invalidObservationCount: number;
  readonly duplicateDateCount: number;
  readonly latestObservationDate?: string;
  readonly issues: readonly DataQualityIssue[];
  readonly decision: CommercialDecision;
}

const penaltyBySeverity: Record<DataQualitySeverity, number> = {
  info: 0,
  warning: 5,
  error: 15,
  critical: 35,
};

const severityRank: Record<DataQualitySeverity, number> = {
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

function parseDateKey(value: string): string | undefined {
  const timestamp = Date.parse(
    value.length === 10 ? `${value}T00:00:00.000Z` : value,
  );
  return Number.isNaN(timestamp)
    ? undefined
    : new Date(timestamp).toISOString().slice(0, 10);
}

function daysBetween(later: string, earlier: string): number {
  return Math.floor(
    (Date.parse(`${later}T00:00:00.000Z`) -
      Date.parse(`${earlier}T00:00:00.000Z`)) /
      86_400_000,
  );
}

function addIssue(
  issues: DataQualityIssue[],
  issue: DataQualityIssue,
): void {
  issues.push(Object.freeze(issue));
}

function validateNonNegativeMetric(
  issues: DataQualityIssue[],
  field: string,
  value: number,
): void {
  if (!Number.isFinite(value)) {
    addIssue(issues, {
      code: "data.non_finite",
      severity: "critical",
      field,
      message: `${field} must be a finite number.`,
      value: String(value),
    });
  } else if (value < 0) {
    addIssue(issues, {
      code: "data.negative_value",
      severity: "critical",
      field,
      message: `${field} cannot be negative.`,
      value,
    });
  }
}

function highestSeverity(
  issues: readonly DataQualityIssue[],
): DataQualitySeverity {
  return issues.reduce<DataQualitySeverity>(
    (highest, issue) =>
      severityRank[issue.severity] > severityRank[highest]
        ? issue.severity
        : highest,
    "info",
  );
}

export function assessCommercialDataQuality(
  input: CommercialDataQualityInput,
): CommercialDataQualityResult {
  if (!input.id.trim()) throw new Error("Data quality assessment id is required.");

  const issues: DataQualityIssue[] = [];
  if (!input.skuId.trim()) {
    addIssue(issues, {
      code: "data.missing_sku",
      severity: "critical",
      field: "skuId",
      message: "SKU id is required for commercial automation.",
    });
  }
  if (!input.warehouseId.trim()) {
    addIssue(issues, {
      code: "data.missing_warehouse",
      severity: "critical",
      field: "warehouseId",
      message: "Warehouse id is required for inventory decisions.",
    });
  }
  if (!/^[A-Z]{3}$/.test(input.currency)) {
    addIssue(issues, {
      code: "data.invalid_currency",
      severity: "error",
      field: "currency",
      message: "Currency must be a three-letter uppercase code.",
      value: input.currency,
    });
  }

  validateNonNegativeMetric(issues, "unitCost", input.unitCost);
  validateNonNegativeMetric(issues, "availableUnits", input.availableUnits);
  validateNonNegativeMetric(issues, "reservedUnits", input.reservedUnits);
  validateNonNegativeMetric(issues, "inboundUnits", input.inboundUnits);
  validateNonNegativeMetric(
    issues,
    "daysSinceLastSale",
    input.daysSinceLastSale,
  );
  if (input.unitCost === 0) {
    addIssue(issues, {
      code: "data.zero_unit_cost",
      severity: "warning",
      field: "unitCost",
      message:
        "Unit cost is zero; capital-at-risk and budget decisions may be understated.",
      value: 0,
    });
  }

  const asOfDate = parseDateKey(input.asOfDate);
  if (!asOfDate) {
    addIssue(issues, {
      code: "data.invalid_as_of_date",
      severity: "critical",
      field: "asOfDate",
      message: "The assessment date is invalid.",
      value: input.asOfDate,
    });
  }

  const dateCounts = new Map<string, number>();
  const validDates: string[] = [];
  let invalidObservationCount = 0;
  let nonZeroObservationCount = 0;

  for (const [index, observation] of input.observations.entries()) {
    const field = `observations[${index}]`;
    const date = parseDateKey(observation.date);
    if (!date) {
      invalidObservationCount += 1;
      addIssue(issues, {
        code: "data.invalid_observation_date",
        severity: "error",
        field: `${field}.date`,
        message: "Demand observation date is invalid.",
        value: observation.date,
      });
    } else {
      validDates.push(date);
      dateCounts.set(date, (dateCounts.get(date) ?? 0) + 1);
      if (asOfDate && date > asOfDate) {
        addIssue(issues, {
          code: "data.future_observation",
          severity: "error",
          field: `${field}.date`,
          message: "Demand history contains an observation after the as-of date.",
          value: date,
        });
      }
    }

    if (!Number.isFinite(observation.units) || observation.units < 0) {
      invalidObservationCount += 1;
      addIssue(issues, {
        code: "data.invalid_observation_units",
        severity: "critical",
        field: `${field}.units`,
        message: "Demand observation units must be finite and non-negative.",
        value: String(observation.units),
      });
    } else if (observation.units > 0) {
      nonZeroObservationCount += 1;
    }
  }

  const duplicateDateCount = [...dateCounts.values()].reduce(
    (total, count) => total + Math.max(0, count - 1),
    0,
  );
  if (duplicateDateCount > 0) {
    addIssue(issues, {
      code: "data.duplicate_observation_dates",
      severity: "warning",
      field: "observations",
      message:
        "Demand history contains duplicate dates; values will be aggregated but the source should be reconciled.",
      value: duplicateDateCount,
    });
  }

  const validObservationCount = Math.max(
    0,
    input.observations.length - invalidObservationCount,
  );
  if (input.observations.length === 0) {
    addIssue(issues, {
      code: "data.missing_demand_history",
      severity: "critical",
      field: "observations",
      message: "Demand forecasting requires historical observations.",
    });
  } else if (validObservationCount < 7) {
    addIssue(issues, {
      code: "data.insufficient_demand_history",
      severity: "error",
      field: "observations",
      message: "Fewer than seven valid observations materially weaken forecasting.",
      value: validObservationCount,
    });
  } else if (validObservationCount < 14) {
    addIssue(issues, {
      code: "data.limited_demand_history",
      severity: "warning",
      field: "observations",
      message: "Fewer than fourteen valid observations limit forecast reliability.",
      value: validObservationCount,
    });
  }

  if (input.observations.length > 0 && nonZeroObservationCount === 0) {
    addIssue(issues, {
      code: "data.all_zero_demand",
      severity: "warning",
      field: "observations",
      message:
        "All demand observations are zero; confirm the SKU launch date, availability and sales-feed coverage.",
    });
  }

  const latestObservationDate = validDates.sort().at(-1);
  if (asOfDate && latestObservationDate) {
    const stalenessDays = daysBetween(asOfDate, latestObservationDate);
    if (stalenessDays > 30) {
      addIssue(issues, {
        code: "data.stale_demand_history",
        severity: "critical",
        field: "observations",
        message: "Demand history is more than 30 days out of date.",
        value: stalenessDays,
      });
    } else if (stalenessDays > 14) {
      addIssue(issues, {
        code: "data.aging_demand_history",
        severity: "error",
        field: "observations",
        message: "Demand history is more than 14 days out of date.",
        value: stalenessDays,
      });
    }
  }

  const score = clamp(
    100 -
      issues.reduce(
        (total, issue) => total + penaltyBySeverity[issue.severity],
        0,
      ),
    0,
    100,
  );
  const minimumScore = clamp(input.minimumScore ?? 75, 0, 100);
  const maximumSeverity = highestSeverity(issues);
  const status: DataQualityStatus =
    maximumSeverity === "critical" || score < 50
      ? "block"
      : issues.length > 0 || score < minimumScore
        ? "review"
        : "pass";
  const automationReady = status === "pass";
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const reasons: DecisionReason[] =
    issues.length === 0
      ? [
          {
            code: "data.quality_passed",
            message: "Commercial data passed all configured quality checks.",
          },
        ]
      : issues.map((issue) => ({
          code: issue.code,
          message: issue.message,
        }));
  const decision: CommercialDecision = {
    id: `data-quality:${input.id}`,
    entityType: "sku",
    entityId: input.skuId || "unknown-sku",
    decisionType: "commercial_data_quality",
    severity:
      status === "block" ? "critical" : status === "review" ? "high" : "info",
    confidence: clampConfidence(score / 100),
    reasons,
    impacts: [
      {
        metric: "dataQualityScore",
        value: score,
        unit: "score",
        direction: "increase",
      },
      {
        metric: "invalidObservationCount",
        value: invalidObservationCount,
        unit: "observations",
        direction: invalidObservationCount > 0 ? "decrease" : "neutral",
      },
    ],
    actions:
      status === "pass"
        ? [
            {
              type: "none",
              priority: "info",
              title: "Use validated commercial data",
              description:
                "The dataset is suitable for forecasting and replenishment automation.",
            },
          ]
        : [
            {
              type: "repair_data",
              priority: status === "block" ? "critical" : "high",
              title: "Repair commercial data",
              description:
                status === "block"
                  ? "Correct critical data issues before running automated commercial decisions."
                  : "Review and reconcile data-quality warnings before automatic execution.",
              metadata: {
                issueCount: issues.length,
                score,
                blocking: status === "block",
              },
            },
            {
              type: "review",
              priority: status === "block" ? "critical" : "high",
              title: "Review data quality exceptions",
              description:
                "Validate the source records and approve the dataset after remediation.",
            },
          ],
    createdAt: generatedAt,
    source: "commercial-data-quality-engine",
    version: 1,
  };

  return Object.freeze({
    id: input.id,
    skuId: input.skuId,
    warehouseId: input.warehouseId,
    status,
    score,
    automationReady,
    validObservationCount,
    invalidObservationCount,
    duplicateDateCount,
    latestObservationDate,
    issues: Object.freeze(issues),
    decision,
  });
}
