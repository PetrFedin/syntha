import { NextRequest, NextResponse } from 'next/server';

import type { CycleCountSession } from '@/lib/shop/cycle-counting';
import { getShopInventoryReconcileRows } from '@/lib/server/shop-inventory-reconcile-server';

function resolveShopId(req: NextRequest): string {
  return req.nextUrl.searchParams.get('shopId')?.trim() || 'shop1';
}

/** GET /api/shop/inventory/reconcile/rows — PG ledger ATP vs cycle-count physical. */
export async function GET(req: NextRequest) {
  const shopId = resolveShopId(req);
  const collectionId = req.nextUrl.searchParams.get('collection')?.trim() || undefined;
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(Number(limitRaw) || 12, 1), 48) : 12;

  let cycleSessions: CycleCountSession[] | undefined;
  const sessionsRaw = req.nextUrl.searchParams.get('cycleSessions');
  if (sessionsRaw) {
    try {
      const parsed = JSON.parse(sessionsRaw) as CycleCountSession[];
      if (Array.isArray(parsed)) cycleSessions = parsed;
    } catch {
      /* optional */
    }
  }

  const result = await getShopInventoryReconcileRows({
    shopId,
    collectionId,
    cycleSessions,
    limit,
  });

  return NextResponse.json({
    ok: true,
    shopId,
    ...result,
  });
}

/** POST — same as GET but cycleSessions in JSON body (from cycle-count UI). */
export async function POST(req: NextRequest) {
  const shopId = resolveShopId(req);
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const collectionId =
    String(body.collectionId ?? req.nextUrl.searchParams.get('collection') ?? '').trim() ||
    undefined;
  const limit = Math.min(Math.max(Number(body.limit) || 12, 1), 48);
  const cycleSessions = Array.isArray(body.cycleSessions)
    ? (body.cycleSessions as CycleCountSession[])
    : undefined;

  const result = await getShopInventoryReconcileRows({
    shopId: String(body.shopId ?? shopId).trim() || shopId,
    collectionId,
    cycleSessions,
    limit,
  });

  return NextResponse.json({
    ok: true,
    shopId: String(body.shopId ?? shopId).trim() || shopId,
    ...result,
  });
}
