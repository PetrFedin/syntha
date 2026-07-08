import { NextRequest, NextResponse } from 'next/server';

import type { BrandProductionState } from '@/lib/brand-production/types';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import {
  brandProductionOpsStorageMode,
  getBrandProductionOpsStateServer,
  putBrandProductionOpsStateServer,
} from '@/lib/server/brand-production-ops-repository';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

/** GET — brand production ops state (Wave S PG). */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { state, storageMode } = await getBrandProductionOpsStateServer(auth.organizationId);
  return NextResponse.json({
    ok: true,
    state,
    storageMode: toBffPgStorageMode(storageMode),
  });
}

/** PUT — persist ops state snapshot. */
export async function PUT(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: { state?: BrandProductionState } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }
  if (!body.state) {
    return NextResponse.json({ ok: false, messageRu: 'Нужен state.' }, { status: 400 });
  }

  const result = await putBrandProductionOpsStateServer({
    organizationId: auth.organizationId,
    state: body.state,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, messageRu: 'PG недоступен.' }, { status: 503 });
  }
  return NextResponse.json({
    ok: true,
    storageMode: toBffPgStorageMode(brandProductionOpsStorageMode()),
    messageRu: 'Состояние производства сохранено в PG.',
  });
}
