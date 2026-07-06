import 'server-only';

import { buildBrandCoOtbReplenishmentBuyerRow } from '@/lib/b2b/brand-co-otb-replenishment-sync';
import { listBrandWssiOtbServer } from '@/lib/server/brand-wssi-otb-repository';
import { getShopReplenishmentRulesServer } from '@/lib/server/shop-replenishment-rules-repository';

const DEFAULT_BUYERS = ['shop1', 'shop2'] as const;

export async function getBrandCoOtbReplenishmentSyncServer(input: {
  collectionId: string;
  orderId?: string;
  buyerIds?: readonly string[];
}) {
  const collectionId = input.collectionId.trim() || 'SS27';
  const orderId = input.orderId?.trim();
  const buyerIds = input.buyerIds?.length ? input.buyerIds : DEFAULT_BUYERS;

  const otb = await listBrandWssiOtbServer({ collectionId });
  const mix = otb.mix ?? [];

  const rows = await Promise.all(
    buyerIds.map(async (buyerId) => {
      const rules = await getShopReplenishmentRulesServer(buyerId);
      return buildBrandCoOtbReplenishmentBuyerRow({
        buyerId,
        collectionId,
        orderId,
        mix,
        activePresetId: rules?.activePresetId ?? null,
      });
    })
  );

  return {
    collectionId,
    rows,
    otbStorageMode: otb.storageMode,
    rulesStorageMode: rows.some((row) => row.activePresetId) ? 'pg' : 'demo',
  };
}
