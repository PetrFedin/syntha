import { findHandbookLeafById, resolveHandbookLeafId } from '@/lib/production/category-catalog';
import { assembleWorkshop2ArticleFromTaxonomy } from '@/lib/production/workshop2-article-assembler';
import {
  WORKSHOP2_BUDGET_PARAM,
  WORKSHOP2_MARGIN_PARAM,
  WORKSHOP2_TIER_PARAM,
} from '@/lib/production/workshop2-url';

export type RangePlannerTier = 'core' | 'trend' | 'novelty';

export type Workshop2RangePlannerPrefill = {
  tier: RangePlannerTier;
  budget?: number;
  targetMargin?: number;
  sku: string;
  name: string;
  comment: string;
  categoryLeafId: string;
  audienceId: string;
};

const TIER_DEFAULTS: Record<
  RangePlannerTier,
  { label: string; categoryLeafId: string; audienceId: string }
> = {
  core: { label: 'Core', categoryLeafId: 'catalog-apparel-g0-l0', audienceId: 'men' },
  trend: { label: 'Trend', categoryLeafId: 'catalog-apparel-g1-l0', audienceId: 'women' },
  novelty: { label: 'Novelty', categoryLeafId: 'catalog-apparel-g2-l0', audienceId: 'women' },
};

export function parseRangePlannerTier(raw: string | null | undefined): RangePlannerTier | null {
  const q = (raw ?? '').trim().toLowerCase();
  if (q === 'core' || q === 'trend' || q === 'novelty') return q;
  return null;
}

export function parseRangePlannerBudget(raw: string | null | undefined): number | undefined {
  const n = Number((raw ?? '').trim());
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

export function parseRangePlannerMargin(raw: string | null | undefined): number | undefined {
  const n = Number((raw ?? '').trim());
  return Number.isFinite(n) && n > 0 && n <= 100 ? Math.round(n) : undefined;
}

export function buildRangePlannerSku(collectionId: string, tier: RangePlannerTier): string {
  const col =
    collectionId
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') || 'SS27';
  const suffix = Date.now().toString(36).toUpperCase().slice(-5);
  return `RP-${col}-${tier.toUpperCase()}-${suffix}`;
}

export function buildRangePlannerArticlePrefill(input: {
  collectionId: string;
  tier: RangePlannerTier;
  budget?: number;
  targetMargin?: number;
  sku?: string;
}): Workshop2RangePlannerPrefill {
  const tier = input.tier;
  const defaults = TIER_DEFAULTS[tier];
  const collectionId = input.collectionId.trim() || 'SS27';
  const sku = input.sku?.trim() || buildRangePlannerSku(collectionId, tier);
  const budgetLine =
    input.budget != null ? ` · бюджет ${input.budget.toLocaleString('ru-RU')} ₽` : '';
  const marginLine = input.targetMargin != null ? ` · маржа ${input.targetMargin}%` : '';
  return {
    tier,
    budget: input.budget,
    targetMargin: input.targetMargin,
    sku,
    name: `Range · ${defaults.label} · ${collectionId}`,
    comment: `Создано из Range Planner (${defaults.label}${budgetLine}${marginLine}).`,
    categoryLeafId: defaults.categoryLeafId,
    audienceId: defaults.audienceId,
  };
}

export function parseRangePlannerPrefillFromSearchParams(
  params: Pick<URLSearchParams, 'get'>
): Workshop2RangePlannerPrefill | null {
  const tier = parseRangePlannerTier(params.get(WORKSHOP2_TIER_PARAM));
  if (!tier) return null;
  const collectionId = 'SS27';
  return buildRangePlannerArticlePrefill({
    collectionId,
    tier,
    budget: parseRangePlannerBudget(params.get(WORKSHOP2_BUDGET_PARAM)),
    targetMargin: parseRangePlannerMargin(params.get(WORKSHOP2_MARGIN_PARAM)),
  });
}

export function assembleRangePlannerArticle(input: {
  collectionId: string;
  tier: RangePlannerTier;
  budget?: number;
  targetMargin?: number;
  sku?: string;
  updatedBy?: string;
}) {
  const prefill = buildRangePlannerArticlePrefill(input);
  const leaf = findHandbookLeafById(prefill.categoryLeafId);
  if (!leaf) {
    return { ok: false as const, error: 'invalid_leaf' };
  }
  const assembly = assembleWorkshop2ArticleFromTaxonomy({
    categoryLeafId: prefill.categoryLeafId,
    audienceId: prefill.audienceId,
    sku: prefill.sku,
    name: prefill.name,
    updatedBy: input.updatedBy?.trim() || 'range-planner',
  });
  if (!assembly) {
    return { ok: false as const, error: 'assembly_failed' };
  }
  return {
    ok: true as const,
    prefill,
    assembly,
    articleId: prefill.sku,
  };
}

/** W2 hub dialog → PG commit (SS27 / golden collections). */
export function assembleWorkshop2HubDialogArticle(input: {
  collectionId: string;
  sku: string;
  categoryLeafId: string;
  name?: string;
  comment?: string;
  updatedBy?: string;
}) {
  const sku = input.sku.trim();
  const canonicalLeaf = resolveHandbookLeafId(input.categoryLeafId.trim());
  const leaf = findHandbookLeafById(canonicalLeaf);
  if (!leaf || !sku) {
    return { ok: false as const, error: 'invalid_input' as const };
  }
  const assembly = assembleWorkshop2ArticleFromTaxonomy({
    categoryLeafId: leaf.leafId,
    audienceId: leaf.audienceId,
    sku,
    name: input.name?.trim() || `Артикул · ${sku}`,
    updatedBy: input.updatedBy?.trim() || 'w2-hub',
  });
  if (!assembly) {
    return { ok: false as const, error: 'assembly_failed' as const };
  }
  const comment = input.comment?.trim();
  const dossier = comment ? { ...assembly.dossier, plannedLaunchNote: comment } : assembly.dossier;
  return {
    ok: true as const,
    assembly: { ...assembly, dossier },
    articleId: sku,
    sku,
    collectionId: input.collectionId.trim() || 'SS27',
  };
}
