import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { getCollectionLinesheetSnapshot } from '@/lib/integrations/spine/linesheet-gen.service';

/** GET /api/integrations/v1/linesheet/[collectionId] · latest P2-LINESHEET-GEN snapshot */
export async function GET(req: NextRequest, ctx: { params: Promise<{ collectionId: string }> }) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  const { collectionId } = await ctx.params;
  const cid = collectionId.trim();

  if (!cid) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_COLLECTION', message: 'collectionId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const linesheet = getCollectionLinesheetSnapshot(cid);

  return NextResponse.json(
    {
      ok: true as const,
      data: { linesheet: linesheet ?? null },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
