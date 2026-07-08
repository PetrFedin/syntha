import { NextRequest, NextResponse } from 'next/server';
import { approveBrandWorkshop2B2bAmendment } from '@/lib/server/workshop2-b2b-amendment-service';

type RouteCtx = { params: Promise<{ id: string; amendmentId: string }> };

/** POST — бренд одобряет заявку на изменение заказа. */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { id, amendmentId } = await ctx.params;
  const orderId = id?.trim();
  const aid = amendmentId?.trim();
  if (!orderId || !aid) {
    return NextResponse.json(
      { ok: false, messageRu: 'Не указан orderId или amendmentId.' },
      { status: 400 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const result = await approveBrandWorkshop2B2bAmendment({
    orderId,
    amendmentId: aid,
    resolutionNoteRu: String(body.resolutionNoteRu ?? '').trim() || undefined,
    brandActor: String(body.brandActor ?? '').trim() || undefined,
  });

  if (!result.ok) {
    const status = result.code === 'not_found' ? 404 : 409;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({
    ok: true,
    amendment: result.amendment,
    orderUpdated: result.orderUpdated,
    messageRu: result.messageRu,
  });
}
