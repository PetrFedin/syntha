import { NextRequest, NextResponse } from 'next/server';

import { loadShopCollaborativeSessionSnapshot } from '@/lib/server/shop-collaborative-session-server';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

function resolveBuyerId(req: NextRequest, checkoutBuyerId: string): string {
  return resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutBuyerId
  );
}

function resolveOrderContext(req: NextRequest, body?: { orderId?: string; collection?: string }) {
  const orderId =
    body?.orderId?.trim() ||
    req.nextUrl.searchParams.get('orderId')?.trim() ||
    '';
  const collectionId =
    body?.collection?.trim() ||
    req.nextUrl.searchParams.get('collection')?.trim() ||
    'SS27';
  return { orderId, collectionId };
}

/** GET — poll-friendly snapshot совместной сессии (approvals + peers). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId);
  const { orderId, collectionId } = resolveOrderContext(req);

  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }

  const snapshot = await loadShopCollaborativeSessionSnapshot({ buyerId, orderId, collectionId });
  return NextResponse.json(snapshot);
}

/** POST — heartbeat / refresh той же PG-сессии (shop + brand co-approve sync). */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: { buyerId?: string; orderId?: string; collection?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(req, body.buyerId ?? checkoutAuth.buyerId);
  const { orderId, collectionId } = resolveOrderContext(req, body);

  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }

  const snapshot = await loadShopCollaborativeSessionSnapshot({ buyerId, orderId, collectionId });
  return NextResponse.json({ ...snapshot, heartbeatAt: new Date().toISOString() });
}
