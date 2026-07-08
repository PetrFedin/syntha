/**
 * PO bundle PDF — jsPDF, данные из Workshop2PoBundlePayload.
 */
import { jsPDF } from 'jspdf';
import type { Workshop2PoBundlePayload } from '@/lib/production/workshop2-po-bundle-payload';

const MARGIN_MM = 12;
const LINE_MM = 5;
const PAGE_BOTTOM_MM = 285;
const CONTENT_W_MM = 210 - MARGIN_MM * 2;

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

export function buildWorkshop2PoBundlePdfBytes(payload: Workshop2PoBundlePayload): Uint8Array {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(10);
  let y = MARGIN_MM + 2;

  y = writeln(doc, `PO bundle · ${payload.collectionId} / ${payload.articleId}`, y, { bold: true });
  y = writeln(doc, `Generated: ${new Date(payload.generatedAt).toLocaleString('ru-RU')}`, y);
  y += 1;
  y = writeln(
    doc,
    `Series qty: ${payload.seriesQty} · BOM fill ${payload.bomFillPct}% · weighted ${payload.bomWeightedFillPct}%`,
    y
  );
  if (payload.b2bOrderId) {
    y = writeln(doc, `B2B order: ${payload.b2bOrderId}`, y);
  }
  y += 2;

  y = writeln(doc, 'Purchase orders:', y, { bold: true });
  if (payload.purchaseOrders.length === 0) {
    y = writeln(doc, '— no PO rows —', y);
  } else {
    for (const po of payload.purchaseOrders) {
      y = writeln(
        doc,
        `• ${po.id} · qty ${po.qty} · ${po.status}${po.supplierId ? ` · ${po.supplierId}` : ''}`,
        y
      );
    }
  }

  y += 2;
  y = writeln(doc, 'BOM requirement (series):', y, { bold: true });
  if (payload.bomLines.length === 0) {
    y = writeln(doc, '— no BOM lines —', y);
  } else {
    for (const line of payload.bomLines.slice(0, 40)) {
      y = writeln(
        doc,
        `• ${line.name} · ${line.perUnit}/${line.unit ?? 'unit'} → ${line.requiredQty.toFixed(2)}`,
        y
      );
    }
    if (payload.bomLines.length > 40) {
      y = writeln(doc, `… +${payload.bomLines.length - 40} more lines`, y);
    }
  }

  y += 2;
  doc.setFontSize(8);
  y = writeln(doc, payload.legalNoteRu, y);

  const buf = doc.output('arraybuffer');
  return new Uint8Array(buf);
}
