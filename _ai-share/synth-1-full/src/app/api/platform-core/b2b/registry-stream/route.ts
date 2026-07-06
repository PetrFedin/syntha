/**
 * GET — SSE push при новом/обновлённом B2B заказе (реестр brand/shop + thread previews).
 */
import { NextRequest, NextResponse } from 'next/server';
import { formatPlatformCoreB2bRegistrySseData } from '@/lib/platform-core-b2b-registry-sse';
import {
  isPlatformCoreB2bRegistryRedisEnabled,
  subscribePlatformCoreB2bRegistry,
} from '@/lib/server/platform-core-b2b-registry-hub';
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

      sendRaw(
        formatPlatformCoreB2bRegistrySseData({ type: 'ping', ts: new Date().toISOString() })
      );

      const onBump = (reason?: string) => {
        sendRaw(
          formatPlatformCoreB2bRegistrySseData({
            type: 'registry_update',
            ts: new Date().toISOString(),
            reason,
          })
        );
      };
      const unsubscribe = subscribePlatformCoreB2bRegistry(onBump);

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
      'X-Platform-Core-Registry-Sse': isPlatformCoreB2bRegistryRedisEnabled()
        ? 'bump+redis'
        : 'bump',
    },
  });
}
