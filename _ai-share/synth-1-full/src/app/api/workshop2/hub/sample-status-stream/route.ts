/**
 * GET — SSE push при смене sample rollup (poll + development-status hub bump).
 * Query: collectionId или articles=col:art,…
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  fingerprintWorkshop2SampleRollup,
  formatPlatformCoreSampleStatusSseData,
} from '@/lib/platform-core-sample-status-sse';
import {
  buildWorkshop2HubProductionRollupSnapshot,
  parseWorkshop2HubArticleScope,
} from '@/lib/server/workshop2-hub-production-rollup-server';
import {
  isPlatformCoreDevelopmentStatusRedisEnabled,
  subscribePlatformCoreDevelopmentStatus,
} from '@/lib/server/platform-core-development-status-hub';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POLL_MS = 8_000;

export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const articleScope = parseWorkshop2HubArticleScope(req.nextUrl.searchParams.get('articles'));

  if (!collectionId && articleScope.length === 0) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите collectionId или articles=col:art,col:art.' },
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
          const rollup = await buildWorkshop2HubProductionRollupSnapshot({
            collectionId: collectionId || undefined,
            articleScope: articleScope.length > 0 ? articleScope : undefined,
          });
          if (!rollup) return;
          const fingerprint = fingerprintWorkshop2SampleRollup(rollup);
          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            sendRaw(
              formatPlatformCoreSampleStatusSseData({
                type: 'sample_update',
                ts: new Date().toISOString(),
                collectionId: rollup.collectionId ?? collectionId ?? 'multi',
                fingerprint,
              })
            );
          }
        } catch {
          /* best-effort */
        }
      };

      sendRaw(
        formatPlatformCoreSampleStatusSseData({ type: 'ping', ts: new Date().toISOString() })
      );
      void poll();

      const onBump = () => void poll();
      const unsubscribe = subscribePlatformCoreDevelopmentStatus(onBump);
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
      'X-Platform-Core-Sample-Sse': isPlatformCoreDevelopmentStatusRedisEnabled()
        ? 'poll+bump+redis'
        : 'poll+bump',
    },
  });
}
