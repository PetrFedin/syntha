import { NextRequest, NextResponse } from 'next/server';

import type { ShopCollaborativeApprovalStepId } from '@/lib/shop/shop-collaborative-approval-feed';
import { SHOP_COLLABORATIVE_APPROVAL_STEP_ORDER } from '@/lib/shop/shop-collaborative-approval-feed';
import {
  advanceShopCollaborativeApprovalStepServer,
  getShopCollaborativeApprovalServer,
  shopCollaborativeApprovalStorageMode,
} from '@/lib/server/shop-collaborative-approval-repository';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

function resolveBuyerId(req: NextRequest, checkoutBuyerId: string, bodyBuyerId?: string): string {
  return resolveShopCoreBuyerIdFromRequest(
    req,
    bodyBuyerId ?? req.nextUrl.searchParams.get('buyerId') ?? checkoutBuyerId
  );
}

function resolveOrderId(req: NextRequest, bodyOrderId?: string): string {
  return (bodyOrderId ?? req.nextUrl.searchParams.get('orderId') ?? '').trim();
}

/** GET /api/shop/b2b/collaborative/approvals — PG / file / memory workflow state. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId);
  const orderId = resolveOrderId(req);
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }

  const state = await getShopCollaborativeApprovalServer({ buyerId, orderId });
  return NextResponse.json({
    ok: true,
    buyerId,
    orderId,
    state,
    storageMode: shopCollaborativeApprovalStorageMode(),
    messageRu: state
      ? 'Approval workflow загружен.'
      : 'Workflow не начат — подтвердите шаги на вкладке Approvals.',
  });
}

/** PATCH — advance one approval step (matrix → margin → submit). */
export async function PATCH(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId, String(body.buyerId ?? ''));
  const orderId = resolveOrderId(req, String(body.orderId ?? ''));
  const stepId = String(body.stepId ?? '').trim() as ShopCollaborativeApprovalStepId;

  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }
  if (!SHOP_COLLABORATIVE_APPROVAL_STEP_ORDER.includes(stepId)) {
    return NextResponse.json({ ok: false, messageRu: 'Неизвестный stepId.' }, { status: 400 });
  }

  const { state, advanced } = await advanceShopCollaborativeApprovalStepServer({
    buyerId,
    orderId,
    stepId,
    actor: 'shop',
  });

  return NextResponse.json({
    ok: true,
    state,
    advanced,
    storageMode: shopCollaborativeApprovalStorageMode(),
    messageRu: advanced
      ? `Шаг «${stepId}» подтверждён.`
      : stepId === 'margin'
        ? 'Маржу согласует бренд в той же PG-сессии.'
        : 'Шаг уже выполнен или заблокирован предыдущими.',
  });
}
