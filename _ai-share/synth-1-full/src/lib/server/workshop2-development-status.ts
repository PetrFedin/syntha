import 'server-only';

import { listWorkshop2FactorySampleQueue } from '@/lib/production/workshop2-factory-sample-queue';
import {
  getWorkshop2PgPool,
  isWorkshop2PostgresEnabled,
  withWorkshop2PgFallback,
} from '@/lib/server/workshop2-pg-pool';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getPlatformCoreDemo, PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { getWorkshop2CoreCollectionRangePlannerMetadataRaw } from '@/lib/production/workshop2-core-collection-range-planner-metadata';
import {
  buildRangePlannerPgSnapshot,
  extractRangePlannerHintsFromDossierJson,
  parseRangePlannerCollectionMetadata,
  parseRangePlannerTierArticleOrder,
  type RangePlannerCollectionMetadata,
  type RangePlannerPgSnapshot,
} from '@/lib/production/workshop2-range-planner-pg';
import { factorySampleQueueDeepHref } from '@/lib/platform/wave-xc-mfr-sample-status-patch';
import { W2_WORKSPACE_SHORT } from '@/lib/platform-core-canonical-labels';

export type Workshop2DevelopmentStep = {
  id: string;
  labelRu: string;
  done: boolean;
};

export type Workshop2DevelopmentStatus = {
  collectionId: string;
  articleCount: number;
  /** PG article ids для batch publish / linesheet (до 200). */
  articleIds: string[];
  sampleQueueCount: number;
  factoryId: string;
  steps: Workshop2DevelopmentStep[];
  workshop2Href: string;
  factorySampleHref: string;
  factoryDossierHref: string;
  supplierBomHref: string;
  /** Deep-link в linesheet после gate ready_for_collection. */
  linesheetHref: string;
  demoArticleId: string;
  rangePlanner: RangePlannerPgSnapshot;
};

async function countCollectionArticles(collectionId: string): Promise<number> {
  return withWorkshop2PgFallback(
    async () => {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{ n: string }>(
        `SELECT COUNT(*)::text AS n FROM workshop2_articles WHERE collection_id = $1`,
        [collectionId]
      );
      return Number(res.rows[0]?.n ?? 0);
    },
    () => {
      const demo = getPlatformCoreDemo(collectionId);
      return demo.demoArticleId?.trim() && !demo.demoArticleId.startsWith('__') ? 1 : 0;
    }
  );
}

async function listCollectionArticleIds(collectionId: string): Promise<string[]> {
  return withWorkshop2PgFallback(
    async () => {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{ article_id: string }>(
        `SELECT id AS article_id FROM workshop2_articles WHERE collection_id = $1 ORDER BY id LIMIT 200`,
        [collectionId]
      );
      return res.rows.map((r) => r.article_id.trim()).filter(Boolean);
    },
    () => {
      const demo = getPlatformCoreDemo(collectionId);
      return demo.demoArticleId?.trim() && !demo.demoArticleId.startsWith('__')
        ? [demo.demoArticleId.trim()]
        : [];
    }
  );
}

function coreCollectionRangePlannerMetadataFallback(
  collectionId: string
): RangePlannerCollectionMetadata | null {
  const raw = getWorkshop2CoreCollectionRangePlannerMetadataRaw(collectionId);
  return raw ? parseRangePlannerCollectionMetadata(raw) : null;
}

function mergeRangePlannerCollectionMetadata(
  metadata: unknown,
  collectionId: string
): RangePlannerCollectionMetadata | null {
  const base =
    parseRangePlannerCollectionMetadata(metadata) ??
    coreCollectionRangePlannerMetadataFallback(collectionId);
  if (!base) return null;
  const tierArticleOrder = parseRangePlannerTierArticleOrder(metadata);
  return tierArticleOrder ? { ...base, tierArticleOrder } : base;
}

async function loadCollectionRangePlannerMetadata(
  collectionId: string
): Promise<RangePlannerCollectionMetadata | null> {
  return withWorkshop2PgFallback(
    async () => {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{ metadata: unknown }>(
        `SELECT metadata FROM workshop2_collections WHERE id = $1`,
        [collectionId]
      );
      const merged = mergeRangePlannerCollectionMetadata(
        res.rows[0]?.metadata ?? null,
        collectionId
      );
      if (merged) return merged;
      return coreCollectionRangePlannerMetadataFallback(collectionId);
    },
    () =>
      mergeRangePlannerCollectionMetadata(
        getWorkshop2CoreCollectionRangePlannerMetadataRaw(collectionId),
        collectionId
      )
  );
}

async function listCollectionRangePlannerHints(collectionId: string) {
  return withWorkshop2PgFallback(
    async () => {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        article_id: string;
        dossier_json: unknown;
      }>(
        `SELECT a.id AS article_id, d.dossier_json
     FROM workshop2_articles a
     LEFT JOIN workshop2_dossiers d
       ON d.collection_id = a.collection_id AND d.article_id = a.id
     WHERE a.collection_id = $1`,
        [collectionId]
      );
      return res.rows.map((row) =>
        extractRangePlannerHintsFromDossierJson(row.article_id, row.dossier_json)
      );
    },
    () => []
  );
}

export type Workshop2DevelopmentStatusOptions = {
  /** Chain-overview hub: без full dossier scan для range planner. */
  skipRangePlanner?: boolean;
};

export async function getWorkshop2DevelopmentStatus(
  collectionId = PLATFORM_CORE_DEMO.collectionId,
  factoryId = PLATFORM_CORE_DEMO.factoryId,
  options?: Workshop2DevelopmentStatusOptions
): Promise<Workshop2DevelopmentStatus> {
  const cid = collectionId.trim() || PLATFORM_CORE_DEMO.collectionId;
  const pgEnabled = isWorkshop2PostgresEnabled();
  const skipRangePlanner = options?.skipRangePlanner === true;
  const [articleCount, articleIds, queue, tierHints, collectionMeta] = await Promise.all([
    countCollectionArticles(cid),
    listCollectionArticleIds(cid),
    listWorkshop2FactorySampleQueue({ factoryId }),
    skipRangePlanner ? Promise.resolve([]) : listCollectionRangePlannerHints(cid),
    skipRangePlanner
      ? Promise.resolve(coreCollectionRangePlannerMetadataFallback(cid))
      : loadCollectionRangePlannerMetadata(cid),
  ]);
  const rangePlanner = buildRangePlannerPgSnapshot({
    collectionId: cid,
    articleCount,
    pgEnabled,
    tierHints,
    collectionMeta,
  });
  const sampleItems = queue.items.filter((i) => i.collectionId === cid);
  const sampleQueueCount = sampleItems.length;
  const firstActiveSample =
    sampleItems.find((i) => i.status === 'sent' || i.status === 'in_progress') ?? sampleItems[0];
  const hasArticles = articleCount > 0;
  const hasSamples = sampleQueueCount > 0;

  const steps: Workshop2DevelopmentStep[] = [
    {
      id: 'dossier_articles',
      labelRu: `Артикулы в ${W2_WORKSPACE_SHORT.toLowerCase()} (${articleCount})`,
      done: hasArticles,
    },
    {
      id: 'factory_samples',
      labelRu: `Образцы у производства (${sampleQueueCount})`,
      done: hasSamples,
    },
    {
      id: 'ready_for_collection',
      labelRu: 'Готово к публикации витрины и лайншитов',
      done: hasArticles && hasSamples,
    },
  ];

  const demoArticleId = getPlatformCoreDemo(cid).demoArticleId;
  const linesheetHref = `/brand/linesheets?collection=${encodeURIComponent(cid)}&article=${encodeURIComponent(demoArticleId)}`;

  return {
    collectionId: cid,
    articleCount,
    articleIds,
    sampleQueueCount,
    factoryId,
    steps,
    workshop2Href: `/brand/production/workshop2?w2col=${encodeURIComponent(cid)}&article=${encodeURIComponent(demoArticleId)}`,
    factorySampleHref: factorySampleQueueDeepHref({
      collectionId: cid,
      articleId: firstActiveSample?.articleId ?? demoArticleId,
      factoryId,
      orderId: firstActiveSample?.orderId,
    }),
    factoryDossierHref: `/factory/production/dossier/${encodeURIComponent(demoArticleId)}?collection=${encodeURIComponent(cid)}`,
    supplierBomHref: `/factory/production/materials?collection=${encodeURIComponent(cid)}&article=${encodeURIComponent(demoArticleId)}&view=development`,
    linesheetHref,
    demoArticleId,
    rangePlanner,
  };
}

const MANUFACTURER_DEV_STEP_IDS = new Set(['dossier_articles', 'factory_samples']);

/** Manufacturer hub: без brand-only шага ready_for_collection. */
export function filterWorkshop2DevelopmentStepsForManufacturer(
  steps: Workshop2DevelopmentStep[]
): Workshop2DevelopmentStep[] {
  return steps
    .filter((step) => MANUFACTURER_DEV_STEP_IDS.has(step.id))
    .map((step) =>
      step.id === 'dossier_articles'
        ? {
            ...step,
            labelRu: step.labelRu.replace(
              new RegExp(W2_WORKSPACE_SHORT.toLowerCase(), 'i'),
              'досье'
            ),
          }
        : step
    );
}
