import { NextRequest, NextResponse } from 'next/server';

import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { brandLinesheetSyndicationStorageMode } from '@/lib/server/brand-linesheet-syndication-repository';
import {
  postBrandLinesheetBatchUnpublish,
  postBrandLinesheetBatchUnpublishRollback,
} from '@/lib/server/brand-linesheet-syndication-server';

/** POST — batch unpublish + rollback stub (Wave TF). action: unpublish | rollback */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const collectionId =
    String(body.collectionId ?? '').trim() || PLATFORM_CORE_DEMO.collectionId;
  const action = String(body.action ?? 'unpublish').trim();
  const shopBuyerId = String(body.shopBuyerId ?? 'shop1').trim();
  const snapshotId = String(body.snapshotId ?? '').trim() || undefined;
  const articleIds = Array.isArray(body.articleIds)
    ? body.articleIds.map((id) => String(id).trim()).filter(Boolean)
    : [];

  if (action === 'rollback') {
    const outcome = await postBrandLinesheetBatchUnpublishRollback({
      collectionId,
      snapshotId,
      shopBuyerId,
    });
    return NextResponse.json(
      { ...outcome, storageMode: brandLinesheetSyndicationStorageMode() },
      { status: outcome.ok ? 200 : 422 }
    );
  }

  const outcome = await postBrandLinesheetBatchUnpublish({
    collectionId,
    articleIds,
    shopBuyerId,
  });
  return NextResponse.json(
    { ...outcome, storageMode: brandLinesheetSyndicationStorageMode() },
    { status: outcome.ok ? 200 : 422 }
  );
}
