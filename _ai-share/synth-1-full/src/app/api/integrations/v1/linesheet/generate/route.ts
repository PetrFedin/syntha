import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { generateCollectionLinesheet } from '@/lib/integrations/spine/linesheet-gen.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/linesheet/generate · Wave D4 P2-LINESHEET-GEN */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const collectionId = String(
    body.collectionId ?? req.nextUrl.searchParams.get('collectionId') ?? ''
  ).trim();
  if (!collectionId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_COLLECTION', message: 'collectionId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const result = await generateCollectionLinesheet(collectionId);
  enqueueSyncJob({ platform: 'syntha', kind: 'linesheet_gen', resultCount: 1 });
  return NextResponse.json(
    {
      ok: true as const,
      data: { linesheet: result },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
