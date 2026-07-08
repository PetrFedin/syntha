import { NextRequest, NextResponse } from 'next/server';

import type { CollectionStageModulesDoc } from '@/lib/production/collection-stage-modules-store';
import {
  brandCollectionStageModulesStorageMode,
  getBrandCollectionStageModulesServer,
  putBrandCollectionStageModulesServer,
} from '@/lib/server/brand-collection-stage-modules-repository';

/** GET — collection stage modules (brief/passport/RFQ fields) from PG. */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'collectionId обязателен.' }, { status: 400 });
  }

  const { doc, storageMode } = await getBrandCollectionStageModulesServer({ collectionId });
  return NextResponse.json({
    ok: true,
    doc,
    storageMode,
    messageRu: doc ? 'Модули этапов загружены.' : 'Модули этапов пусты.',
  });
}

/** PUT — persist collection stage modules to PG (Wave SE · S1). */
export async function PUT(req: NextRequest) {
  let body: { collectionId?: string; doc?: CollectionStageModulesDoc; organizationId?: string } =
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

  const result = await putBrandCollectionStageModulesServer({
    collectionId,
    doc,
    organizationId: body.organizationId,
  });

  return NextResponse.json({
    ok: result.ok,
    storageMode:
      result.storageMode === 'pg_only_blocked'
        ? brandCollectionStageModulesStorageMode()
        : result.storageMode,
    messageRu: result.ok ? 'Модули этапов сохранены.' : 'Не удалось сохранить модули.',
  });
}
