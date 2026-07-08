import { NextRequest, NextResponse } from 'next/server';

import type { BrandCommsEntityThreadKind } from '@/lib/fashion/brand-comms-entity-threads';
import { attachBrandCommsEntityThreadTzServer } from '@/lib/server/brand-comms-entity-thread-attach-tz';

/** POST · attach dossier TZ to BOM/sample entity thread (comms pillar). */
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

  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const threadKind = String(body.threadKind ?? '').trim() as BrandCommsEntityThreadKind;
  if (!collectionId || !articleId || !threadKind) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'MISSING_FIELDS', message: 'collectionId, articleId, threadKind required' },
      },
      { status: 400 }
    );
  }

  try {
    const saved = await attachBrandCommsEntityThreadTzServer({
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
          error: { code: 'THREAD_KIND_UNSUPPORTED', message: 'Only bom/sample threads' },
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
