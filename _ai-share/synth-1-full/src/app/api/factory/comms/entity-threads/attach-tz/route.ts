import { NextRequest, NextResponse } from 'next/server';

import type { FactoryCommsEntityThreadKind } from '@/lib/fashion/factory-comms-entity-thread-attach-tz';
import { attachFactoryCommsEntityThreadTzServer } from '@/lib/server/factory-comms-entity-thread-attach-tz';

/** POST · attach dossier TZ to manufacturer/supplier entity thread (comms pillar). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_BODY', message: 'JSON body required' } },
      { status: 400 }
    );
  }

  const variant = String(body.variant ?? '').trim();
  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const threadKind = String(body.threadKind ?? '').trim() as FactoryCommsEntityThreadKind;
  if (
    !collectionId ||
    !articleId ||
    !threadKind ||
    (variant !== 'manufacturer' && variant !== 'supplier')
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'variant, collectionId, articleId, threadKind required',
        },
      },
      { status: 400 }
    );
  }

  try {
    const saved = await attachFactoryCommsEntityThreadTzServer({
      variant,
      collectionId,
      articleId,
      threadKind,
    });
    return NextResponse.json({
      ok: true,
      messageId: saved.messageId,
      dossierHref: saved.dossierHref,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'THREAD_KIND_UNSUPPORTED') {
      return NextResponse.json(
        {
          ok: false,
          error: { code: 'THREAD_KIND_UNSUPPORTED', message: 'Thread kind not attachable' },
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: { code: 'ERROR', message: 'Attach TZ failed' } },
      { status: 500 }
    );
  }
}
