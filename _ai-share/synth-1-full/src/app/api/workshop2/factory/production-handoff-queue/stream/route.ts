/**
 * GET — SSE push при изменении factory production handoff queue.
 * Query: factoryId (default fact-1).
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  fingerprintWorkshop2HandoffQueue,
  formatPlatformCoreHandoffQueueSseData,
} from '@/lib/platform-core-handoff-queue-sse';
import { listWorkshop2FactoryProductionHandoffQueue } from '@/lib/server/workshop2-b2b-production-handoff';
import {
  isPlatformCoreHandoffQueueRedisEnabled,
  subscribePlatformCoreHandoffQueue,
} from '@/lib/server/platform-core-handoff-queue-hub';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POLL_MS = 10_000;

export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const factoryId = req.nextUrl.searchParams.get('factoryId')?.trim() || 'fact-1';
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
          const queue = await listWorkshop2FactoryProductionHandoffQueue({ factoryId });
          const fingerprint = fingerprintWorkshop2HandoffQueue(queue.items);
          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            sendRaw(
              formatPlatformCoreHandoffQueueSseData({
                type: 'handoff_queue_update',
                ts: new Date().toISOString(),
                factoryId,
                fingerprint,
              })
            );
          }
        } catch {
          /* best-effort */
        }
      };

      sendRaw(
        formatPlatformCoreHandoffQueueSseData({ type: 'ping', ts: new Date().toISOString() })
      );
      void poll();

      const onBump = () => void poll();
      const unsubscribe = subscribePlatformCoreHandoffQueue(onBump);
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
      'X-Platform-Core-Handoff-Sse': isPlatformCoreHandoffQueueRedisEnabled()
        ? 'poll+bump+redis'
        : 'poll+bump',
    },
  });
}
