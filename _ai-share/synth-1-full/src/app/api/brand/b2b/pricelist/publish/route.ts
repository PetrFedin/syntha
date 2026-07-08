import { NextRequest, NextResponse } from 'next/server';

import { isBrandPricelistPublishTierSyncEnabled } from '@/lib/b2b/brand-co-tier-sync-publish-wn';
import { publishBrandPricelistWithTierSyncServer } from '@/lib/server/brand-pricelist-publish-server';

/** POST /api/brand/b2b/pricelist/publish — publish pricelist version + push tier sync to shop. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'INVALID_BODY', messageRu: 'Требуется JSON body.' },
      },
      { status: 400 }
    );
  }

  const collectionId = String(body.collectionId ?? '').trim();
  const id = String(body.id ?? '').trim();
  if (!collectionId || !id) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'MISSING_FIELDS',
          messageRu: 'Укажите collectionId и id прайс-листа.',
        },
      },
      { status: 400 }
    );
  }

  const syncTierToShop = body.syncTierToShop !== false && isBrandPricelistPublishTierSyncEnabled();

  try {
    const result = await publishBrandPricelistWithTierSyncServer({
      collectionId,
      id,
      syncTierToShop,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'NOT_FOUND', messageRu: result.messageRu },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      collectionId: result.collectionId,
      pricelist: result.pricelist,
      tierSync: result.tierSync,
      storageMode: result.storageMode,
      messageRu: result.messageRu,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'ERROR',
          messageRu: 'Не удалось опубликовать прайс-лист и синхронизировать tier.',
        },
      },
      { status: 500 }
    );
  }
}
