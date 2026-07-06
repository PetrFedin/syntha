import { NextRequest, NextResponse } from 'next/server';

import {
  approveBrandCollaborativeMarginServer,
  getShopCollaborativeApprovalServer,
  shopCollaborativeApprovalStorageMode,
} from '@/lib/server/shop-collaborative-approval-repository';
import {
  defaultShopCollaborativeApprovalState,
  shopCollaborativeApprovalWaitingBrandMargin,
} from '@/lib/shop/shop-collaborative-approval-feed';

/** GET — snapshot margin co-approve для бренда (та же PG-сессия, что shop collaborative). */
export async function GET(req: NextRequest) {
  const buyerId = req.nextUrl.searchParams.get('buyerId')?.trim() || 'shop1';
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() ?? '';
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }

  const state =
    (await getShopCollaborativeApprovalServer({ buyerId, orderId })) ??
    defaultShopCollaborativeApprovalState({ buyerId, orderId });

  return NextResponse.json({
    ok: true,
    buyerId,
    orderId,
    state,
    waitingBrandMargin: shopCollaborativeApprovalWaitingBrandMargin(state),
    storageMode: shopCollaborativeApprovalStorageMode(),
    messageRu: state.marginDone
      ? 'Маржа согласована.'
      : state.matrixDone
        ? 'Ожидает согласования маржи брендом.'
        : 'Магазин ещё не зафиксировал матрицу.',
  });
}

/** POST — brand co-approve margin step (shared PG session). */
export async function POST(req: NextRequest) {
  let body: { buyerId?: string; orderId?: string; brandActorLabel?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное тело.' }, { status: 400 });
  }

  const buyerId = body.buyerId?.trim() || 'shop1';
  const orderId = body.orderId?.trim() ?? '';
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }

  const { state, advanced } = await approveBrandCollaborativeMarginServer({
    buyerId,
    orderId,
    brandActorLabel: body.brandActorLabel ?? 'brand',
  });

  return NextResponse.json({
    ok: true,
    state,
    advanced,
    storageMode: shopCollaborativeApprovalStorageMode(),
    messageRu: advanced
      ? 'Маржа согласована · магазин может отправить заказ.'
      : 'Сначала магазин фиксирует матрицу или маржа уже согласована.',
  });
}
