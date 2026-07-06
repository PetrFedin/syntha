/**
 * GET — SSE push при смене collaborative session (PG approvals revision).
 * Query: orderId, buyerId, collection
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  formatShopCollaborativeSessionSseData,
  loadShopCollaborativeSessionSnapshot,
  SHOP_COLLABORATIVE_SESSION_SSE_POLL_MS,
} from '@/lib/server/shop-collaborative-session-server';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() ?? '';
  const collectionId = req.nextUrl.searchParams.get('collection')?.trim() || 'SS27';

  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let lastRevision = '';
  let pollTimer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const sendRaw = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* client disconnected */
        }
      };

      const poll = async () => {
        try {
          const snapshot = await loadShopCollaborativeSessionSnapshot({
            buyerId,
            orderId,
            collectionId,
          });
          if (snapshot.sessionRevision !== lastRevision) {
            lastRevision = snapshot.sessionRevision;
            sendRaw(
              formatShopCollaborativeSessionSseData({
                type: 'session_update',
                ts: new Date().toISOString(),
                sessionRevision: snapshot.sessionRevision,
                waitingBrandMargin: snapshot.session.waitingBrandMargin,
                summary: snapshot.session.summary,
              })
            );
          }
        } catch {
          /* best-effort */
        }
      };

      sendRaw(
        formatShopCollaborativeSessionSseData({ type: 'ping', ts: new Date().toISOString() })
      );
      void poll();
      pollTimer = setInterval(() => void poll(), SHOP_COLLABORATIVE_SESSION_SSE_POLL_MS);

      req.signal.addEventListener('abort', () => {
        if (pollTimer) clearInterval(pollTimer);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Shop-Collaborative-Sse': 'poll+revision',
    },
  });
}
