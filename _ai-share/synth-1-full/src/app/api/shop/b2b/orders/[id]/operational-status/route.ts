import { NextRequest, NextResponse } from 'next/server';

import { observeApiRoute } from '@/lib/server/observe-api-route';
import {
  getLatestShopB2bOperationalStatus,
  mergeShopB2bOperationalStatusJournal,
  shopB2bOperationalStatusStorageMode,
} from '@/lib/server/shop-b2b-operational-status-repository';
import { isShopB2bOperationalMirrorStatus } from '@/lib/order/shop-b2b-operational-status';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';

type RouteCtx = { params: Promise<{ id: string }> };

/** GET — последний зеркальный operational status для shop CO cabinet (PG journal). */
export async function GET(_req: NextRequest, ctx: RouteCtx) {
  return observeApiRoute(_req, 'shop.b2b.orders.operational-status.GET', async () => {
    const { id: raw } = await ctx.params;
    const orderId = raw?.trim();
    if (!orderId) {
      return NextResponse.json({ ok: false, messageRu: 'Не указан orderId.' }, { status: 400 });
    }

    const entry = await getLatestShopB2bOperationalStatus(orderId);
    return NextResponse.json({
      ok: true,
      orderId,
      status: entry?.status ?? null,
      entry,
      storageMode: shopB2bOperationalStatusStorageMode(),
    });
  });
}

/**
 * PATCH — зеркало исхода amend бренда в shop PG journal.
 * Тело: `{ "status": "amendment_approved"|"amendment_rejected"|"amendment_pending", "amendmentId"?: string }`.
 * Заголовок: `Idempotency-Key` (обязателен).
 */
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  return observeApiRoute(req, 'shop.b2b.orders.operational-status.PATCH', async () => {
    const { id: raw } = await ctx.params;
    const orderId = raw?.trim();
    if (!orderId) {
      return NextResponse.json({ ok: false, messageRu: 'Не указан orderId.' }, { status: 400 });
    }

    const idempotencyKey = req.headers.get('idempotency-key')?.trim();
    if (!idempotencyKey) {
      return NextResponse.json(
        { ok: false, messageRu: 'Заголовок Idempotency-Key обязателен.' },
        { status: 400 }
      );
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { ok: false, messageRu: 'Некорректное тело запроса.' },
        { status: 400 }
      );
    }

    const status = String(body.status ?? '').trim();
    if (!isShopB2bOperationalMirrorStatus(status)) {
      return NextResponse.json(
        {
          ok: false,
          messageRu: 'status: amendment_pending | amendment_approved | amendment_rejected',
        },
        { status: 400 }
      );
    }

    const order = await getWorkshop2B2bOrder(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, messageRu: 'B2B заказ не найден.' }, { status: 404 });
    }

    const result = await mergeShopB2bOperationalStatusJournal({
      orderId,
      status,
      amendmentId: String(body.amendmentId ?? '').trim() || undefined,
      idempotencyKey,
      source: String(body.source ?? 'brand_amend_mirror').trim() || 'brand_amend_mirror',
      payload:
        typeof body.payload === 'object' && body.payload !== null
          ? (body.payload as Record<string, unknown>)
          : {},
    });

    if (!result.ok) {
      const httpStatus = result.code === 'BAD_REQUEST' ? 400 : 409;
      return NextResponse.json({ ok: false, messageRu: result.message }, { status: httpStatus });
    }

    return NextResponse.json({
      ok: true,
      orderId,
      status: result.entry.status,
      updatedAt: result.entry.updatedAt,
      storageMode: shopB2bOperationalStatusStorageMode(),
      idempotentReplay: result.idempotentReplay,
      messageRu: 'Статус бренда синхронизирован с кабинетом магазина.',
    });
  });
}
