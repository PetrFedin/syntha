import 'server-only';

import { resolveWorkshop2B2bArticleHeroImageUrl } from '@/lib/production/workshop2-b2b-article-hero-image';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import {
  getWorkshop2PgPool,
  isWorkshop2PgConnectionError,
  isWorkshop2PostgresEnabled,
} from '@/lib/server/workshop2-pg-pool';

export type Workshop2ShowroomCampaignVisibilityTier = 'standard' | 'vip' | 'prebook';

export type Workshop2ShowroomCampaign = {
  collectionId: string;
  articleId: string;
  campaignName?: string;
  published: boolean;
  wholesalePrice?: number;
  msrp?: number;
  moq?: number;
  windowStart?: string;
  windowEnd?: string;
  /** Wave 21: видимость для buyer tier (standard|vip|prebook). */
  visibilityTier?: Workshop2ShowroomCampaignVisibilityTier;
  /** Wave 23: версия linesheet. */
  version?: number;
  supersedesId?: string;
  qtyBreaks?: Array<{ minQty: number; priceRub: number }>;
  /** SKU/colorway ids из досье при публикации. */
  articleIds?: string[];
  lastSyncAt?: string;
  updatedAt: string;
};

const memoryCampaigns = new Map<string, Workshop2ShowroomCampaign>();

function roomKey(collectionId: string, articleId: string): string {
  return `${collectionId}::${articleId}`;
}

export async function getWorkshop2ShowroomCampaign(input: {
  collectionId: string;
  articleId: string;
}): Promise<Workshop2ShowroomCampaign | null> {
  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        campaign_name: string | null;
        published: boolean;
        wholesale_price: string | null;
        msrp: string | null;
        moq: number | null;
        window_start: Date | null;
        window_end: Date | null;
        visibility_tier: string | null;
        article_ids: unknown;
        last_sync_at: Date | null;
        updated_at: Date;
      }>(
        `SELECT campaign_name, published, wholesale_price, msrp, moq,
                window_start, window_end, visibility_tier, article_ids, last_sync_at, updated_at
         FROM workshop2_showroom_campaigns
         WHERE collection_id = $1 AND article_id = $2`,
        [input.collectionId, input.articleId]
      );
      const row = res.rows[0];
      if (row) {
        const tierRaw = row.visibility_tier ?? 'standard';
        const visibilityTier =
          tierRaw === 'vip' || tierRaw === 'prebook' || tierRaw === 'standard'
            ? tierRaw
            : 'standard';
        return {
          collectionId: input.collectionId,
          articleId: input.articleId,
          campaignName: row.campaign_name ?? undefined,
          published: row.published,
          wholesalePrice: row.wholesale_price != null ? Number(row.wholesale_price) : undefined,
          msrp: row.msrp != null ? Number(row.msrp) : undefined,
          moq: row.moq ?? undefined,
          windowStart: row.window_start?.toISOString().slice(0, 10),
          windowEnd: row.window_end?.toISOString().slice(0, 10),
          visibilityTier,
          articleIds: Array.isArray(row.article_ids) ? (row.article_ids as string[]) : [],
          lastSyncAt: row.last_sync_at?.toISOString(),
          updatedAt: row.updated_at.toISOString(),
        };
      }
    } catch (err) {
      if (!isWorkshop2PgConnectionError(err)) throw err;
    }
  }
  return memoryCampaigns.get(roomKey(input.collectionId, input.articleId)) ?? null;
}

export async function putWorkshop2ShowroomCampaign(
  input: Omit<Workshop2ShowroomCampaign, 'updatedAt'> & { updatedAt?: string }
): Promise<Workshop2ShowroomCampaign> {
  const now = input.updatedAt ?? new Date().toISOString();
  const campaign: Workshop2ShowroomCampaign = { ...input, updatedAt: now, lastSyncAt: now };

  if (!isWorkshop2PostgresEnabled()) {
    memoryCampaigns.set(roomKey(input.collectionId, input.articleId), campaign);
    return campaign;
  }

  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO workshop2_showroom_campaigns
      (collection_id, article_id, campaign_name, published, wholesale_price, msrp, moq,
       window_start, window_end, visibility_tier, article_ids, last_sync_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10, $11::jsonb, $12::timestamptz, $12::timestamptz)
     ON CONFLICT (collection_id, article_id)
     DO UPDATE SET
       campaign_name = EXCLUDED.campaign_name,
       published = EXCLUDED.published,
       wholesale_price = EXCLUDED.wholesale_price,
       msrp = EXCLUDED.msrp,
       moq = EXCLUDED.moq,
       window_start = EXCLUDED.window_start,
       window_end = EXCLUDED.window_end,
       visibility_tier = EXCLUDED.visibility_tier,
       article_ids = EXCLUDED.article_ids,
       last_sync_at = EXCLUDED.last_sync_at,
       updated_at = EXCLUDED.updated_at`,
    [
      campaign.collectionId,
      campaign.articleId,
      campaign.campaignName ?? null,
      campaign.published,
      campaign.wholesalePrice ?? null,
      campaign.msrp ?? null,
      campaign.moq ?? null,
      campaign.windowStart ?? null,
      campaign.windowEnd ?? null,
      campaign.visibilityTier ?? 'standard',
      JSON.stringify(campaign.articleIds ?? []),
      now,
    ]
  );
  return campaign;
}

export type Workshop2PublishedShowroomArticle = {
  collectionId: string;
  articleId: string;
  name: string;
  sku?: string;
  wholesalePriceRub: number;
  msrpRub?: number;
  moq?: number;
  campaignName?: string;
  /** Vault/sketch preview из W2 досье (для matrix/linesheet). */
  heroImageUrl?: string;
};

async function listWorkshop2PublishedShowroomArticlesFromMemoryOrFileStore(
  cid: string
): Promise<Workshop2PublishedShowroomArticle[]> {
  const published = [...memoryCampaigns.values()].filter(
    (c) => c.collectionId === cid && c.published
  );
  if (published.length) {
    const { getWorkshop2ServerDossierRecord } =
      await import('@/lib/server/workshop2-phase1-dossier-server-store');
    return Promise.all(
      published.map(async (c) => {
        const record = await getWorkshop2ServerDossierRecord(cid, c.articleId);
        const name =
          record?.dossier?.passportProductionBrief?.articleCardOwnerName?.trim() || c.articleId;
        return {
          collectionId: cid,
          articleId: c.articleId,
          name,
          sku: c.articleId,
          wholesalePriceRub: c.wholesalePrice ?? 0,
          msrpRub: c.msrp,
          moq: c.moq,
          campaignName: c.campaignName,
          heroImageUrl: resolveWorkshop2B2bArticleHeroImageUrl(record?.dossier),
        };
      })
    );
  }

  const { WORKSHOP2_FILE_STORE_DEMO_ARTICLES } =
    await import('@/lib/production/workshop2-file-store-demo-bootstrap');
  const { getWorkshop2ServerDossierRecord } =
    await import('@/lib/server/workshop2-phase1-dossier-server-store');
  const demoItems: Workshop2PublishedShowroomArticle[] = [];
  for (const spec of WORKSHOP2_FILE_STORE_DEMO_ARTICLES) {
    const record = await getWorkshop2ServerDossierRecord(cid, spec.articleId);
    if (!record?.dossier) continue;
    demoItems.push({
      collectionId: cid,
      articleId: spec.articleId,
      name: record.dossier.passportProductionBrief?.articleCardOwnerName?.trim() || spec.articleId,
      sku: spec.sku,
      wholesalePriceRub: 4500,
      msrpRub: 12900,
      moq: 6,
      heroImageUrl: resolveWorkshop2B2bArticleHeroImageUrl(record.dossier),
    });
  }
  return demoItems;
}

/** Linesheet / B2B bridge: опубликованные артикулы коллекции. */
export async function listWorkshop2PublishedShowroomArticles(
  collectionId: string
): Promise<Workshop2PublishedShowroomArticle[]> {
  const cid = collectionId.trim();
  if (!cid) return [];

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        article_id: string;
        campaign_name: string | null;
        wholesale_price: string | null;
        msrp: string | null;
        moq: number | null;
      }>(
        `SELECT article_id, campaign_name, wholesale_price, msrp, moq
         FROM workshop2_showroom_campaigns
         WHERE collection_id = $1 AND published = true
         ORDER BY article_id ASC
         LIMIT 200`,
        [cid]
      );
      const { getWorkshop2ServerDossierRecord } =
        await import('@/lib/server/workshop2-phase1-dossier-server-store');
      const items: Workshop2PublishedShowroomArticle[] = [];
      for (const row of res.rows) {
        const record = await getWorkshop2ServerDossierRecord(cid, row.article_id);
        const name =
          record?.dossier?.passportProductionBrief?.articleCardOwnerName?.trim() || row.article_id;
        const sku = row.article_id;
        items.push({
          collectionId: cid,
          articleId: row.article_id,
          name,
          sku,
          wholesalePriceRub: row.wholesale_price != null ? Number(row.wholesale_price) : 0,
          msrpRub: row.msrp != null ? Number(row.msrp) : undefined,
          moq: row.moq ?? undefined,
          campaignName: row.campaign_name ?? undefined,
          heroImageUrl: resolveWorkshop2B2bArticleHeroImageUrl(record?.dossier),
        });
      }
      if (items.length > 0) return items;
    } catch (err) {
      if (!isWorkshop2PgConnectionError(err)) throw err;
    }
  }

  return listWorkshop2PublishedShowroomArticlesFromMemoryOrFileStore(cid);
}

export function clearWorkshop2ShowroomMemoryForTests(): void {
  memoryCampaigns.clear();
}
