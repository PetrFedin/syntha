import { NextRequest, NextResponse } from 'next/server';

import { listWorkshop2B2bCommissionsForRep } from '@/lib/production/workshop2-b2b-commission';
import {
  listWorkshop2B2bCommissionLinesForOrganization,
  shopRepCommissionLedgerStorageMode,
  writeShopRepCommissionLedgerPayout,
} from '@/lib/server/workshop2-b2b-commission-repository';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET — rep commission ledger (PG seed on empty). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const repId = req.nextUrl.searchParams.get('repId')?.trim();
  if (!repId) {
    return NextResponse.json(
      { ok: false, error: 'repId_required', messageRu: 'Укажите repId в query.' },
      { status: 400 }
    );
  }

  const pgLines = await listWorkshop2B2bCommissionLinesForOrganization({
    repId,
    limit: 100,
    seedIfEmpty: true,
  });
  const storageMode = shopRepCommissionLedgerStorageMode(pgLines.length);
  const summary = listWorkshop2B2bCommissionsForRep({
    repId,
    lines: pgLines.length > 0 ? pgLines : undefined,
  });

  return NextResponse.json({
    ok: true,
    repId: summary.repId,
    orderCount: summary.orderCount,
    totalCommissionRub: summary.totalCommissionRub,
    lines: summary.lines,
    storageMode,
    messageRu:
      summary.orderCount > 0
        ? `${summary.orderCount} заказ(ов) · ${summary.totalCommissionRub.toLocaleString('ru-RU')} ₽ (${storageMode === 'postgres' ? 'PG' : storageMode} ledger).`
        : storageMode === 'unavailable'
          ? 'Ledger недоступен — нужен PostgreSQL (core fail-closed).'
          : 'Нет строк ledger для repId.',
  });
}

/** POST — запись payout в PG ledger (payout_pending). */
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
