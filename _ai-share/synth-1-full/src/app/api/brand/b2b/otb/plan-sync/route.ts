import { NextRequest, NextResponse } from 'next/server';

import { brandCoOtbPlanSyncMessageRu } from '@/lib/b2b/brand-co-otb-wave-xv';
import { summarizeBrandCoOtbReplenishmentSync } from '@/lib/b2b/brand-co-otb-replenishment-sync';
import { getBrandCoOtbReplenishmentSyncServer } from '@/lib/server/brand-co-otb-replenishment-sync-server';

/** GET /api/brand/b2b/otb/plan-sync — PG OTB ledger plan × shop replenishment rules (wave XV). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? 'SS27';
  const buyerId = req.nextUrl.searchParams.get('buyerId')?.trim();
  const buyerIds = buyerId ? [buyerId] : undefined;

  const result = await getBrandCoOtbReplenishmentSyncServer({
    collectionId,
    buyerIds,
  });
  const summary = summarizeBrandCoOtbReplenishmentSync(result.rows);
  const linkedPresetIds = [
    ...new Set(
      result.rows
        .map((row) => row.activePresetId)
        .filter((presetId): presetId is string => Boolean(presetId?.trim()))
    ),
  ];

  return NextResponse.json({
    ok: true,
    collectionId: result.collectionId,
    rows: result.rows,
    summary,
    planSync: {
      otbStorageMode: result.otbStorageMode,
      rulesStorageMode: result.rulesStorageMode,
      linkedPresetIds,
      buyersWithRules: result.rows.filter((row) => row.activePresetId).length,
    },
    otbStorageMode: result.otbStorageMode,
    rulesStorageMode: result.rulesStorageMode,
    messageRu: brandCoOtbPlanSyncMessageRu({
      aligned: summary.aligned,
      buyers: summary.buyers,
      collectionId: result.collectionId,
      otbStorageMode: result.otbStorageMode,
      rulesStorageMode: result.rulesStorageMode,
    }),
  });
}
