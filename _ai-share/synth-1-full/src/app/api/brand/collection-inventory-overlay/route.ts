import { NextRequest, NextResponse } from 'next/server';

import type { CollectionInventoryOverlayDoc } from '@/lib/production/collection-inventory-overlay-store';
import {
  brandCollectionInventoryOverlayStorageMode,
  getBrandCollectionInventoryOverlayServer,
  putBrandCollectionInventoryOverlayServer,
} from '@/lib/server/brand-collection-inventory-overlay-repository';

/** GET — collection inventory overlay articles from PG. */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'collectionId обязателен.' }, { status: 400 });
  }

  const { doc, storageMode } = await getBrandCollectionInventoryOverlayServer({ collectionId });
  return NextResponse.json({
    ok: true,
    doc,
    storageMode,
    messageRu: doc?.articles?.length
      ? 'Overlay артикулов загружен.'
      : 'Overlay артикулов пуст.',
  });
}

/** PUT — persist collection inventory overlay to PG (Wave YB · S1). */
export async function PUT(req: NextRequest) {
  let body: { collectionId?: string; doc?: CollectionInventoryOverlayDoc; organizationId?: string } =
    {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное тело.' }, { status: 400 });
  }

  const collectionId = body.collectionId?.trim() ?? '';
  const doc = body.doc;
  if (!collectionId || !doc || doc.v !== 1) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и doc обязательны.' },
      { status: 400 }
    );
  }

  const result = await putBrandCollectionInventoryOverlayServer({
    collectionId,
    doc,
    organizationId: body.organizationId,
  });

  return NextResponse.json({
    ok: result.ok,
    storageMode:
      result.storageMode === 'pg_only_blocked'
        ? brandCollectionInventoryOverlayStorageMode()
        : result.storageMode,
    messageRu: result.ok ? 'Overlay сохранён.' : 'Не удалось сохранить overlay.',
  });
}
