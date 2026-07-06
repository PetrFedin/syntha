/**
 * PATCH — WIP/MES status с планшета цеха (Wave TZ · Wave WO wip_status PG).
 */
import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  resolveFactoryMesReleaseStage,
  factoryMesReleaseStageLabelRu,
  type FactoryMesReleaseStage,
} from '@/lib/production/workshop2-factory-mes-release-stage';
import {
  advanceWorkshop2FactoryMesReleaseStage,
  WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE,
} from '@/lib/server/workshop2-b2b-production-handoff';
import {
  getWorkshop2PurchaseOrderById,
  updateWorkshop2PurchaseOrderMesReleaseStage,
} from '@/lib/server/workshop2-purchase-order-repository';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ poId: string }> };

const FLOOR_TABLET_STAGES: readonly FactoryMesReleaseStage[] = ['cut', 'sew', 'qc', 'released'];

export const PATCH = withWorkshop2ApiErrorRu(async function patchMfrProductionOrderWipStatus(
  req: NextRequest,
  ctx: RouteCtx
) {
  const { poId } = await ctx.params;
  const productionOrderId = poId.trim();
  if (!productionOrderId) return jsonWorkshop2ErrorRu(400, 'invalid_path');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES, {
    bodyActorLabel: String(b.actor ?? ''),
  });
  if (auth instanceof NextResponse) return auth;

  const factoryId = String(b.factoryId ?? 'fact-1').trim();
  const collectionId = String(b.collectionId ?? '').trim();
  const articleId = String(b.articleId ?? '').trim();
  const advance = b.advance === true || String(b.mode ?? '') === 'advance';
  const stageRaw = b.stage != null ? String(b.stage).trim() : '';
  const stage = stageRaw ? resolveFactoryMesReleaseStage(stageRaw) : null;

  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_context', {
      messageRu: 'Укажите collectionId и articleId.',
    });
  }

  const po = await getWorkshop2PurchaseOrderById(productionOrderId);
  if (!po) return jsonWorkshop2ErrorRu(404, 'not_found');
  if (po.payload?.source !== WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE) {
    return jsonWorkshop2ErrorRu(409, 'invalid_po', {
      messageRu: 'Серия не из очереди B2B handoff.',
    });
  }
  if (po.supplierId !== factoryId) {
    return jsonWorkshop2ErrorRu(403, 'forbidden', {
      messageRu: `Серия назначена другому цеху (${po.supplierId}).`,
    });
  }

  const actor =
    resolveWorkshop2UpdatedBy(req, String(b.actor ?? ''), auth.actor) ?? 'factory-floor-tablet';

  if (advance) {
    const result = await advanceWorkshop2FactoryMesReleaseStage({
      factoryId,
      productionOrderId,
      collectionId,
      articleId,
      actor,
    });
    if (!result.ok) {
      return jsonWorkshop2ErrorRu(409, 'wip_advance_blocked', {
        messageRu: result.messageRu ?? 'MES-этап недоступен.',
      });
    }
    return NextResponse.json({
      ok: true,
      productionOrderId,
      previousStage: result.previousStage,
      stage: result.stage,
      wipStatus: result.stage,
      stageLabelRu: result.stage ? factoryMesReleaseStageLabelRu(result.stage) : undefined,
      messageRu: result.messageRu ?? 'WIP продвинут.',
    });
  }

  if (!stage || !FLOOR_TABLET_STAGES.includes(stage)) {
    return jsonWorkshop2ErrorRu(400, 'invalid_stage', {
      messageRu: `stage: ${FLOOR_TABLET_STAGES.join(' | ')} или advance=true.`,
    });
  }

  if (po.status !== 'synced') {
    return jsonWorkshop2ErrorRu(409, 'po_not_synced', {
      messageRu: 'Сначала примите серию в очереди передачи.',
    });
  }

  const updated = await updateWorkshop2PurchaseOrderMesReleaseStage({
    id: productionOrderId,
    collectionId,
    articleId,
    stage,
    actor,
  });
  if (!updated) {
    return jsonWorkshop2ErrorRu(500, 'update_failed', {
      messageRu: 'Не удалось обновить WIP в PG.',
    });
  }

  return NextResponse.json({
    ok: true,
    productionOrderId,
    stage: updated.mesReleaseStage,
    wipStatus: updated.wipStatus,
    stageLabelRu: factoryMesReleaseStageLabelRu(updated.mesReleaseStage),
    messageRu: `WIP: ${factoryMesReleaseStageLabelRu(updated.wipStatus)}.`,
  });
});
