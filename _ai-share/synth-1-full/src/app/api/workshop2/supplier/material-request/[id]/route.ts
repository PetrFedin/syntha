/**
 * PATCH — ответ поставщика на sample-material-request (confirmed | rejected).
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkshop2MaterialRequisitionById,
  type Workshop2MaterialRequisitionSupplierStatus,
} from '@/lib/server/workshop2-material-requisition-repository';
import {
  parseSupplierMaterialPartialShipFields,
  supplierMaterialPartialShipJournalFields,
} from '@/lib/production/workshop2-supplier-material-partial-ship';
import { confirmWorkshop2SupplierMaterialRequest } from '@/lib/server/workshop2-supplier-material-request-confirm';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';

type RouteCtx = { params: Promise<{ id: string }> };

function parseSupplierStatus(value: unknown): Workshop2MaterialRequisitionSupplierStatus | null {
  const s = String(value ?? '')
    .trim()
    .toLowerCase();
  if (s === 'confirmed' || s === 'rejected') return s;
  return null;
}

export const PATCH = withWorkshop2ApiErrorRu(async function patchSupplierMaterialRequest(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await ctx.params;
  const reqId = decodeURIComponent(id).trim();
  if (!reqId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_path');
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const status = parseSupplierStatus(body.status);
  if (!status) {
    return jsonWorkshop2ErrorRu(400, 'invalid_status', {
      messageRu: 'Укажите status: confirmed или rejected.',
    });
  }

  const note = body.note != null ? String(body.note) : undefined;
  const updatedBy = resolveWorkshop2UpdatedBy(req, String(body.updatedBy ?? ''), auth.actor);
  const b2bOrderId = String(body.b2bOrderId ?? '').trim();
  const { shippedQty, backorder } = parseSupplierMaterialPartialShipFields(body);

  const existing = await getWorkshop2MaterialRequisitionById(reqId);
  if (!existing) {
    return jsonWorkshop2ErrorRu(404, 'not_found');
  }

  const result = await confirmWorkshop2SupplierMaterialRequest({
    requisitionId: reqId,
    status,
    note,
    updatedBy: updatedBy ?? undefined,
    b2bOrderId: b2bOrderId || undefined,
    shippedQty,
    backorder,
  });
  if (!result) {
    return jsonWorkshop2ErrorRu(404, 'not_found');
  }

  const statusRu = status === 'confirmed' ? 'подтверждена' : 'отклонена';
  const journal = supplierMaterialPartialShipJournalFields({
    shippedQty: result.requisition.partialShipQty ?? shippedQty ?? null,
    backorder: result.requisition.backorderFlag ?? backorder === true,
    status,
  });

  return NextResponse.json({
    ok: true,
    idempotent: result.idempotent,
    requisition: result.requisition,
    ...journal,
    messageRu: result.idempotent
      ? `Заявка уже ${statusRu} — повторное подтверждение не требуется.`
      : `Заявка ${statusRu} — зеркало досье и чат обновлены.`,
  });
});
