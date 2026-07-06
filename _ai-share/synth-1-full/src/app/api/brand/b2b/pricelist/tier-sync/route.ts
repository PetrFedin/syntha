import { NextRequest, NextResponse } from 'next/server';

import type { PriceTierId } from '@/lib/b2b/price-tiers';
import {
  listBrandPricelistTierSyncServer,
  pushBrandPricelistTierSyncToShopServer,
} from '@/lib/server/brand-pricelist-tier-sync-repository';

/** GET /api/brand/b2b/pricelist/tier-sync?collectionId=SS27 */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId') ?? undefined;
  const result = await listBrandPricelistTierSyncServer({ collectionId });
  return NextResponse.json({
    ok: true,
    collectionId: result.collectionId,
    rows: result.rows,
    summary: result.summary,
    storageMode: result.storageMode,
    messageRu: `${result.summary.synced}/${result.summary.total} тиров синхр. с магазином`,
  });
}

/** POST · push tier multiplier to shop matrix / landed margin spine */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_BODY', message: 'JSON body required' } },
      { status: 400 }
    );
  }
  const collectionId = String(body.collectionId ?? '').trim();
  const tierId = String(body.tierId ?? '').trim() as PriceTierId;
  if (!collectionId || !tierId) {
    return NextResponse.json(
      { ok: false, error: { code: 'MISSING_FIELDS', message: 'collectionId, tierId required' } },
      { status: 400 }
    );
  }

  try {
    const pushed = await pushBrandPricelistTierSyncToShopServer({ collectionId, tierId });
    return NextResponse.json({
      ok: true,
      collectionId,
      row: pushed.row,
      rows: pushed.rows,
      summary: {
        total: pushed.rows.length,
        synced: pushed.rows.filter((r) => r.shopSynced).length,
        pending: pushed.rows.filter((r) => !r.shopSynced).length,
      },
      storageMode: pushed.storageMode,
      messageRu: `Tier ${tierId} отправлен в матрицу магазина`,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'TIER_NOT_FOUND') {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'TIER_NOT_FOUND', messageRu: 'Строка tier sync не найдена' },
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'ERROR', messageRu: 'Не удалось отправить tier в магазин' },
      },
      { status: 500 }
    );
  }
}
