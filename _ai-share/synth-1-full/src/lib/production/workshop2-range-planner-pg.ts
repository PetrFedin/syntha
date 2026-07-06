import {
  parseRangePlannerTier,
  type RangePlannerTier,
} from '@/lib/production/workshop2-range-planner-bridge';

export type RangePlannerPgTierRow = {
  id: RangePlannerTier;
  labelRu: string;
  descRu: string;
  targetMargin: number;
  budget: number;
  planSkuCount: number;
  /** Фактическое число артикулов в PG с меткой tier. */
  pgSkuCount: number;
  /** Бюджет и маржа взяты из PG metadata или dossier hints (не демо). */
  budgetFromPg?: boolean;
};

export type RangePlannerUnassignedArticle = {
  articleId: string;
  sku?: string;
  name?: string;
};

export type RangePlannerTierArticles = Record<RangePlannerTier, RangePlannerUnassignedArticle[]>;

export type RangePlannerPgSnapshot = {
  collectionId: string;
  articleCount: number;
  tiers: RangePlannerPgTierRow[];
  unassignedSkuCount: number;
  /** Артикулы без tier-метки (для UI переноса). */
  unassignedArticles: RangePlannerUnassignedArticle[];
  /** Артикулы по tier-колонкам (для drag-reorder UI). */
  tierArticles: RangePlannerTierArticles;
  /** `pg` — состав, tier и бюджеты/маржа из PostgreSQL; `partial` — PG count + демо бюджеты/план. */
  dataSource: 'pg' | 'partial' | 'mock';
  /** Tier-разбивка (pgSkuCount) из PostgreSQL. */
  tiersFromPg: boolean;
  /** Все tier имеют бюджет и маржу из PG metadata или dossier hints. */
  budgetFromPg: boolean;
};

export type RangePlannerCollectionMetadataTier = {
  id: RangePlannerTier;
  budget?: number;
  targetMargin?: number;
  planSkuCount?: number;
};

export type RangePlannerCollectionMetadata = {
  tiers: RangePlannerCollectionMetadataTier[];
  /** Порядок артикулов внутри tier (metadata.rangePlanner.tierArticleOrder). */
  tierArticleOrder?: Partial<Record<RangePlannerTier, string[]>>;
};

export const RANGE_PLANNER_DEMO_TIERS: ReadonlyArray<{
  id: RangePlannerTier;
  labelRu: string;
  descRu: string;
  targetMargin: number;
  budget: number;
  planSkuCount: number;
  categoryLeafId: string;
}> = [
  {
    id: 'core',
    labelRu: 'Базовый',
    descRu: 'Базовый ассортимент',
    targetMargin: 42,
    budget: 1_200_000,
    planSkuCount: 24,
    categoryLeafId: 'catalog-apparel-g0-l0',
  },
  {
    id: 'trend',
    labelRu: 'Тренд',
    descRu: 'Трендовые модели',
    targetMargin: 38,
    budget: 800_000,
    planSkuCount: 16,
    categoryLeafId: 'catalog-apparel-g1-l0',
  },
  {
    id: 'novelty',
    labelRu: 'Новинки',
    descRu: 'Экспериментальные SKU',
    targetMargin: 35,
    budget: 400_000,
    planSkuCount: 8,
    categoryLeafId: 'catalog-apparel-g2-l0',
  },
];

const TIER_CATEGORY_LEAF = new Map(
  RANGE_PLANNER_DEMO_TIERS.map((row) => [row.categoryLeafId, row.id] as const)
);

export type RangePlannerArticleHints = {
  articleId: string;
  sku?: string;
  name?: string;
  categoryLeafId?: string;
  comment?: string;
};

export type RangePlannerBudgetMarginHints = {
  budget?: number;
  targetMargin?: number;
};

function parsePositiveInt(raw: string): number | undefined {
  const digits = raw.replace(/\s/g, '');
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

export function extractRangePlannerBudgetMarginFromText(
  text: string
): RangePlannerBudgetMarginHints {
  const budgetMatch = text.match(/бюджет\s+([\d\s]+)\s*₽/i);
  const marginMatch = text.match(/маржа\s+(\d{1,3})\s*%/i);
  return {
    budget: budgetMatch ? parsePositiveInt(budgetMatch[1]) : undefined,
    targetMargin: marginMatch ? parsePositiveInt(marginMatch[1]) : undefined,
  };
}

export function parseRangePlannerCollectionMetadata(
  metadata: unknown
): RangePlannerCollectionMetadata | null {
  const root = metadata as { rangePlanner?: { tiers?: unknown[] } } | null;
  const rawTiers = root?.rangePlanner?.tiers;
  if (!Array.isArray(rawTiers) || rawTiers.length === 0) return null;

  const tiers: RangePlannerCollectionMetadataTier[] = [];
  for (const raw of rawTiers) {
    const row = raw as {
      id?: string;
      budget?: number;
      targetMargin?: number;
      planSkuCount?: number;
    };
    const id = parseRangePlannerTier(row.id);
    if (!id) continue;
    tiers.push({
      id,
      budget:
        typeof row.budget === 'number' && row.budget > 0 ? Math.round(row.budget) : undefined,
      targetMargin:
        typeof row.targetMargin === 'number' &&
        row.targetMargin > 0 &&
        row.targetMargin <= 100
          ? Math.round(row.targetMargin)
          : undefined,
      planSkuCount:
        typeof row.planSkuCount === 'number' && row.planSkuCount > 0
          ? Math.round(row.planSkuCount)
          : undefined,
    });
  }
  return tiers.length > 0 ? { tiers } : null;
}

/** Порядок артикулов внутри tier из metadata.rangePlanner.tierArticleOrder. */
export function parseRangePlannerTierArticleOrder(
  metadata: unknown
): Partial<Record<RangePlannerTier, string[]>> | null {
  const root = metadata as { rangePlanner?: { tierArticleOrder?: unknown } } | null;
  const raw = root?.rangePlanner?.tierArticleOrder;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out: Partial<Record<RangePlannerTier, string[]>> = {};
  for (const key of ['core', 'trend', 'novelty'] as const) {
    const ids = (raw as Record<string, unknown>)[key];
    if (!Array.isArray(ids)) continue;
    const cleaned = ids.map((id) => String(id).trim()).filter(Boolean);
    if (cleaned.length > 0) out[key] = cleaned;
  }
  return Object.keys(out).length > 0 ? out : null;
}

export function parseRangePlannerCollectionMetadataFull(
  metadata: unknown
): RangePlannerCollectionMetadata | null {
  const tiers = parseRangePlannerCollectionMetadata(metadata);
  if (!tiers) return null;
  const tierArticleOrder = parseRangePlannerTierArticleOrder(metadata) ?? undefined;
  return tierArticleOrder ? { ...tiers, tierArticleOrder } : tiers;
}

/** Сортировка артикулов tier: сохранённый порядок → остаток по articleId. */
export function sortRangePlannerTierArticles(
  articles: readonly RangePlannerUnassignedArticle[],
  orderedIds?: readonly string[] | null
): RangePlannerUnassignedArticle[] {
  if (!orderedIds?.length) {
    return [...articles].sort((a, b) => a.articleId.localeCompare(b.articleId));
  }
  const byId = new Map(articles.map((row) => [row.articleId, row] as const));
  const sorted: RangePlannerUnassignedArticle[] = [];
  for (const id of orderedIds) {
    const row = byId.get(id);
    if (row) {
      sorted.push(row);
      byId.delete(id);
    }
  }
  const remainder = [...byId.values()].sort((a, b) => a.articleId.localeCompare(b.articleId));
  return [...sorted, ...remainder];
}

export function aggregateTierBudgetMarginFromHints(
  tierHints: readonly RangePlannerArticleHints[]
): Partial<
  Record<RangePlannerTier, { budget?: number; targetMargin?: number; planSkuCount?: number }>
> {
  const out: Partial<
    Record<RangePlannerTier, { budget?: number; targetMargin?: number; planSkuCount?: number }>
  > = {};
  for (const hints of tierHints) {
    const tier = inferRangePlannerTierFromHints(hints);
    if (!tier) continue;
    const text = `${hints.name ?? ''} ${hints.comment ?? ''}`.trim();
    if (!text) continue;
    const { budget, targetMargin } = extractRangePlannerBudgetMarginFromText(text);
    if (!out[tier]) out[tier] = {};
    if (budget != null && out[tier]!.budget == null) out[tier]!.budget = budget;
    if (targetMargin != null && out[tier]!.targetMargin == null) {
      out[tier]!.targetMargin = targetMargin;
    }
  }
  return out;
}

function tierBudgetMarginFromPgSources(
  meta: RangePlannerCollectionMetadataTier | undefined,
  hints: { budget?: number; targetMargin?: number } | undefined
): { budget?: number; targetMargin?: number; planSkuCount?: number; fromPg: boolean } {
  const budget = meta?.budget ?? hints?.budget;
  const targetMargin = meta?.targetMargin ?? hints?.targetMargin;
  const planSkuCount = meta?.planSkuCount;
  const fromPg =
    budget != null &&
    targetMargin != null &&
    (meta?.budget != null || hints?.budget != null) &&
    (meta?.targetMargin != null || hints?.targetMargin != null);
  return { budget, targetMargin, planSkuCount, fromPg };
}

export function inferRangePlannerTierFromHints(
  hints: RangePlannerArticleHints
): RangePlannerTier | null {
  const sku = (hints.sku ?? hints.articleId).toUpperCase();
  const tierFromSku = sku.match(/RP-[A-Z0-9]+-(CORE|TREND|NOVELTY)-/i)?.[1]?.toLowerCase();
  if (tierFromSku === 'core' || tierFromSku === 'trend' || tierFromSku === 'novelty') {
    return tierFromSku;
  }

  const text = `${hints.name ?? ''} ${hints.comment ?? ''}`;
  const tierFromName = text.match(/Range\s*[·•]\s*(Core|Trend|Novelty)/i)?.[1]?.toLowerCase();
  if (tierFromName === 'core' || tierFromName === 'trend' || tierFromName === 'novelty') {
    return tierFromName;
  }
  const tierFromComment = text.match(/Range Planner\s*\((Core|Trend|Novelty)/i)?.[1]?.toLowerCase();
  if (tierFromComment === 'core' || tierFromComment === 'trend' || tierFromComment === 'novelty') {
    return tierFromComment;
  }

  const leaf = hints.categoryLeafId?.trim();
  if (leaf && TIER_CATEGORY_LEAF.has(leaf)) {
    return TIER_CATEGORY_LEAF.get(leaf)!;
  }
  return null;
}

export function countRangePlannerTiersFromHints(articles: readonly RangePlannerArticleHints[]): {
  counts: Record<RangePlannerTier, number>;
  unassigned: number;
} {
  const counts: Record<RangePlannerTier, number> = { core: 0, trend: 0, novelty: 0 };
  let unassigned = 0;
  for (const hints of articles) {
    const tier = inferRangePlannerTierFromHints(hints);
    if (tier) counts[tier] += 1;
    else unassigned += 1;
  }
  return { counts, unassigned };
}

export function buildRangePlannerPgSnapshot(input: {
  collectionId: string;
  articleCount: number;
  pgEnabled: boolean;
  tierHints: readonly RangePlannerArticleHints[];
  collectionMeta?: RangePlannerCollectionMetadata | null;
}): RangePlannerPgSnapshot {
  const { counts, unassigned } = countRangePlannerTiersFromHints(input.tierHints);
  const hasPgArticles = input.pgEnabled && input.articleCount > 0;
  const hintBudgets = aggregateTierBudgetMarginFromHints(input.tierHints);
  const metaByTier = new Map(
    (input.collectionMeta?.tiers ?? []).map((row) => [row.id, row] as const)
  );

  let allTiersHavePgBudget = true;
  const tiers = RANGE_PLANNER_DEMO_TIERS.map((row) => {
    const resolved = tierBudgetMarginFromPgSources(metaByTier.get(row.id), hintBudgets[row.id]);
    if (!resolved.fromPg) allTiersHavePgBudget = false;
    return {
      id: row.id,
      labelRu: row.labelRu,
      descRu: row.descRu,
      targetMargin: resolved.targetMargin ?? row.targetMargin,
      budget: resolved.budget ?? row.budget,
      planSkuCount: resolved.planSkuCount ?? row.planSkuCount,
      pgSkuCount: counts[row.id],
      ...(resolved.fromPg ? { budgetFromPg: true as const } : {}),
    };
  });

  const tiersFromPg = hasPgArticles;
  const budgetFromPg = hasPgArticles && allTiersHavePgBudget;
  const dataSource: RangePlannerPgSnapshot['dataSource'] = !hasPgArticles
    ? 'mock'
    : budgetFromPg
      ? 'pg'
      : 'partial';

  const unassignedArticles: RangePlannerUnassignedArticle[] = input.tierHints
    .filter((h) => !inferRangePlannerTierFromHints(h))
    .map((h) => ({
      articleId: h.articleId,
      sku: h.sku,
      name: h.name,
    }));

  const tierArticles: RangePlannerTierArticles = { core: [], trend: [], novelty: [] };
  for (const hints of input.tierHints) {
    const tier = inferRangePlannerTierFromHints(hints);
    if (!tier) continue;
    tierArticles[tier].push({
      articleId: hints.articleId,
      sku: hints.sku,
      name: hints.name,
    });
  }
  for (const row of RANGE_PLANNER_DEMO_TIERS) {
    tierArticles[row.id] = sortRangePlannerTierArticles(
      tierArticles[row.id],
      input.collectionMeta?.tierArticleOrder?.[row.id]
    );
  }

  return {
    collectionId: input.collectionId,
    articleCount: input.articleCount,
    unassignedSkuCount: unassigned,
    unassignedArticles,
    tierArticles,
    dataSource,
    tiersFromPg,
    budgetFromPg,
    tiers,
  };
}

export function rangePlannerPgDisclaimerRu(snapshot: RangePlannerPgSnapshot): string {
  if (snapshot.dataSource === 'mock') {
    return 'Состав коллекции и уровни ассортимента недоступны — проверьте подключение к базе данных или выберите коллекцию с артикулами.';
  }
  if (snapshot.dataSource === 'pg') {
    const unassigned =
      snapshot.unassignedSkuCount > 0
        ? ` Без tier-метки: ${snapshot.unassignedSkuCount}.`
        : '';
    return `Состав коллекции (${snapshot.articleCount}), tier-разбивка, бюджеты и целевая маржа — из PostgreSQL.${unassigned}`;
  }
  if (snapshot.unassignedSkuCount > 0) {
    return `Артикулы (${snapshot.articleCount}) и tier — из PostgreSQL; бюджеты и маржа пока не в PG. Без tier-метки: ${snapshot.unassignedSkuCount}.`;
  }
  return `Артикулы (${snapshot.articleCount}) и tier — из PostgreSQL; бюджеты и целевая маржа пока не в PG.`;
}

export function extractRangePlannerHintsFromDossierJson(
  articleId: string,
  dossierJson: unknown
): RangePlannerArticleHints {
  const d = dossierJson as {
    articleFormMirror?: { sku?: string; categoryLeafId?: string };
    finalTzDocumentExportMeta?: { articleSkuSnapshot?: string; articleNameSnapshot?: string };
    optionalNote?: string;
  } | null;
  if (!d) return { articleId };
  return {
    articleId,
    sku: d.articleFormMirror?.sku ?? d.finalTzDocumentExportMeta?.articleSkuSnapshot,
    name: d.finalTzDocumentExportMeta?.articleNameSnapshot,
    categoryLeafId: d.articleFormMirror?.categoryLeafId,
    comment: d.optionalNote,
  };
}

export type DevelopmentStatusRangePlannerPayload = {
  articleCount?: number;
  rangePlanner?: RangePlannerPgSnapshot;
};

export function parseDevelopmentStatusRangePlanner(
  status: DevelopmentStatusRangePlannerPayload | null | undefined,
  collectionId: string,
  pgEnabled: boolean
): RangePlannerPgSnapshot {
  if (status?.rangePlanner) return status.rangePlanner;
  const articleCount = typeof status?.articleCount === 'number' ? status.articleCount : 0;
  return buildRangePlannerPgSnapshot({
    collectionId,
    articleCount,
    pgEnabled,
    tierHints: [],
  });
}
