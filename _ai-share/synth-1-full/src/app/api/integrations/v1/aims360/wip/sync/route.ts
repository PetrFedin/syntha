import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateRequestId } from '@/lib/api/response-contract';
import { getApiContractMode } from '@/lib/runtime-mode';
import {
  PRODUCTION_WIP_STAGES,
  type ProductionWipStage,
} from '@/lib/integrations/spine/production-wip-persistence.file';
import { syncAims360Wip } from '@/lib/integrations/spine/order-tracking.service';
import {
  ensureSpineOperationalStoreReady,
  SPINE_WIP_WRITE_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { autoPullInboundShipmentTracking } from '@/lib/integrations/spine/spine-auto-inbound-tracking.service';
import { enqueueSyncJob } from '@/lib/integrations/spine/sync-jobs-persistence.file';

/** POST /api/integrations/v1/aims360/wip/sync */
export async function POST(req: NextRequest) {
  const requestId = getOrCreateRequestId(req);
  const mode = getApiContractMode();

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const productionOrderId = String(body.productionOrderId ?? '').trim();
  const b2bOrderId = String(body.b2bOrderId ?? body.wholesaleOrderId ?? '').trim();
  const poStageRaw = String(body.poStage ?? body.stage ?? 'cutting')
    .trim()
    .toLowerCase();

  if (!productionOrderId || !b2bOrderId) {
    return NextResponse.json(
      {
        ok: false as const,
        error: { code: 'BAD_REQUEST', message: 'productionOrderId and b2bOrderId required' },
        meta: { requestId, mode, apiVersion: 'v1' as const },
      },
      { status: 400, headers: { 'x-request-id': requestId } }
    );
  }

  const poStage = (
    PRODUCTION_WIP_STAGES.includes(poStageRaw as ProductionWipStage) ? poStageRaw : 'cutting'
  ) as ProductionWipStage;

  await ensureSpineOperationalStoreReady(SPINE_WIP_WRITE_SCOPES);

  const record = syncAims360Wip({
    productionOrderId,
    b2bOrderId,
    poStage,
    qtyComplete: typeof body.qtyComplete === 'number' ? body.qtyComplete : undefined,
    qtyTotal: typeof body.qtyTotal === 'number' ? body.qtyTotal : undefined,
  });

  let autoPull: Awaited<ReturnType<typeof autoPullInboundShipmentTracking>> | undefined;
  if (poStage === 'shipped') {
    autoPull = await autoPullInboundShipmentTracking({
      wholesaleOrderId: b2bOrderId,
      trigger: 'wip_shipped',
    });
  }

  enqueueSyncJob({ platform: 'aims360', kind: 'wip_sync', resultCount: 1 });

  return NextResponse.json(
    {
      ok: true as const,
      data: { wip: record, autoPull: autoPull ?? null },
      meta: { requestId, mode, apiVersion: 'v1' as const },
    },
    { headers: { 'x-request-id': requestId } }
  );
}
