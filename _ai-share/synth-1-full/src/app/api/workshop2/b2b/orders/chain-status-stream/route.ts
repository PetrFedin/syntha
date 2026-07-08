/**
 * GET — SSE push при смене chain-status (poll + in-process hub bump).
 * Query: orderIds — comma-separated, max 16.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  fingerprintWorkshop2B2bChains,
  formatPlatformCoreChainStatusSseData,
} from '@/lib/platform-core-chain-status-sse';
import { getWorkshop2B2bChainStatus } from '@/lib/server/workshop2-b2b-production-handoff';
import {
  isPlatformCoreChainStatusRedisEnabled,
  subscribePlatformCoreChainStatus,
} from '@/lib/server/platform-core-chain-status-hub';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ORDERS = 16;
const POLL_MS = 8_000;

export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const raw = req.nextUrl.searchParams.get('orderIds')?.trim() ?? '';
  const orderIds = [
    ...new Set(
      raw
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    ),
  ].slice(0, MAX_ORDERS);

  if (orderIds.length === 0) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите orderIds через запятую.' },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();
  let lastFingerprint = '';
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
          const entries = await Promise.all(
            orderIds.map(
              async (orderId) => [orderId, await getWorkshop2B2bChainStatus(orderId)] as const
            )
          );
          const chains = Object.fromEntries(entries);
          const fingerprint = fingerprintWorkshop2B2bChains(chains);
          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            sendRaw(
              formatPlatformCoreChainStatusSseData({
                type: 'chain_update',
                ts: new Date().toISOString(),
                orderIds,
                fingerprint,
              })
            );
          }
        } catch {
          /* best-effort */
        }
      };

      sendRaw(formatPlatformCoreChainStatusSseData({ type: 'ping', ts: new Date().toISOString() }));
      void poll();

      const onBump = () => void poll();
      const unsubscribe = subscribePlatformCoreChainStatus(onBump);
      pollTimer = setInterval(() => void poll(), POLL_MS);

      req.signal.addEventListener('abort', () => {
        if (pollTimer) clearInterval(pollTimer);
        unsubscribe();
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
      'X-Platform-Core-Chain-Sse': isPlatformCoreChainStatusRedisEnabled()
        ? 'poll+bump+redis'
        : 'poll+bump',
    },
  });
}
