import { NextRequest, NextResponse } from 'next/server';

import type { BrandProductionCutTicketStatus } from '@/lib/brand-production/cut-tickets';
import {
  advanceBrandProductionCutTicketStatus,
  listBrandProductionCutTickets,
  upsertBrandProductionCutTicket,
} from '@/lib/server/brand-production-cut-tickets-repository';
import { brandProductionCutTicketRowToPgPayload } from '@/lib/production/brand-production-cut-ticket-spine';

/** GET — cut tickets for collection (PG SoT via workshop2_cut_tickets). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim();
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim();
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите collectionId.' }, { status: 400 });
  }

  const { rows, storageMode } = await listBrandProductionCutTickets({
    collectionId,
    orderId,
  });

  return NextResponse.json({
    ok: true,
    rows,
    storageMode,
    messageRu:
      rows.length > 0
        ? `${rows.length} cut ticket(s) · ${storageMode}`
        : 'Нет PG cut tickets — fallback local model.',
  });
}

/** POST — sync row or advance status (ready → issued). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const action = String(body.action ?? 'upsert').trim();

  if (action === 'advance') {
    const ticketId = String(body.ticketId ?? '').trim();
    const nextStatus = String(body.nextStatus ?? 'issued').trim() as BrandProductionCutTicketStatus;
    if (!ticketId) {
      return NextResponse.json({ ok: false, messageRu: 'Укажите ticketId.' }, { status: 400 });
    }
    const row = await advanceBrandProductionCutTicketStatus({ ticketId, nextStatus });
    if (!row) {
      return NextResponse.json({ ok: false, messageRu: 'Cut ticket не найден.' }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      row,
      messageRu: `Cut ticket ${ticketId} → ${nextStatus}.`,
    });
  }

  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const brandStatus = String(body.brandStatus ?? 'ready').trim() as BrandProductionCutTicketStatus;
  const qty = Number(body.qty ?? 0);
  if (!collectionId || !articleId || qty <= 0) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите collectionId, articleId, qty.' },
      { status: 400 }
    );
  }

  const localRow = body.row as Record<string, unknown> | undefined;
  const payload = brandProductionCutTicketRowToPgPayload(
    {
      id: String(localRow?.id ?? body.id ?? ''),
      poId: String(localRow?.poId ?? body.poId ?? ''),
      poCode: String(localRow?.poCode ?? body.poCode ?? ''),
      articleId,
      sku: String(localRow?.sku ?? body.sku ?? articleId),
      articleName: String(localRow?.articleName ?? body.articleName ?? articleId),
      factoryName: String(localRow?.factoryName ?? body.factoryName ?? '—'),
      totalQty: qty,
      sizeSummary: String(localRow?.sizeSummary ?? body.sizeSummary ?? ''),
      targetCutDate: localRow?.targetCutDate != null ? String(localRow.targetCutDate) : undefined,
      status: brandStatus,
      lifecycleLabel: String(localRow?.lifecycleLabel ?? 'Manufacturing'),
    },
    body.b2bOrderId != null ? String(body.b2bOrderId) : undefined
  );

  const row = await upsertBrandProductionCutTicket({
    id: body.id != null ? String(body.id) : undefined,
    collectionId,
    articleId,
    ticketNo: body.ticketNo != null ? String(body.ticketNo) : undefined,
    qty,
    brandStatus,
    payload,
  });

  return NextResponse.json({
    ok: true,
    row,
    messageRu: `Cut ticket ${row.ticketNo} сохранён.`,
  });
}
