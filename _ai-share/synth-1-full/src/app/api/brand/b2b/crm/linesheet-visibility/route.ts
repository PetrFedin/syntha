import { NextRequest, NextResponse } from 'next/server';

import { brandCoCrmLinesheetVisibilityMessageRu } from '@/lib/b2b/brand-co-crm-wave-xb';
import { getBrandCoCrmLinesheetVisibilityServer } from '@/lib/server/brand-co-crm-linesheet-visibility-server';

/** GET /api/brand/b2b/crm/linesheet-visibility — PG buyer_segments → auto linesheet visibility (wave XB). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? 'SS27';
  const result = await getBrandCoCrmLinesheetVisibilityServer({ collectionId });

  return NextResponse.json({
    ok: true,
    collectionId: result.collectionId,
    rows: result.rows,
    summary: result.summary,
    storageMode: result.storageMode,
    messageRu: brandCoCrmLinesheetVisibilityMessageRu({
      autoVisible: result.summary.autoVisible,
      total: result.summary.total,
      storageMode: result.storageMode,
    }),
  });
}
