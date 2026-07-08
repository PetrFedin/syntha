import { NextRequest, NextResponse } from 'next/server';

import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import {
  awardBrandCentricRfqQuoteServer,
  listBrandCentricRfqQuotesServer,
  upsertBrandCentricRfqQuoteServer,
} from '@/lib/server/brand-centric-rfq-quotes-repository';

function meta(requestId: string) {
  return { requestId, mode: getApiContractMode(), apiVersion: 'v1' as const };
}

/** GET /api/brand/b2b/centric-rfq/quotes?rfqId=…|collectionId+articleId */
export async function GET(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const { searchParams } = req.nextUrl;
  const result = await listBrandCentricRfqQuotesServer({
    rfqId: searchParams.get('rfqId') ?? undefined,
    collectionId: searchParams.get('collectionId') ?? undefined,
    articleId: searchParams.get('articleId') ?? undefined,
  });
  return NextResponse.json(
    {
      ok: true as const,
      rfqId: result.rfqId,
      quotes: result.quotes,
      storageMode: result.storageMode,
      meta: meta(requestId),
    },
    { headers: { 'x-request-id': requestId } }
  );
}

/** POST · add supplier quote card */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'INVALID_BODY', message: 'JSON body required' },
        meta: meta(requestId),
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const rfqId = String(body.rfqId ?? '').trim();
  const supplierId = String(body.supplierId ?? '').trim();
  const supplierName = String(body.supplierName ?? '').trim();
  const amountRub = Number(body.amountRub ?? 0);
  const leadTimeDays = Number(body.leadTimeDays ?? 0);
  if (!rfqId || !supplierId || !supplierName) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_FIELDS', message: 'rfqId, supplierId, supplierName required' },
        meta: meta(requestId),
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  try {
    const saved = await upsertBrandCentricRfqQuoteServer({
      rfqId,
      supplierId,
      supplierName,
      amountRub,
      leadTimeDays,
      validUntil: body.validUntil as string | undefined,
    });
    return NextResponse.json(
      {
        ok: true as const,
        quote: saved.quote,
        storageMode: saved.storageMode,
        meta: meta(requestId),
      },
      { headers: { 'x-request-id': requestId } }
    );
  } catch (err) {
    const code =
      err instanceof Error && err.message === 'RFQ_NOT_FOUND' ? 'RFQ_NOT_FOUND' : 'ERROR';
    return NextResponse.json(
      {
        ok: false as const,
        error: {
          code,
          message: code === 'RFQ_NOT_FOUND' ? 'RFQ not found' : 'Failed to save quote',
        },
        meta: meta(requestId),
      },
      { status: code === 'RFQ_NOT_FOUND' ? 404 : 500, headers: { 'x-request-id': requestId } }
    );
  }
}

/** PATCH · award quote → RFQ awarded + PG */
export async function PATCH(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const rfqId = String(body.rfqId ?? '').trim();
  const quoteId = String(body.quoteId ?? '').trim();
  if (!rfqId || !quoteId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_FIELDS', message: 'rfqId, quoteId required' },
        meta: meta(requestId),
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  try {
    const awarded = await awardBrandCentricRfqQuoteServer({ rfqId, quoteId });
    return NextResponse.json(
      {
        ok: true as const,
        rfqId,
        quotes: awarded.quotes,
        awardedQuoteId: awarded.awardedQuoteId,
        storageMode: awarded.storageMode,
        meta: meta(requestId),
      },
      { headers: { 'x-request-id': requestId } }
    );
  } catch (err) {
    const code =
      err instanceof Error && err.message === 'QUOTE_NOT_FOUND' ? 'QUOTE_NOT_FOUND' : 'ERROR';
    return NextResponse.json(
      {
        ok: false as const,
        error: { code, message: code === 'QUOTE_NOT_FOUND' ? 'Quote not found' : 'Award failed' },
        meta: meta(requestId),
      },
      { status: code === 'QUOTE_NOT_FOUND' ? 404 : 500, headers: { 'x-request-id': requestId } }
    );
  }
}
