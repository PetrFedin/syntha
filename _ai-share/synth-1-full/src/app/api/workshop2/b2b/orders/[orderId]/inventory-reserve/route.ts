/**
 * GET / PATCH — WMS inventory reserve под B2B заказ (S3).
 * PATCH идемпотентно: повтор не создаёт второй резерв, обновляет chain-status SSE.
 */
import { NextRequest, NextResponse } from 'next/server';
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  getWorkshop2B2bInventoryReserve,
  patchWorkshop2B2bInventoryReserve,
} from '@/lib/server/workshop2-b2b-production-handoff';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ orderId: string }> };

export const GET = withWorkshop2ApiErrorRu(async function getInventoryReserve(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { orderId: raw } = await ctx.params;
  const orderId = raw?.trim();
  if (!orderId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', { messageRu: 'Не указан orderId.' });
  }

  const result = await getWorkshop2B2bInventoryReserve({
    orderId,
    organizationId: auth.organizationId,
  });

  if (!result.ok) {
    return jsonWorkshop2ErrorRu(404, result.code, { messageRu: result.messageRu });
  }

  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    collectionId: result.collectionId,
    articleId: result.articleId,
    inventoryReserve: result.inventoryReserve,
    reservedQty: result.reservedQty,
    internalWmsEnabled: result.internalWmsEnabled,
    wmsBalancesHref: result.wmsBalancesHref,
  });
});

export const PATCH = withWorkshop2ApiErrorRu(async function patchInventoryReserve(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { orderId: raw } = await ctx.params;
  const orderId = raw?.trim();
  if (!orderId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', { messageRu: 'Не указан orderId.' });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const sourceRaw = String(body.source ?? 'manual_patch');
  const source =
    sourceRaw === 'supplier_materials' || sourceRaw === 'brand_confirm'
      ? sourceRaw
      : 'manual_patch';

  const result = await patchWorkshop2B2bInventoryReserve({
    orderId,
    organizationId: auth.organizationId,
    source,
  });

  if (!result.ok) {
    return jsonWorkshop2ErrorRu(404, result.code, { messageRu: result.messageRu });
  }

  return NextResponse.json({
    ok: true,
    orderId: result.orderId,
    idempotent: result.idempotent,
    inventoryReserve: result.inventoryReserve,
    orderStatus: result.order.status,
    messageRu: result.messageRu,
  });
});
