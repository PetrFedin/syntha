import { NextRequest, NextResponse } from 'next/server';

import {
  listBrandCrmSegmentsServer,
  patchBrandCrmSegmentServer,
  reorderBrandCrmSegmentsServer,
} from '@/lib/server/brand-crm-segments-repository';

/** GET — brand CRM segments as persisted objects (PG seed on empty). */
export async function GET(_req: NextRequest) {
  const result = await listBrandCrmSegmentsServer();
  return NextResponse.json({
    ok: true,
    segments: result.segments,
    storageMode: result.storageMode,
    messageRu:
      result.storageMode === 'pg'
        ? `${result.segments.length} сегмент(ов) · PG`
        : `${result.segments.length} сегмент(ов) · ${result.storageMode}`,
  });
}

/** PATCH · update segment net terms / discount. */
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_BODY' } }, { status: 400 });
  }
  const segmentKey = String(body.segmentKey ?? '').trim();
  const reorderSegmentKeys = Array.isArray(body.reorderSegmentKeys)
    ? body.reorderSegmentKeys.map((key) => String(key).trim()).filter(Boolean)
    : null;

  if (reorderSegmentKeys?.length) {
    const reordered = await reorderBrandCrmSegmentsServer({ segmentKeys: reorderSegmentKeys });
    return NextResponse.json({
      ok: true,
      segments: reordered.segments,
      storageMode: reordered.storageMode,
    });
  }

  if (!segmentKey) {
    return NextResponse.json({ ok: false, error: { code: 'MISSING_FIELDS' } }, { status: 400 });
  }
  const defaultNetTermDays =
    body.defaultNetTermDays !== undefined && Number.isFinite(Number(body.defaultNetTermDays))
      ? Number(body.defaultNetTermDays)
      : undefined;
  const firstOrderDiscountPct =
    body.firstOrderDiscountPct === null
      ? null
      : body.firstOrderDiscountPct !== undefined && Number.isFinite(Number(body.firstOrderDiscountPct))
        ? Number(body.firstOrderDiscountPct)
        : undefined;

  const saved = await patchBrandCrmSegmentServer({
    segmentKey,
    defaultNetTermDays,
    firstOrderDiscountPct,
  });
  if (!saved.segment) {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }
  const listed = await listBrandCrmSegmentsServer();
  return NextResponse.json({
    ok: true,
    segment: saved.segment,
    segments: listed.segments,
    storageMode: saved.storageMode,
  });
}
