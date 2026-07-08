import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import { importZedonkConsolidatedOrder } from '@/lib/integrations/spine/zedonk-consolidated-import.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/zedonk/consolidated/import · Wave C7 */
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
        error: { code: 'INVALID_BODY', message: 'JSON required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const consolidatedId = String(body.consolidatedId ?? body.id ?? '').trim();
  const brandOrders = body.brandOrders as Array<{
    brandId: string;
    orderId: string;
    total?: number;
    source?: string;
  }>;
  if (!consolidatedId || !Array.isArray(brandOrders) || brandOrders.length === 0) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'MISSING_FIELDS', message: 'consolidatedId and brandOrders required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }
  const result = importZedonkConsolidatedOrder({ consolidatedId, brandOrders });
  enqueueSyncJob({ platform: 'zedonk', kind: 'zedonk_consolidated', resultCount: 1 });
  return NextResponse.json(
    { ok: true as const, data: { result }, meta: { requestId, mode, apiVersion: 'v1' as const } },
    { headers: { 'x-request-id': requestId } }
  );
}
