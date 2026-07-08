/**
 * GET счёт-оферта — JSON / HTML / jsPDF binary из PG-native заказа.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildWorkshop2SchetOffertaPayload } from '@/lib/production/workshop2-schet-offerta';
import { renderWorkshop2SchetOffertaHtml } from '@/lib/production/workshop2-schet-offerta-html';
import { buildWorkshop2SchetOffertaPdfBytes } from '@/lib/production/workshop2-schet-offerta-pdf';
import {
  WORKSHOP2_INVOICE_PIPELINE_HEADER,
  WORKSHOP2_INVOICE_PIPELINE_HTML_STUB,
  WORKSHOP2_INVOICE_PIPELINE_JSPDF,
  buildWorkshop2B2bInvoiceStubUrl,
  buildWorkshop2B2bSchetOffertaApiUrl,
} from '@/lib/production/workshop2-b2b-invoice-stub';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import { upsertWorkshop2B2bInvoiceForOrder } from '@/lib/server/workshop2-b2b-invoice-repository';

type RouteCtx = { params: Promise<{ id: string }> };

function buildLinesFromPgOrder(
  pgOrder: NonNullable<Awaited<ReturnType<typeof getWorkshop2B2bOrder>>>
) {
  return pgOrder.lines.map((line) => ({
    name: `${line.collectionId} · ${line.articleId} · ${line.colorCode}/${line.size}`,
    qty: line.qty,
    priceRub: line.wholesalePriceRub,
    lineNote: line.lineNote,
  }));
}

function wantsPdfResponse(req: NextRequest): boolean {
  const format = req.nextUrl.searchParams.get('format')?.trim().toLowerCase();
  if (format === 'pdf') return true;
  const accept = req.headers.get('accept') ?? '';
  return (
    accept.includes('application/pdf') &&
    !accept.includes('text/html') &&
    !accept.includes('application/json')
  );
}

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const { id } = await ctx.params;
  const orderId = id.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: 'invalid_order_id' }, { status: 400 });
  }

  const pgOrder = await getWorkshop2B2bOrder(orderId);
  if (!pgOrder?.lines?.length) {
    return NextResponse.json(
      {
        ok: false,
        error: 'order_not_found',
        messageRu: 'Заказ не найден в PG — счёт-оферта недоступна.',
      },
      { status: 404 }
    );
  }

  const lines = buildLinesFromPgOrder(pgOrder);

  const payload = buildWorkshop2SchetOffertaPayload({
    orderId,
    buyerName: pgOrder.buyerId ?? undefined,
    lines,
  });

  await upsertWorkshop2B2bInvoiceForOrder({
    orderId,
    brandId: pgOrder.collectionId,
    tenantId: pgOrder.buyerId,
    totalRub: pgOrder.totalRub ?? payload.totalRub,
    status: 'issued',
  });

  const accept = req.headers.get('accept') ?? '';
  const source = 'workshop2_b2b_orders_pg';

  if (wantsPdfResponse(req)) {
    const bytes = buildWorkshop2SchetOffertaPdfBytes(payload);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="schet-offerta-${orderId}.pdf"`,
        'Cache-Control': 'no-store',
        'X-Workshop2-Schet-Source': source,
        [WORKSHOP2_INVOICE_PIPELINE_HEADER]: WORKSHOP2_INVOICE_PIPELINE_JSPDF,
      },
    });
  }

  const pipelineHeaders = {
    [WORKSHOP2_INVOICE_PIPELINE_HEADER]: WORKSHOP2_INVOICE_PIPELINE_HTML_STUB,
  };

  if (accept.includes('text/html')) {
    return new NextResponse(renderWorkshop2SchetOffertaHtml(payload), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Workshop2-Schet-Source': source,
        ...pipelineHeaders,
      },
    });
  }

  if (accept.includes('application/json')) {
    return NextResponse.json({ ok: true, payload, source }, { headers: pipelineHeaders });
  }

  return NextResponse.json(
    {
      ok: true,
      payload,
      source,
      pdfUrlHint: `${buildWorkshop2B2bSchetOffertaApiUrl(orderId)}?format=pdf`,
      printHtmlHintRu:
        'Accept: text/html — печатная форма; Accept: application/pdf — jsPDF binary.',
      invoiceStubUrl: buildWorkshop2B2bInvoiceStubUrl(orderId),
      schetOffertaUrl: buildWorkshop2B2bSchetOffertaApiUrl(orderId),
    },
    { headers: pipelineHeaders }
  );
}
