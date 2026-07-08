import 'server-only';

import {
  parseRangePlannerTier,
  type RangePlannerTier,
} from '@/lib/production/workshop2-range-planner-bridge';
import { RANGE_PLANNER_DEMO_TIERS } from '@/lib/production/workshop2-range-planner-pg';
import { getWorkshop2CoreCollectionRangePlannerMetadataRaw } from '@/lib/production/workshop2-core-collection-range-planner-metadata';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';

type TierRow = {
  id: string;
  budget?: number;
  targetMargin?: number;
  planSkuCount?: number;
};

function seedTiersFromFallback(collectionId: string): TierRow[] {
  const raw = getWorkshop2CoreCollectionRangePlannerMetadataRaw(collectionId);
  return raw?.rangePlanner?.tiers.map((t) => ({ ...t })) ?? [];
}

function readMetadataTiers(metadata: unknown): TierRow[] {
  const root = metadata as { rangePlanner?: { tiers?: TierRow[] } } | null;
  const tiers = root?.rangePlanner?.tiers;
  return Array.isArray(tiers) ? tiers.map((t) => ({ ...t })) : [];
}

/** PATCH tier budget/margin в `workshop2_collections.metadata.rangePlanner`. */
export async function patchWorkshop2CollectionRangePlannerTier(input: {
  collectionId: string;
  tier: string;
  budget?: number;
  targetMargin?: number;
}): Promise<{ ok: true } | { ok: false; error: string; messageRu?: string }> {
  const collectionId = input.collectionId.trim();
  const tier = parseRangePlannerTier(input.tier);
  if (!collectionId) {
    return { ok: false, error: 'missing_collection', messageRu: 'Не указана коллекция.' };
  }
  if (!tier) {
    return { ok: false, error: 'invalid_tier', messageRu: 'Уровень: core, trend или novelty.' };
  }
  if (input.budget == null && input.targetMargin == null) {
    return { ok: false, error: 'empty_patch', messageRu: 'Укажите бюджет или маржу.' };
  }
  if (!isWorkshop2PostgresEnabled()) {
    return {
      ok: false,
      error: 'pg_disabled',
      messageRu: 'План коллекции доступен только при подключении к базе данных.',
    };
  }

  await ensureWorkshop2PgSchema();
  const pool = getWorkshop2PgPool();
  const res = await pool.query<{ metadata: unknown }>(
    `SELECT metadata FROM workshop2_collections WHERE id = $1`,
    [collectionId]
  );

  let metadata: Record<string, unknown> = {};
  const existing = res.rows[0]?.metadata;
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    metadata = { ...(existing as Record<string, unknown>) };
  }

  let tiers = readMetadataTiers(metadata);
  if (tiers.length === 0) tiers = seedTiersFromFallback(collectionId);

  let idx = tiers.findIndex((t) => t.id === tier);
  if (idx < 0) {
    tiers.push({ id: tier });
    idx = tiers.length - 1;
  }

  const row = { ...tiers[idx] };
  if (typeof input.budget === 'number') {
    if (!Number.isFinite(input.budget) || input.budget <= 0) {
      return { ok: false, error: 'invalid_budget', messageRu: 'Бюджет должен быть больше 0.' };
    }
    row.budget = Math.round(input.budget);
  }
  if (typeof input.targetMargin === 'number') {
    if (
      !Number.isFinite(input.targetMargin) ||
      input.targetMargin <= 0 ||
      input.targetMargin > 100
    ) {
      return {
        ok: false,
        error: 'invalid_margin',
        messageRu: 'Маржа — от 1 до 100%.',
      };
    }
    row.targetMargin = Math.round(input.targetMargin);
  }
  tiers[idx] = row;
  metadata.rangePlanner = { tiers };

  await pool.query(
    `INSERT INTO workshop2_collections (id, organization_id, display_name, metadata, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       metadata = EXCLUDED.metadata,
       updated_at = NOW()`,
    [collectionId, 'org-brand-001', collectionId, JSON.stringify(metadata)]
  );

  return { ok: true };
}

const TIER_EN_LABEL: Record<RangePlannerTier, string> = {
  core: 'Core',
  trend: 'Trend',
  novelty: 'Novelty',
};

/** Назначить tier артикулу через dossier (optionalNote + categoryLeafId). */
export async function assignWorkshop2ArticleRangePlannerTier(input: {
  collectionId: string;
  articleId: string;
  tier: string;
}): Promise<{ ok: true } | { ok: false; error: string; messageRu?: string }> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const tier = parseRangePlannerTier(input.tier);
  if (!collectionId || !articleId) {
    return { ok: false, error: 'missing_ids', messageRu: 'Укажите коллекцию и артикул.' };
  }
  if (!tier) {
    return { ok: false, error: 'invalid_tier', messageRu: 'Уровень: core, trend или novelty.' };
  }
  if (!isWorkshop2PostgresEnabled()) {
    return {
      ok: false,
      error: 'pg_disabled',
      messageRu: 'Назначение tier доступно только при подключении к базе данных.',
    };
  }

  const tierMeta = RANGE_PLANNER_DEMO_TIERS.find((row) => row.id === tier);
  if (!tierMeta) {
    return { ok: false, error: 'invalid_tier', messageRu: 'Неизвестный уровень ассортимента.' };
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record) {
    return { ok: false, error: 'not_found', messageRu: 'Артикул не найден в коллекции.' };
  }

  const dossier: Workshop2DossierPhase1 = { ...record.dossier };
  dossier.optionalNote = `Создано из Range Planner (${TIER_EN_LABEL[tier]}) · ${collectionId}`;
  if (dossier.articleFormMirror) {
    dossier.articleFormMirror = {
      ...dossier.articleFormMirror,
      categoryLeafId: tierMeta.categoryLeafId,
    };
  }

  const putRes = await putWorkshop2ServerDossierRecord({
    collectionId,
    articleId,
    dossier,
    baseVersion: record.version,
  });
  if (!putRes.ok) {
    return {
      ok: false,
      error: 'version_conflict',
      messageRu: 'Досье изменилось — обновите страницу и повторите.',
    };
  }

  return { ok: true };
}

/** Пакетное назначение tier нескольким артикулам (PATCH assignTier + articleIds). */
export async function bulkAssignWorkshop2ArticleRangePlannerTier(input: {
  collectionId: string;
  articleIds: string[];
  tier: string;
}): Promise<
  { ok: true; assigned: number; failed: number } | { ok: false; error: string; messageRu?: string }
> {
  const collectionId = input.collectionId.trim();
  const tier = input.tier.trim();
  const articleIds = [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))];
  if (!collectionId) {
    return { ok: false, error: 'missing_collection', messageRu: 'Не указана коллекция.' };
  }
  if (!tier) {
    return { ok: false, error: 'invalid_tier', messageRu: 'Укажите уровень ассортимента.' };
  }
  if (articleIds.length === 0) {
    return { ok: false, error: 'empty_batch', messageRu: 'Выберите хотя бы один артикул.' };
  }

  let assigned = 0;
  let failed = 0;
  for (const articleId of articleIds) {
    const result = await assignWorkshop2ArticleRangePlannerTier({ collectionId, articleId, tier });
    if (result.ok) assigned += 1;
    else failed += 1;
  }

  if (assigned === 0) {
    return {
      ok: false,
      error: 'batch_failed',
      messageRu: 'Не удалось назначить уровень ни одному артикулу.',
    };
  }

  return { ok: true, assigned, failed };
}

/** Сохранить порядок артикулов внутри tier (metadata.rangePlanner.tierArticleOrder). */
export async function reorderWorkshop2RangePlannerTierArticles(input: {
  collectionId: string;
  tier: string;
  articleIds: string[];
}): Promise<{ ok: true } | { ok: false; error: string; messageRu?: string }> {
  const collectionId = input.collectionId.trim();
  const tier = parseRangePlannerTier(input.tier);
  const articleIds = input.articleIds.map((id) => id.trim()).filter(Boolean);
  if (!collectionId) {
    return { ok: false, error: 'missing_collection', messageRu: 'Не указана коллекция.' };
  }
  if (!tier) {
    return { ok: false, error: 'invalid_tier', messageRu: 'Уровень: core, trend или novelty.' };
  }
  if (articleIds.length === 0) {
    return { ok: false, error: 'empty_order', messageRu: 'Укажите порядок артикулов.' };
  }
  if (!isWorkshop2PostgresEnabled()) {
    return {
      ok: false,
      error: 'pg_disabled',
      messageRu: 'Сортировка tier доступна только при подключении к базе данных.',
    };
  }

  await ensureWorkshop2PgSchema();
  const pool = getWorkshop2PgPool();
  const res = await pool.query<{ metadata: unknown }>(
    `SELECT metadata FROM workshop2_collections WHERE id = $1`,
    [collectionId]
  );

  let metadata: Record<string, unknown> = {};
  const existing = res.rows[0]?.metadata;
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    metadata = { ...(existing as Record<string, unknown>) };
  }

  const rangePlanner =
    metadata.rangePlanner && typeof metadata.rangePlanner === 'object'
      ? { ...(metadata.rangePlanner as Record<string, unknown>) }
      : {};
  const tierArticleOrder =
    rangePlanner.tierArticleOrder && typeof rangePlanner.tierArticleOrder === 'object'
      ? { ...(rangePlanner.tierArticleOrder as Record<string, string[]>) }
      : {};
  tierArticleOrder[tier] = articleIds;
  rangePlanner.tierArticleOrder = tierArticleOrder;
  metadata.rangePlanner = rangePlanner;

  await pool.query(
    `INSERT INTO workshop2_collections (id, organization_id, display_name, metadata, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       metadata = EXCLUDED.metadata,
       updated_at = NOW()`,
    [collectionId, 'org-brand-001', collectionId, JSON.stringify(metadata)]
  );

  return { ok: true };
}
