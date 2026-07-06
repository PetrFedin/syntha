import { NextRequest, NextResponse } from 'next/server';

import type { Workshop2SketchPinTemplate } from '@/lib/production/workshop2-dossier-phase1.types';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import {
  brandSketchOrgTemplatesStorageMode,
  listBrandSketchOrgTemplatesServer,
  replaceBrandSketchOrgTemplatesServer,
} from '@/lib/server/brand-sketch-org-templates-repository';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET — sketch pin templates org-level для коллекции. */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'collectionId обязателен.' }, { status: 400 });
  }

  const templates = await listBrandSketchOrgTemplatesServer({
    collectionId,
    organizationId: auth.organizationId,
  });

  return NextResponse.json({
    ok: true,
    collectionId,
    templates,
    storageMode: toBffPgStorageMode(brandSketchOrgTemplatesStorageMode()),
  });
}

/** PUT — replace all templates (Wave S PG). */
export async function PUT(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: { collectionId?: string; templates?: Workshop2SketchPinTemplate[] } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const collectionId = body.collectionId?.trim() ?? '';
  if (!collectionId || !Array.isArray(body.templates)) {
    return NextResponse.json({ ok: false, messageRu: 'Нужны collectionId и templates.' }, { status: 400 });
  }

  const result = await replaceBrandSketchOrgTemplatesServer({
    collectionId,
    templates: body.templates,
    organizationId: auth.organizationId,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, messageRu: 'PG недоступен.' }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    storageMode: toBffPgStorageMode(result.storageMode),
    messageRu: 'Шаблоны sketch сохранены.',
  });
}
