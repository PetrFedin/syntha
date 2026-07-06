import { NextRequest, NextResponse } from 'next/server';

import { summarizeBrandCoOtbReplenishmentSync } from '@/lib/b2b/brand-co-otb-replenishment-sync';
import { getBrandCoOtbReplenishmentSyncServer } from '@/lib/server/brand-co-otb-replenishment-sync-server';

/** GET /api/brand/b2b/otb/replenishment-sync — OTB ledger × shop replenishment rules (wave UC). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? 'SS27';
  const buyerId = req.nextUrl.searchParams.get('buyerId')?.trim();
  const buyerIds = buyerId ? [buyerId] : undefined;

  const result = await getBrandCoOtbReplenishmentSyncServer({
    collectionId,
    buyerIds,
  });
  const summary = summarizeBrandCoOtbReplenishmentSync(result.rows);

  return NextResponse.json({
    ok: true,
    collectionId: result.collectionId,
    rows: result.rows,
    summary,
    otbStorageMode: result.otbStorageMode,
    rulesStorageMode: result.rulesStorageMode,
    messageRu: `OTB × пополнение: ${summary.aligned}/${summary.buyers} синхронизировано · ${collectionId}.`,
  });
}
