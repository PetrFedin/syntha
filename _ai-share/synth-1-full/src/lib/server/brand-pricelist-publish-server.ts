import 'server-only';

import {
  brandPricelistPublishMessageRu,
  BRAND_PRICELIST_PUBLISH_NOT_FOUND_RU,
  BRAND_PRICELIST_PUBLISH_UNKNOWN_TIER_RU,
  type BrandPricelistPublishTierSyncResult,
} from '@/lib/b2b/brand-pricelist-publish';
import type { BrandPricelistVersionRow } from '@/lib/b2b/brand-pricelist-versions-feed';
import { parsePriceTierId } from '@/lib/b2b/price-tiers';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { listBrandPricelistVersionsServer } from '@/lib/server/brand-pricelist-versions-repository';
import { isBrandPricelistPublishTierSyncEnabled } from '@/lib/b2b/brand-co-tier-sync-publish-wn';
import {
  pushBrandPricelistTierSyncToShopServer,
  refreshBrandPricelistTierSyncFromVersionServer,
} from '@/lib/server/brand-pricelist-tier-sync-repository';

export async function publishBrandPricelistWithTierSyncServer(input: {
  collectionId?: string;
  id: string;
  organizationId?: string;
  syncTierToShop?: boolean;
}): Promise<{
  ok: boolean;
  messageRu: string;
  collectionId: string;
  pricelist?: BrandPricelistVersionRow;
  tierSync?: BrandPricelistPublishTierSyncResult;
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const collectionId =
    String(input.collectionId ?? PLATFORM_CORE_DEMO.collectionId).trim() ||
    PLATFORM_CORE_DEMO.collectionId;
  const id = input.id.trim();
  const syncTierToShop = input.syncTierToShop !== false && isBrandPricelistPublishTierSyncEnabled();

  const listed = await listBrandPricelistVersionsServer({
    collectionId,
    organizationId: input.organizationId,
    seedIfEmpty: true,
  });
  const pricelist = listed.rows.find((row) => row.id === id);
  if (!pricelist) {
    return {
      ok: false,
      messageRu: BRAND_PRICELIST_PUBLISH_NOT_FOUND_RU,
      collectionId,
      storageMode: listed.storageMode,
    };
  }

  const tierId = parsePriceTierId(pricelist.channel);
  let tierSync: BrandPricelistPublishTierSyncResult | undefined;

  if (!syncTierToShop) {
    tierSync = { ok: true, skipped: true, reason: 'sync_disabled' };
  } else if (!tierId) {
    tierSync = { ok: false, skipped: true, reason: 'unknown_tier' };
  } else {
    try {
      await refreshBrandPricelistTierSyncFromVersionServer({
        collectionId,
        tierId,
        priceListId: pricelist.id,
        priceListName: pricelist.name,
        multiplier: pricelist.multiplier ?? 1,
        organizationId: input.organizationId,
      });
      const pushed = await pushBrandPricelistTierSyncToShopServer({
        collectionId,
        tierId,
        organizationId: input.organizationId,
      });
      tierSync = {
        ok: true,
        tierId,
        shopSynced: pushed.row.shopSynced,
        syncedAt: pushed.row.syncedAt,
      };
    } catch {
      tierSync = { ok: false, tierId, reason: 'tier_sync_failed' };
    }
  }

  const messageRu =
    tierSync?.skipped && tierSync.reason === 'unknown_tier'
      ? `${brandPricelistPublishMessageRu({ priceListName: pricelist.name, tierId: tierId ?? undefined, tierSync })} · ${BRAND_PRICELIST_PUBLISH_UNKNOWN_TIER_RU}`
      : brandPricelistPublishMessageRu({
          priceListName: pricelist.name,
          tierId: tierId ?? undefined,
          tierSync,
        });

  return {
    ok: true,
    messageRu,
    collectionId,
    pricelist,
    tierSync,
    storageMode: listed.storageMode,
  };
}
