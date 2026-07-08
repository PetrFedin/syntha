/**
 * GET — SSE push при новом contextual message / обновлении inbox.
 */
import { NextRequest, NextResponse } from 'next/server';
import { formatPlatformCoreCommsInboxSseData } from '@/lib/platform-core-comms-inbox-sse';
import {
  isPlatformCoreCommsInboxRedisEnabled,
  subscribePlatformCoreCommsInbox,
} from '@/lib/server/platform-core-comms-inbox-hub';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendRaw = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* client disconnected */
        }
      };

      sendRaw(formatPlatformCoreCommsInboxSseData({ type: 'ping', ts: new Date().toISOString() }));

      const onBump = () => {
        sendRaw(
          formatPlatformCoreCommsInboxSseData({
            type: 'inbox_update',
            ts: new Date().toISOString(),
          })
        );
      };
      const unsubscribe = subscribePlatformCoreCommsInbox(onBump);

      req.signal.addEventListener('abort', () => {
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
      'X-Platform-Core-Comms-Inbox-Sse': isPlatformCoreCommsInboxRedisEnabled()
        ? 'bump+redis'
        : 'bump',
    },
  });
}
