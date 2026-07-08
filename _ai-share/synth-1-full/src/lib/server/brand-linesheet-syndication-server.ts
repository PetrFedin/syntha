import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import 'server-only';

import {
  BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_SUCCESS_RU,
  BRAND_LINESHEET_BATCH_UNPUBLISH_SUCCESS_RU,
  BRAND_LINESHEET_SYNDICATE_EMPTY_RU,
  BRAND_LINESHEET_SYNDICATE_SUCCESS_RU,
  SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU,
  SUPPLIER_LINESHEET_BOM_NOTIFY_BODY_RU,
  SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU,
  type BrandLinesheetSyndicateSource,
} from '@/lib/production/brand-linesheet-syndication';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';
import {
  appendBrandLinesheetSyndicationJournal,
  appendShopShowroomAutoIngestJournal,
  getLatestBrandLinesheetUnpublishRollbackSnapshot,
  listBrandLinesheetSyndicationJournal,
  markBrandLinesheetUnpublishRollbackApplied,
  saveBrandLinesheetUnpublishRollbackSnapshot,
} from '@/lib/server/brand-linesheet-syndication-repository';
import { appendBrandScPublishAuditJournal } from '@/lib/server/brand-sc-publish-audit-repository';
import { appendPlatformCoreNotificationEvent } from '@/lib/server/platform-core-notification-events-repository';
import {
  listWorkshop2PublishedShowroomArticles,
  putWorkshop2ShowroomCampaign,
} from '@/lib/server/workshop2-showroom-repository';

async function mirrorBrandScSyndicationWdPublishAudit(input: {
  collectionId: string;
  articleIds: string[];
  eventType: 'linesheet.syndicated' | 'showroom.batch_unpublished' | 'showroom.batch_rollback';
  source: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const articleIds = [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))];
  if (articleIds.length === 0) return;
  await Promise.all(
    articleIds.map((articleId) =>
      appendBrandScPublishAuditJournal({
        collectionId: input.collectionId,
        articleId,
        eventType: input.eventType,
        source: input.source,
        payload: input.payload ?? {},
      })
    )
  );
}

async function notifyShopLinesheetSyndication(input: {
  collectionId: string;
  articleIds: string[];
  shopBuyerId: string;
  ingestedCount: number;
}): Promise<void> {
  const href = `/shop/b2b/showroom?collection=${encodeURIComponent(input.collectionId)}`;
  await appendPlatformCoreNotificationEvent({
    role: 'shop',
    scopeKey: input.shopBuyerId,
    collectionId: input.collectionId,
    kind: 'chain_status',
    titleRu: `Лайншит · syndication (${input.ingestedCount} SKU)`,
    bodyRu: SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU,
    href,
  });
}

async function notifySupplierLinesheetBomPreview(input: {
  collectionId: string;
  articleIds: string[];
}): Promise<void> {
  const collectionId = input.collectionId.trim();
  if (!collectionId || input.articleIds.length === 0) return;
  const href = `${EXTENDED_ROUTES.factory.supplierCoreCabinet}?pillar=sample_collection&collection=${encodeURIComponent(collectionId)}`;
  await appendPlatformCoreNotificationEvent({
    role: 'supplier',
    scopeKey: `linesheet:${collectionId}`,
    collectionId,
    articleId: input.articleIds[0],
    kind: 'chain_status',
    titleRu: `${SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU} (${input.articleIds.length})`,
    bodyRu: SUPPLIER_LINESHEET_BOM_NOTIFY_BODY_RU,
    href,
  });
}

export async function runShopShowroomAutoIngestOnSyndicate(input: {
  buyerId: string;
  collectionId: string;
  articleIds: string[];
  source?: string;
}): Promise<{ ingestedCount: number; journalId: string }> {
  const articleIds =
    input.articleIds.length > 0
      ? input.articleIds
      : (await listWorkshop2PublishedShowroomArticles(input.collectionId)).map((a) => a.articleId);

  const journal = await appendShopShowroomAutoIngestJournal({
    buyerId: input.buyerId,
    collectionId: input.collectionId,
    articleIds,
    source: input.source,
  });

  return { ingestedCount: journal.ingestedCount, journalId: journal.id };
}

export async function postBrandLinesheetSyndicate(input: {
  collectionId: string;
  articleIds?: string[];
  shopBuyerId?: string;
  source?: BrandLinesheetSyndicateSource;
  publishMessageRu?: string;
}): Promise<{
  ok: boolean;
  messageRu: string;
  result?: Awaited<ReturnType<typeof appendBrandLinesheetSyndicationJournal>>;
  ingestedCount: number;
}> {
  const collectionId = input.collectionId.trim() || PLATFORM_CORE_DEMO.collectionId;
  const shopBuyerId = input.shopBuyerId?.trim() || 'shop1';
  const source = input.source ?? 'syndicate_publish';

  let articleIds = (input.articleIds ?? []).map((id) => id.trim()).filter(Boolean);
  if (articleIds.length === 0) {
    const published = await listWorkshop2PublishedShowroomArticles(collectionId);
    articleIds = published.map((a) => a.articleId);
  }

  if (articleIds.length === 0) {
    return { ok: false, messageRu: BRAND_LINESHEET_SYNDICATE_EMPTY_RU, ingestedCount: 0 };
  }

  const ingest = await runShopShowroomAutoIngestOnSyndicate({
    buyerId: shopBuyerId,
    collectionId,
    articleIds,
    source: 'linesheet_syndicate',
  });

  await notifyShopLinesheetSyndication({
    collectionId,
    articleIds,
    shopBuyerId,
    ingestedCount: ingest.ingestedCount,
  });

  await notifySupplierLinesheetBomPreview({ collectionId, articleIds });

  const messageRu =
    input.publishMessageRu?.trim() ||
    `${BRAND_LINESHEET_SYNDICATE_SUCCESS_RU} Ingest: ${ingest.ingestedCount} SKU → ${shopBuyerId}.`;

  const result = await appendBrandLinesheetSyndicationJournal({
    collectionId,
    articleIds,
    shopBuyerId,
    ingestedCount: ingest.ingestedCount,
    source,
    messageRu,
  });

  await mirrorBrandScSyndicationWdPublishAudit({
    collectionId,
    articleIds,
    eventType: 'linesheet.syndicated',
    source,
    payload: {
      ingestedCount: ingest.ingestedCount,
      shopBuyerId,
      syndicationJournalId: result.id,
    },
  });

  return { ok: true, messageRu, result, ingestedCount: ingest.ingestedCount };
}

export async function postBrandLinesheetBatchUnpublish(input: {
  collectionId: string;
  articleIds: string[];
  shopBuyerId?: string;
}): Promise<{
  ok: boolean;
  messageRu: string;
  snapshot?: Awaited<ReturnType<typeof saveBrandLinesheetUnpublishRollbackSnapshot>>;
  unpublishedCount: number;
}> {
  const collectionId = input.collectionId.trim();
  const articleIds = [...new Set(input.articleIds.map((id) => id.trim()).filter(Boolean))];
  const shopBuyerId = input.shopBuyerId?.trim() || 'shop1';

  if (!collectionId || articleIds.length === 0) {
    return {
      ok: false,
      messageRu: 'Передайте collectionId и articleIds[] для batch unpublish.',
      unpublishedCount: 0,
    };
  }

  const snapshot = await saveBrandLinesheetUnpublishRollbackSnapshot({ collectionId, articleIds });

  let unpublishedCount = 0;
  for (const articleId of articleIds) {
    await putWorkshop2ShowroomCampaign({
      collectionId,
      articleId,
      published: false,
    });
    unpublishedCount += 1;
  }

  await appendPlatformCoreNotificationEvent({
    role: 'shop',
    scopeKey: shopBuyerId,
    collectionId,
    kind: 'chain_status',
    titleRu: `Снято с витрины · batch (${unpublishedCount} SKU)`,
    bodyRu: 'Rollback snapshot сохранён — бренд может откатить unpublish.',
    href: `/shop/b2b/showroom?collection=${encodeURIComponent(collectionId)}`,
  });

  await mirrorBrandScSyndicationWdPublishAudit({
    collectionId,
    articleIds,
    eventType: 'showroom.batch_unpublished',
    source: 'batch_unpublish',
    payload: { snapshotId: snapshot.snapshotId, unpublishedCount },
  });

  return {
    ok: true,
    messageRu: `${BRAND_LINESHEET_BATCH_UNPUBLISH_SUCCESS_RU} Snapshot: ${snapshot.snapshotId}.`,
    snapshot,
    unpublishedCount,
  };
}

export async function postBrandLinesheetBatchUnpublishRollback(input: {
  collectionId: string;
  snapshotId?: string;
  shopBuyerId?: string;
}): Promise<{
  ok: boolean;
  messageRu: string;
  restoredCount: number;
  snapshotId?: string;
}> {
  const collectionId = input.collectionId.trim();
  const shopBuyerId = input.shopBuyerId?.trim() || 'shop1';

  const snapshot = await getLatestBrandLinesheetUnpublishRollbackSnapshot(collectionId);

  if (!snapshot?.snapshotId) {
    return {
      ok: false,
      messageRu: 'Нет rollback snapshot для этой коллекции.',
      restoredCount: 0,
    };
  }

  if (input.snapshotId?.trim() && input.snapshotId.trim() !== snapshot.snapshotId) {
    return {
      ok: false,
      messageRu: 'Snapshot не совпадает с последним batch unpublish.',
      restoredCount: 0,
    };
  }

  const articleIds = snapshot.articleIds;
  if (articleIds.length === 0) {
    return {
      ok: false,
      messageRu: 'Rollback snapshot пуст — нечего восстанавливать.',
      restoredCount: 0,
    };
  }

  for (const articleId of articleIds) {
    await putWorkshop2ShowroomCampaign({
      collectionId,
      articleId,
      published: true,
      campaignName: `${collectionId} · ${articleId}`,
    });
  }

  await markBrandLinesheetUnpublishRollbackApplied(snapshot.snapshotId);

  await appendPlatformCoreNotificationEvent({
    role: 'shop',
    scopeKey: shopBuyerId,
    collectionId,
    kind: 'chain_status',
    titleRu: `Rollback витрины · ${articleIds.length} SKU`,
    bodyRu: BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_SUCCESS_RU,
    href: `/shop/b2b/showroom?collection=${encodeURIComponent(collectionId)}`,
  });

  await mirrorBrandScSyndicationWdPublishAudit({
    collectionId,
    articleIds,
    eventType: 'showroom.batch_rollback',
    source: 'batch_unpublish_rollback',
    payload: { snapshotId: snapshot.snapshotId, restoredCount: articleIds.length },
  });

  return {
    ok: true,
    messageRu: BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_SUCCESS_RU,
    restoredCount: articleIds.length,
    snapshotId: snapshot.snapshotId,
  };
}

export { listBrandLinesheetSyndicationJournal };
