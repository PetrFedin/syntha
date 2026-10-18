export type AbcClass = "A" | "B" | "C";
export type XyzClass = "X" | "Y" | "Z";
export type AbcXyzSegment = `${AbcClass}${XyzClass}`;

export interface AbcXyzItemInput {
  skuId: string;
  contributionValue: number;
  demandHistory: number[];
}

export interface AbcXyzConfig {
  aCumulativeThreshold?: number;
  bCumulativeThreshold?: number;
  xCoefficientVariationThreshold?: number;
  yCoefficientVariationThreshold?: number;
}

export interface InventoryPolicyRecommendation {
  serviceLevelTarget: number;
  reviewCadence: "daily" | "weekly" | "monthly";
  replenishmentMode:
    | "continuous"
    | "periodic"
    | "forecast_driven"
    | "manual_review"
    | "do_not_replenish";
  priority: "critical" | "high" | "medium" | "low";
}

export interface AbcXyzClassification {
  skuId: string;
  rank: number;
  contributionValue: number;
  contributionShare: number;
  cumulativeContributionShare: number;
  averageDemand: number;
  demandStandardDeviation: number;
  coefficientOfVariation: number | null;
  abcClass: AbcClass;
  xyzClass: XyzClass;
  segment: AbcXyzSegment;
  policy: InventoryPolicyRecommendation;
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

function populationStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const average = mean(values);
  const variance =
    values.reduce((total, value) => total + (value - average) ** 2, 0) /
    values.length;
  return Math.sqrt(variance);
}

function abcClassFromShare(
  cumulativeShareBeforeItem: number,
  aThreshold: number,
  bThreshold: number,
): AbcClass {
  if (cumulativeShareBeforeItem < aThreshold) return "A";
  if (cumulativeShareBeforeItem < bThreshold) return "B";
  return "C";
}

function xyzClassFromVariation(
  coefficientOfVariation: number | null,
  xThreshold: number,
  yThreshold: number,
): XyzClass {
  if (coefficientOfVariation === null) return "Z";
  if (coefficientOfVariation <= xThreshold) return "X";
  if (coefficientOfVariation <= yThreshold) return "Y";
  return "Z";
}

const policies: Record<AbcXyzSegment, InventoryPolicyRecommendation> = {
  AX: {
    serviceLevelTarget: 0.98,
    reviewCadence: "daily",
    replenishmentMode: "continuous",
    priority: "critical",
  },
  AY: {
    serviceLevelTarget: 0.96,
    reviewCadence: "daily",
    replenishmentMode: "forecast_driven",
    priority: "critical",
  },
  AZ: {
    serviceLevelTarget: 0.92,
    reviewCadence: "daily",
    replenishmentMode: "manual_review",
    priority: "high",
  },
  BX: {
    serviceLevelTarget: 0.95,
    reviewCadence: "weekly",
    replenishmentMode: "continuous",
    priority: "high",
  },
  BY: {
    serviceLevelTarget: 0.92,
    reviewCadence: "weekly",
    replenishmentMode: "periodic",
    priority: "medium",
  },
  BZ: {
    serviceLevelTarget: 0.85,
    reviewCadence: "weekly",
    replenishmentMode: "manual_review",
    priority: "medium",
  },
  CX: {
    serviceLevelTarget: 0.9,
    reviewCadence: "monthly",
    replenishmentMode: "periodic",
    priority: "medium",
  },
  CY: {
    serviceLevelTarget: 0.82,
    reviewCadence: "monthly",
    replenishmentMode: "manual_review",
    priority: "low",
  },
  CZ: {
    serviceLevelTarget: 0.7,
    reviewCadence: "monthly",
    replenishmentMode: "do_not_replenish",
    priority: "low",
  },
};

export function classifyAbcXyz(
  items: AbcXyzItemInput[],
  config: AbcXyzConfig = {},
): AbcXyzClassification[] {
  const aThreshold = clamp(config.aCumulativeThreshold ?? 0.8, 0, 1);
  const bThreshold = clamp(
    Math.max(config.bCumulativeThreshold ?? 0.95, aThreshold),
    0,
    1,
  );
  const xThreshold = Math.max(
    0,
    config.xCoefficientVariationThreshold ?? 0.5,
  );
  const yThreshold = Math.max(
    xThreshold,
    config.yCoefficientVariationThreshold ?? 1,
  );

  const seenSkuIds = new Set<string>();
  const normalized = items.map((item) => {
    if (seenSkuIds.has(item.skuId)) {
      throw new Error(`Duplicate SKU in ABC/XYZ input: ${item.skuId}`);
    }
    seenSkuIds.add(item.skuId);
    return {
      ...item,
      contributionValue: Number.isFinite(item.contributionValue)
        ? Math.max(0, item.contributionValue)
        : 0,
      demandHistory: item.demandHistory.map((value) =>
        Number.isFinite(value) ? Math.max(0, value) : 0,
      ),
    };
  });

  normalized.sort(
    (left, right) =>
      right.contributionValue - left.contributionValue ||
      left.skuId.localeCompare(right.skuId),
  );

  const totalContribution = normalized.reduce(
    (total, item) => total + item.contributionValue,
    0,
  );
  let cumulativeContribution = 0;

  return normalized.map((item, index) => {
    const contributionShare =
      totalContribution === 0
        ? 0
        : item.contributionValue / totalContribution;
    const cumulativeShareBeforeItem =
      totalContribution === 0
        ? 1
        : cumulativeContribution / totalContribution;
    cumulativeContribution += item.contributionValue;
    const cumulativeContributionShare =
      totalContribution === 0
        ? 0
        : cumulativeContribution / totalContribution;

    const averageDemand = mean(item.demandHistory);
    const demandStandardDeviation = populationStandardDeviation(
      item.demandHistory,
    );
    const coefficientOfVariation =
      averageDemand === 0
        ? null
        : demandStandardDeviation / averageDemand;
    const abcClass =
      totalContribution === 0
        ? "C"
        : abcClassFromShare(
            cumulativeShareBeforeItem,
            aThreshold,
            bThreshold,
          );
    const xyzClass = xyzClassFromVariation(
      coefficientOfVariation,
      xThreshold,
      yThreshold,
    );
    const segment = `${abcClass}${xyzClass}` as AbcXyzSegment;

    return {
      skuId: item.skuId,
      rank: index + 1,
      contributionValue: round(item.contributionValue, 2),
      contributionShare: round(contributionShare),
      cumulativeContributionShare: round(cumulativeContributionShare),
      averageDemand: round(averageDemand),
      demandStandardDeviation: round(demandStandardDeviation),
      coefficientOfVariation:
        coefficientOfVariation === null
          ? null
          : round(coefficientOfVariation),
      abcClass,
      xyzClass,
      segment,
      policy: policies[segment],
    };
  });
}
