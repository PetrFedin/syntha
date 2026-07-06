import { NextRequest, NextResponse } from 'next/server';
import { listBrandCoRegistryPendingAmendments } from '@/lib/server/brand-co-registry-amend-server';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET /api/brand/b2b/registry/amendments — очередь pending amend для реестра CO (wave WL). */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? 'SS27';
  const partner =
    req.nextUrl.searchParams.get('partner')?.trim() ||
    req.nextUrl.searchParams.get('buyerId')?.trim() ||
    'all';

  const pending = await listBrandCoRegistryPendingAmendments({ collectionId, partner });
  const storageMode = isWorkshop2PostgresEnabled() ? 'pg' : 'file';

  return NextResponse.json({
    ok: true,
    collectionId,
    partner,
    storageMode,
    pending,
    count: pending.length,
    messageRu:
      pending.length > 0
        ? `${pending.length} заявка(ок) на изменение · ${collectionId}${partner !== 'all' ? ` · ${partner}` : ''}.`
        : `Нет активных заявок на изменение · ${collectionId}.`,
  });
}
