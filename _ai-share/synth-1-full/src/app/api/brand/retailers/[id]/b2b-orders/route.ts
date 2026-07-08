import { NextRequest, NextResponse } from 'next/server';

import { listWorkshop2B2bOrdersForBuyer } from '@/lib/server/workshop2-b2b-orders-repository';

/** GET /api/brand/retailers/[id]/b2b-orders — W2 B2B заказы партнёра (CRM bridge). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const buyerId = id?.trim();
  if (!buyerId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан id партнёра.' }, { status: 400 });
  }

  const orders = await listWorkshop2B2bOrdersForBuyer(buyerId);
  return NextResponse.json({
    ok: true,
    buyerId,
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      totalRub: o.totalRub,
      lineCount: o.lines.length,
      collectionId: o.collectionId,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
    messageRu:
      orders.length > 0
        ? `${orders.length} заказ(ов) W2 для партнёра.`
        : 'Заказы W2 для партнёра не найдены.',
  });
}
