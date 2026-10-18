import { clampConfidence } from "@/domain/decision/decision";

export type ForecastMethod =
  | "naive"
  | "moving_average"
  | "weighted_moving_average"
  | "linear_trend"
  | "seasonal_naive"
  | "ensemble";

export interface DemandObservation {
  date: string;
  units: number;
}

export interface DemandAdjustment {
  dayOffset: number;
  multiplier?: number;
  additiveUnits?: number;
  reason: string;
}

export interface DemandForecastInput {
  skuId: string;
  observations: DemandObservation[];
  horizonDays: number;
  seasonalityPeriod?: number;
  confidenceLevel?: number;
  adjustments?: DemandAdjustment[];
  forecastStartDate?: string;
  generatedAt?: string;
}

export interface ForecastCandidateScore {
  method: ForecastMethod;
  observations: number;
  mae: number;
  rmse: number;
  mape: number | null;
  wape: number | null;
  bias: number;
}

export interface DemandForecastPoint {
  date: string;
  baselineUnits: number;
  adjustedUnits: number;
  lowerUnits: number;
  upperUnits: number;
  appliedAdjustments: string[];
}

export interface DemandForecastDiagnostics {
  sampleSize: number;
  holdoutSize: number;
  selectedMethod: ForecastMethod;
  selectedScore: ForecastCandidateScore;
  candidateScores: ForecastCandidateScore[];
  residualStdDev: number;
  confidence: number;
  selectionReason: string;
}

export interface DemandForecastResult {
  skuId: string;
  generatedAt: string;
  forecastStartDate: string;
  horizonDays: number;
  method: ForecastMethod;
  totalUnits: number;
  averageDailyDemand: number;
  points: DemandForecastPoint[];
  diagnostics: DemandForecastDiagnostics;
}

export interface InventoryDemandProjection {
  averageDailyDemand: number;
  forecastDemandDuringLeadTime: number;
  forecastConfidence: number;
}

interface NormalizedObservation {
  date: string;
  units: number;
}

interface CandidateEvaluation extends ForecastCandidateScore {
  residuals: number[];
}

const round = (value: number, digits = 4): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const mean = (values: number[]): number =>
  values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const average = mean(values);
  const variance =
    values.reduce((total, value) => total + (value - average) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

function toDateKey(value: string): string {
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid observation date: ${value}`);
  }
  return date.toISOString().slice(0, 10);
}

function addUtcDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeObservations(
  observations: DemandObservation[],
): NormalizedObservation[] {
  const grouped = new Map<string, number>();

  for (const observation of observations) {
    const date = toDateKey(observation.date);
    const units = Number.isFinite(observation.units)
      ? Math.max(0, observation.units)
      : 0;
    grouped.set(date, (grouped.get(date) ?? 0) + units);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, units]) => ({ date, units }));
}

function predictNaive(history: number[]): number {
  return history.at(-1) ?? 0;
}

function predictMovingAverage(history: number[]): number {
  return mean(history.slice(-Math.min(7, history.length)));
}

function predictWeightedMovingAverage(history: number[]): number {
  const window = history.slice(-Math.min(7, history.length));
  const weightedTotal = window.reduce(
    (total, value, index) => total + value * (index + 1),
    0,
  );
  const weightTotal = window.reduce(
    (total, _value, index) => total + index + 1,
    0,
  );
  return weightTotal === 0 ? 0 : weightedTotal / weightTotal;
}

function predictLinearTrend(history: number[]): number {
  const window = history.slice(-Math.min(14, history.length));
  if (window.length < 2) return predictNaive(history);

  const xMean = (window.length - 1) / 2;
  const yMean = mean(window);
  let numerator = 0;
  let denominator = 0;

  for (let index = 0; index < window.length; index += 1) {
    numerator += (index - xMean) * (window[index] - yMean);
    denominator += (index - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;
  return Math.max(0, intercept + slope * window.length);
}

function predictSeasonalNaive(
  history: number[],
  seasonalityPeriod: number,
): number {
  if (seasonalityPeriod <= 0 || history.length < seasonalityPeriod) {
    return predictNaive(history);
  }
  return history[history.length - seasonalityPeriod] ?? predictNaive(history);
}

function availableMethods(
  historyLength: number,
  seasonalityPeriod: number,
): ForecastMethod[] {
  const methods: ForecastMethod[] = [
    "naive",
    "moving_average",
    "weighted_moving_average",
  ];
  if (historyLength >= 2) methods.push("linear_trend");
  if (seasonalityPeriod > 1 && historyLength >= seasonalityPeriod) {
    methods.push("seasonal_naive");
  }
  if (methods.length > 1) methods.push("ensemble");
  return methods;
}

function predictNext(
  history: number[],
  method: ForecastMethod,
  seasonalityPeriod: number,
): number {
  if (history.length === 0) return 0;

  if (method === "naive") return predictNaive(history);
  if (method === "moving_average") return predictMovingAverage(history);
  if (method === "weighted_moving_average") {
    return predictWeightedMovingAverage(history);
  }
  if (method === "linear_trend") return predictLinearTrend(history);
  if (method === "seasonal_naive") {
    return predictSeasonalNaive(history, seasonalityPeriod);
  }

  const componentMethods = availableMethods(
    history.length,
    seasonalityPeriod,
  ).filter((candidate) => candidate !== "ensemble");
  return mean(
    componentMethods.map((candidate) =>
      predictNext(history, candidate, seasonalityPeriod),
    ),
  );
}

function evaluateCandidate(
  values: number[],
  method: ForecastMethod,
  holdoutSize: number,
  seasonalityPeriod: number,
): CandidateEvaluation {
  const startIndex = Math.max(1, values.length - holdoutSize);
  const errors: number[] = [];
  const residuals: number[] = [];
  const actuals: number[] = [];

  for (let index = startIndex; index < values.length; index += 1) {
    const prediction = predictNext(
      values.slice(0, index),
      method,
      seasonalityPeriod,
    );
    const actual = values[index] ?? 0;
    const error = prediction - actual;
    errors.push(Math.abs(error));
    residuals.push(actual - prediction);
    actuals.push(actual);
  }

  const squaredErrors = residuals.map((value) => value ** 2);
  const nonZeroPercentageErrors = residuals
    .map((value, index) => {
      const actual = actuals[index] ?? 0;
      return actual === 0 ? null : Math.abs(value) / actual;
    })
    .filter((value): value is number => value !== null);
  const totalActual = actuals.reduce((total, value) => total + Math.abs(value), 0);
  const totalAbsoluteError = errors.reduce((total, value) => total + value, 0);

  return {
    method,
    observations: residuals.length,
    mae: round(mean(errors)),
    rmse: round(Math.sqrt(mean(squaredErrors))),
    mape:
      nonZeroPercentageErrors.length === 0
        ? null
        : round(mean(nonZeroPercentageErrors)),
    wape: totalActual === 0 ? null : round(totalAbsoluteError / totalActual),
    bias: round(mean(residuals)),
    residuals,
  };
}

function confidenceZScore(confidenceLevel: number): number {
  if (confidenceLevel >= 0.99) return 2.576;
  if (confidenceLevel >= 0.95) return 1.96;
  if (confidenceLevel >= 0.9) return 1.645;
  if (confidenceLevel >= 0.8) return 1.282;
  return 1;
}

function applyAdjustments(
  baselineUnits: number,
  dayOffset: number,
  adjustments: DemandAdjustment[],
): { units: number; reasons: string[] } {
  let units = baselineUnits;
  const reasons: string[] = [];

  for (const adjustment of adjustments) {
    if (adjustment.dayOffset !== dayOffset) continue;
    if (adjustment.multiplier !== undefined) {
      units *= Math.max(0, adjustment.multiplier);
    }
    if (adjustment.additiveUnits !== undefined) {
      units += adjustment.additiveUnits;
    }
    reasons.push(adjustment.reason);
  }

  return { units: Math.max(0, units), reasons };
}

function scoreSortValue(score: CandidateEvaluation): number {
  const wapePenalty = score.wape ?? 0;
  return score.mae + wapePenalty / 1000;
}

export function forecastDemand(
  input: DemandForecastInput,
): DemandForecastResult {
  const observations = normalizeObservations(input.observations);
  if (observations.length === 0) {
    throw new Error("Demand forecast requires at least one observation.");
  }

  const horizonDays = Math.max(1, Math.floor(input.horizonDays));
  const seasonalityPeriod = Math.max(
    1,
    Math.floor(input.seasonalityPeriod ?? 7),
  );
  const confidenceLevel = clamp(input.confidenceLevel ?? 0.8, 0.5, 0.99);
  const values = observations.map((observation) => observation.units);
  const holdoutSize = Math.min(
    Math.max(1, Math.floor(values.length * 0.25)),
    Math.max(1, values.length - 1),
    14,
  );

  const methods = availableMethods(values.length, seasonalityPeriod);
  const evaluations = methods.map((method) =>
    evaluateCandidate(values, method, holdoutSize, seasonalityPeriod),
  );
  evaluations.sort((left, right) => scoreSortValue(left) - scoreSortValue(right));
  const selected = evaluations[0];
  if (!selected) {
    throw new Error("Unable to evaluate demand forecast candidates.");
  }

  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const forecastStartDate = input.forecastStartDate
    ? toDateKey(input.forecastStartDate)
    : addUtcDays(observations.at(-1)?.date ?? generatedAt.slice(0, 10), 1);
  const residualStdDev = standardDeviation(selected.residuals);
  const uncertaintyFloor = Math.max(0.5, mean(values) * 0.05);
  const uncertaintyScale = Math.max(residualStdDev, uncertaintyFloor);
  const zScore = confidenceZScore(confidenceLevel);
  const recursiveHistory = [...values];
  const points: DemandForecastPoint[] = [];
  const adjustments = input.adjustments ?? [];

  for (let dayOffset = 0; dayOffset < horizonDays; dayOffset += 1) {
    const baselineUnits = Math.max(
      0,
      predictNext(recursiveHistory, selected.method, seasonalityPeriod),
    );
    const adjusted = applyAdjustments(
      baselineUnits,
      dayOffset,
      adjustments,
    );
    const intervalWidth =
      zScore *
      uncertaintyScale *
      Math.sqrt(1 + dayOffset / Math.max(1, values.length));

    points.push({
      date: addUtcDays(forecastStartDate, dayOffset),
      baselineUnits: round(baselineUnits),
      adjustedUnits: round(adjusted.units),
      lowerUnits: round(Math.max(0, adjusted.units - intervalWidth)),
      upperUnits: round(adjusted.units + intervalWidth),
      appliedAdjustments: adjusted.reasons,
    });
    recursiveHistory.push(baselineUnits);
  }

  const totalUnits = round(
    points.reduce((total, point) => total + point.adjustedUnits, 0),
  );
  const selectedWape = selected.wape ?? (selected.mae === 0 ? 0 : 1);
  const sampleConfidence = Math.min(1, values.length / 28);
  const forecastConfidence = clampConfidence(
    (1 - Math.min(1, selectedWape)) * sampleConfidence,
  );

  return {
    skuId: input.skuId,
    generatedAt,
    forecastStartDate,
    horizonDays,
    method: selected.method,
    totalUnits,
    averageDailyDemand: round(totalUnits / horizonDays),
    points,
    diagnostics: {
      sampleSize: values.length,
      holdoutSize,
      selectedMethod: selected.method,
      selectedScore: {
        method: selected.method,
        observations: selected.observations,
        mae: selected.mae,
        rmse: selected.rmse,
        mape: selected.mape,
        wape: selected.wape,
        bias: selected.bias,
      },
      candidateScores: evaluations.map((evaluation) => ({
        method: evaluation.method,
        observations: evaluation.observations,
        mae: evaluation.mae,
        rmse: evaluation.rmse,
        mape: evaluation.mape,
        wape: evaluation.wape,
        bias: evaluation.bias,
      })),
      residualStdDev: round(residualStdDev),
      confidence: round(forecastConfidence),
      selectionReason:
        "Selected the candidate with the lowest rolling holdout MAE, using WAPE as a tie-break signal.",
    },
  };
}

export function deriveInventoryDemandProjection(
  forecast: DemandForecastResult,
  leadTimeDays: number,
): InventoryDemandProjection {
  const boundedLeadTime = Math.max(0, Math.floor(leadTimeDays));
  const forecastDemandDuringLeadTime = round(
    forecast.points
      .slice(0, boundedLeadTime)
      .reduce((total, point) => total + point.adjustedUnits, 0),
  );

  return {
    averageDailyDemand: forecast.averageDailyDemand,
    forecastDemandDuringLeadTime,
    forecastConfidence: forecast.diagnostics.confidence,
  };
}
