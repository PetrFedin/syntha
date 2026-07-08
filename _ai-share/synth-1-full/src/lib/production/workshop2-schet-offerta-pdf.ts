/**
 * B2B счёт-оферта — server-side PDF (jsPDF), данные из Workshop2SchetOffertaPayload.
 */
import { jsPDF } from 'jspdf';
import type { Workshop2SchetOffertaPayload } from '@/lib/production/workshop2-schet-offerta';

const MARGIN_MM = 12;
const LINE_MM = 5;
const PAGE_BOTTOM_MM = 285;
const CONTENT_W_MM = 210 - MARGIN_MM * 2;

function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function writeln(doc: jsPDF, text: string, y: number, opts?: { bold?: boolean }): number {
  doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
  const lines = doc.splitTextToSize(text, CONTENT_W_MM);
  for (const line of lines) {
    if (y > PAGE_BOTTOM_MM) {
      doc.addPage();
      y = MARGIN_MM + 4;
    }
    doc.text(line, MARGIN_MM, y);
    y += LINE_MM;
  }
  return y;
}

export function buildWorkshop2SchetOffertaPdfBytes(
  payload: Workshop2SchetOffertaPayload
): Uint8Array {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(11);
  let y = MARGIN_MM + 2;

  y = writeln(doc, `Schet-offerta No ${payload.orderId}`, y, { bold: true });
  y += 1;
  y = writeln(doc, `Date: ${new Date(payload.generatedAt).toLocaleString('ru-RU')}`, y);
  y += 2;
  y = writeln(
    doc,
    `Seller: ${payload.seller.name}, INN ${payload.seller.inn}, ${payload.seller.addressRu}`,
    y
  );
  y = writeln(doc, `Buyer: ${payload.buyer.name}, INN ${payload.buyer.inn}`, y);
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const cols = [8, 72, 14, 12, 22, 22];
  const headers = ['#', 'Item', 'Qty', 'Unit', 'Price', 'Sum'];
  let x = MARGIN_MM;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i]!, x, y);
    x += cols[i]!;
  }
  y += LINE_MM;
  doc.setFont('helvetica', 'normal');

  for (let idx = 0; idx < payload.lines.length; idx++) {
    const line = payload.lines[idx]!;
    if (y > PAGE_BOTTOM_MM - LINE_MM * 2) {
      doc.addPage();
      y = MARGIN_MM + 4;
    }
    x = MARGIN_MM;
    const cells = [
      String(idx + 1),
      line.name,
      String(line.qty),
      line.unit,
      formatRub(line.priceRub),
      formatRub(line.sumRub),
    ];
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]!;
      const maxW = cols[i]! - 1;
      const clipped = doc.splitTextToSize(cell, maxW)[0] ?? cell;
      doc.text(clipped, x, y);
      x += cols[i]!;
    }
    y += LINE_MM;
  }

  y += 2;
  y = writeln(doc, `Subtotal: ${formatRub(payload.subtotalRub)}`, y);
  y = writeln(doc, `VAT ${payload.vatRatePct}%: ${formatRub(payload.vatRub)}`, y);
  y = writeln(doc, `Total: ${payload.totalFormattedRu}`, y, { bold: true });
  y += 2;
  doc.setFontSize(8);
  y = writeln(doc, payload.legalNoteRu, y);

  const buf = doc.output('arraybuffer');
  return new Uint8Array(buf);
}
