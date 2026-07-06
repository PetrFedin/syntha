import { NextRequest, NextResponse } from 'next/server';

import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import { summarizeWorkshop2B2bOrdersByRetailer } from '@/lib/server/workshop2-b2b-orders-summary';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

/** GET /api/brand/retailers/b2b-orders-summary — W2 B2B агрегаты для списка партнёров. */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? undefined;
  const rows = await summarizeWorkshop2B2bOrdersByRetailer(collectionId);
  const byRetailerId = Object.fromEntries(rows.map((r) => [r.retailerId, r]));
  return NextResponse.json({
    ok: true,
    collectionId: collectionId ?? null,
    storageMode: toBffPgStorageMode(isWorkshop2PostgresEnabled() ? 'postgres' : 'memory'),
    rows,
    byRetailerId,
    messageRu: rows.length
      ? `W2: заказы у ${rows.length} партнёр(ов)${collectionId ? ` · ${collectionId}` : ''}.`
      : 'W2: заказов пока нет — оформите через B2B matrix/checkout.',
  });
}
