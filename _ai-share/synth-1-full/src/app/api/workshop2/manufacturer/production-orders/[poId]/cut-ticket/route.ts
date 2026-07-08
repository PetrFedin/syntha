/**
 * PATCH — cut_ticket stub на production order (Wave UG).
 */
import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  buildProductionOrderCutTicketStub,
  type ProductionOrderCutTicketStub,
} from '@/lib/production/brand-op-production-order-cut-ticket';
import {
  getWorkshop2PurchaseOrderById,
  updateWorkshop2ProductionOrderCutTicket,
} from '@/lib/server/workshop2-purchase-order-repository';
import { WORKSHOP2_B2B_PRODUCTION_HANDOFF_SOURCE } from '@/lib/server/workshop2-b2b-production-handoff';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';
import { verifyProductionOrderCutTicketPg } from '@/lib/fashion/brand-op-wave-vq';

type RouteCtx = { params: Promise<{ poId: string }> };

export const GET = withWorkshop2ApiErrorRu(async function getMfrProductionOrderCutTicket(
  req: NextRequest,
  ctx: RouteCtx
) {
  const { poId } = await ctx.params;
  const productionOrderId = poId.trim();
  if (!productionOrderId) return jsonWorkshop2ErrorRu(400, 'invalid_path');

  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const po = await getWorkshop2PurchaseOrderById(productionOrderId);
  if (!po) return jsonWorkshop2ErrorRu(404, 'not_found');

  const verification = verifyProductionOrderCutTicketPg(po.cutTicket);

  return NextResponse.json({
    ok: true,
    productionOrderId,
    cutTicket: po.cutTicket,
    pgVerified: verification.ok,
    verifyReasonRu: verification.reasonRu,
    storageMode: 'postgres',
  });
});

export const PATCH = withWorkshop2ApiErrorRu(async function patchMfrProductionOrderCutTicket(
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

  const collectionId = String(b.collectionId ?? '').trim();
  const articleId = String(b.articleId ?? '').trim();
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

  const actor =
    resolveWorkshop2UpdatedBy(req, String(b.actor ?? ''), auth.actor) ?? 'brand-cut-ticket';

  const fromStub = b.cutTicket as ProductionOrderCutTicketStub | undefined;
  const cutTicket =
    fromStub && typeof fromStub === 'object'
      ? { ...fromStub, source: fromStub.source ?? 'patch_api' }
      : buildProductionOrderCutTicketStub({
          productionOrderId,
          collectionId,
          articleId,
          b2bOrderId: b.b2bOrderId != null ? String(b.b2bOrderId) : undefined,
          qty: b.qty != null ? Number(b.qty) : po.qty,
          brandStatus: b.status != null ? String(b.status) : undefined,
          ticketNo: b.ticketNo != null ? String(b.ticketNo) : undefined,
          payload:
            b.payload && typeof b.payload === 'object'
              ? (b.payload as Record<string, unknown>)
              : undefined,
        });

  const updated = await updateWorkshop2ProductionOrderCutTicket({
    id: productionOrderId,
    collectionId,
    articleId,
    cutTicket,
    actor,
  });
  if (!updated) {
    return jsonWorkshop2ErrorRu(500, 'update_failed', {
      messageRu: 'Не удалось сохранить cut_ticket в PG.',
    });
  }

  return NextResponse.json({
    ok: true,
    productionOrderId,
    cutTicket: updated.cutTicket,
    messageRu: `Техкарта ${updated.cutTicket.ticketNo ?? productionOrderId} сохранена на PO.`,
  });
});
