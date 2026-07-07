import { NextResponse } from 'next/server';
import { readJsonBody } from '@/lib/http/read-json-body';
import {
  parseSewingPatternPreviewBody,
  runSewingPatternPreview,
} from '@/lib/pattern-drafting/sewing-pattern-preview.request';
import { rateLimitAllow, requestClientKey } from '@/lib/server/simple-rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST — серверная сборка учебного SVG (без persist). Для очереди, headless job, A/B и будущего CAD.
 * Rate limit: 30 / мин / ключ (IP + UA).
 */
export async function POST(request: Request) {
  if (!rateLimitAllow(requestClientKey(request, 'sewing-preview'), 30, 60_000)) {
    return NextResponse.json({ ok: false as const, error: 'rate_limited' }, { status: 429 });
  }
  try {
    const body = await readJsonBody<unknown>(request);
    const parsed = parseSewingPatternPreviewBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false as const, error: parsed.error }, { status: 400 });
    }
    const result = runSewingPatternPreview(parsed.options, parsed.applyWatermark);
    return NextResponse.json(
      {
        ok: true as const,
        result: {
          svg: result.svg,
          viewBox: result.viewBox,
          widthMm: result.widthMm,
          heightMm: result.heightMm,
          downloadFileName: result.downloadFileName,
          notes: result.notes,
          buildLog: result.buildLog,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: false as const, error: 'bad_json' }, { status: 400 });
  }
}
