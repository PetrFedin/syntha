import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import {
  importCentricRfq,
  acknowledgeCentricRfq,
} from '@/lib/integrations/spine/centric-rfq-import.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/centric/rfq/import · Wave D3 F-PROCUREMENT */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'INVALID_BODY', message: 'JSON body required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const rfqId = String(body.rfqId ?? body.RfqId ?? '').trim();
  const styleId = String(body.styleId ?? body.StyleId ?? rfqId).trim();
  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  if (!rfqId || !collectionId || !articleId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_FIELDS', message: 'rfqId, collectionId, articleId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const record = await importCentricRfq({
    rfqId,
    styleId,
    collectionId,
    articleId,
    b2bOrderId: body.b2bOrderId as string | undefined,
    productionOrderId: body.productionOrderId as string | undefined,
    status: body.status as 'open' | 'quoted' | 'awarded' | undefined,
    lines: body.lines as Parameters<typeof importCentricRfq>[0]['lines'],
  });

  enqueueSyncJob({ platform: 'centric', kind: 'rfq_import', resultCount: 1 });

  return NextResponse.json(
    {
      ok: true as const,
      data: { rfq: record },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}

/** PATCH · quote/award RFQ + PG write-through */
export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const rfqId = String(body.rfqId ?? body.RfqId ?? '').trim();
  if (!rfqId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_ID', message: 'rfqId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const record = await acknowledgeCentricRfq({
    rfqId,
    status: body.status as 'quoted' | 'awarded' | undefined,
  });
  if (!record) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'NOT_FOUND', message: 'RFQ not found' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 404, headers: { 'x-request-id': requestId } }
    );
  }
  enqueueSyncJob({ platform: 'centric', kind: 'rfq_ack', resultCount: 1 });
  return NextResponse.json(
    {
      ok: true as const,
      data: { rfq: record },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
