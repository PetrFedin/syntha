import { NextRequest, NextResponse } from 'next/server';

import type { RangePlannerOverlayDoc } from '@/lib/production/workshop2-range-planner-overlay';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import {
  brandRangePlannerOverlayStorageMode,
  getBrandRangePlannerOverlayServer,
  putBrandRangePlannerOverlayServer,
} from '@/lib/server/brand-range-planner-overlay-repository';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET — PG overlay range planner для коллекции. */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'collectionId обязателен.' }, { status: 400 });
  }

  const overlay = await getBrandRangePlannerOverlayServer({
    collectionId,
    organizationId: auth.organizationId,
  });

  return NextResponse.json({
    ok: true,
    collectionId,
    overlay,
    storageMode: toBffPgStorageMode(brandRangePlannerOverlayStorageMode()),
    messageRu: overlay ? 'Overlay загружен из PG.' : 'Overlay не найден — синхронизируйте из development-status.',
  });
}

/** PUT — persist overlay (Wave S, без dual-write localStorage в core). */
export async function PUT(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: { collectionId?: string; overlay?: RangePlannerOverlayDoc } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const collectionId = body.collectionId?.trim() ?? body.overlay?.collectionId?.trim() ?? '';
  if (!collectionId || !body.overlay) {
    return NextResponse.json({ ok: false, messageRu: 'Нужны collectionId и overlay.' }, { status: 400 });
  }

  const result = await putBrandRangePlannerOverlayServer({
    collectionId,
    overlay: body.overlay,
    organizationId: auth.organizationId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, messageRu: 'PG недоступен — overlay не сохранён.', storageMode: toBffPgStorageMode(result.storageMode) },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    collectionId,
    storageMode: toBffPgStorageMode(result.storageMode),
    messageRu: 'Overlay сохранён в PG.',
  });
}
