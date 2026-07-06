import { NextRequest, NextResponse } from 'next/server';

import { writeShopRepCommissionLedgerPayout } from '@/lib/server/workshop2-b2b-commission-repository';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** POST — записать payout в PG commission ledger (Wave VB canonical). */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: {
    repId?: string;
    orderIds?: string[];
    organizationId?: string;
    action?: 'payout_request';
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const repId = String(body.repId ?? '').trim();
  if (!repId) {
    return NextResponse.json(
      { ok: false, error: 'missing_rep_id', messageRu: 'Укажите repId.' },
      { status: 400 }
    );
  }

  const orderIds = Array.isArray(body.orderIds)
    ? body.orderIds.map((id) => String(id).trim()).filter(Boolean)
    : undefined;

  const result = await writeShopRepCommissionLedgerPayout({
    repId,
    orderIds,
    organizationId: body.organizationId,
    action: body.action ?? 'payout_request',
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: 'ledger_write_blocked',
        storageMode: result.storageMode,
        messageRu: result.messageRu,
      },
      { status: result.storageMode === 'unavailable' ? 503 : 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    repId,
    updatedCount: result.updatedCount,
    storageMode: result.storageMode,
    messageRu: result.messageRu,
  });
}
