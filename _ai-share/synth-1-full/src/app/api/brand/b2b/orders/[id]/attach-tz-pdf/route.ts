import { NextRequest, NextResponse } from 'next/server';

import { BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT } from '@/lib/fashion/brand-op-attach-tz-pdf';
import { attachBrandB2bOrderTzPdfToPo } from '@/lib/server/brand-b2b-order-attach-tz-pdf';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ id: string }> };

/** POST · stub attach TZ PDF to production PO on B2B order record (Wave UN). */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await ctx.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json(
      { ok: false, error: { code: 'MISSING_ORDER_ID', message: 'orderId required' } },
      { status: 400 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const result = await attachBrandB2bOrderTzPdfToPo({
    orderId,
    collectionId: String(body.collectionId ?? ''),
    articleId: String(body.articleId ?? ''),
    productionOrderId: String(body.productionOrderId ?? ''),
    actor: auth.actor?.actorLabel,
  });

  if (!result.ok) {
    const status = result.messageRu.includes('не найден') ? 404 : 409;
    return NextResponse.json(
      {
        ok: false,
        apiSegment: BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT,
        orderId: result.orderId,
        messageRu: result.messageRu,
        storageMode: result.storageMode,
      },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    apiSegment: BRAND_B2B_ORDER_ATTACH_TZ_PDF_API_SEGMENT,
    orderId: result.orderId,
    productionOrderId: result.productionOrderId,
    collectionId: result.collectionId,
    articleId: result.articleId,
    tzPdfHref: result.tzPdfHref,
    attachedAt: result.attachedAt,
    messageRu: result.messageRu,
    storageMode: result.storageMode,
  });
}
