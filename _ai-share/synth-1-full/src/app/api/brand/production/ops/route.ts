import { NextRequest, NextResponse } from 'next/server';

import type { BrandProductionOpsLocalSyncPayload } from '@/lib/production/brand-production-ops-local-sync';
import { summarizeBrandProductionOpsLocalSyncRu } from '@/lib/production/brand-production-ops-local-sync';
import {
  getBrandProductionOpsSnapshot,
  syncBrandProductionOpsFromLocal,
} from '@/lib/server/brand-production-ops-repository';

/** GET — PO + BOM snapshot for brand production ops (workshop2_purchase_orders + requisitions). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim();
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim();
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите collectionId.' }, { status: 400 });
  }

  const snapshot = await getBrandProductionOpsSnapshot({ collectionId, orderId });

  return NextResponse.json({
    ok: true,
    ...snapshot,
    messageRu:
      snapshot.poRows.length || snapshot.bomRows.length
        ? `PO: ${snapshot.poRows.length} · BOM: ${snapshot.bomRows.length} · ${snapshot.storageMode}`
        : 'Нет PG данных — local model.',
  });
}

/** POST — sync local PO/BOM model → PG spine. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const action = String(body.action ?? 'sync-local').trim();
  if (action !== 'sync-local') {
    return NextResponse.json({ ok: false, messageRu: 'Unknown action.' }, { status: 400 });
  }

  const payload = body.payload as BrandProductionOpsLocalSyncPayload | undefined;
  if (!payload?.targetCollectionId?.trim()) {
    return NextResponse.json(
      { ok: false, messageRu: 'payload.targetCollectionId required.' },
      { status: 400 }
    );
  }

  const result = await syncBrandProductionOpsFromLocal({ payload });
  return NextResponse.json({
    ok: true,
    poSynced: result.poSynced,
    bomSynced: result.bomSynced,
    ...result.snapshot,
    messageRu: summarizeBrandProductionOpsLocalSyncRu(result),
  });
}
