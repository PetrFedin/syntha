/**
 * Wave 53/55: B2B invoice stub — journal_only в .planning/, HTML stub link (не fake PDF).
 */
import fs from 'node:fs';
import path from 'node:path';

const INVOICE_JOURNAL_BASENAME = '.planning/workshop2-b2b-invoice-stub-journal.json';

/** HTTP header: pipeline kind (не binary PDF engine). */
export const WORKSHOP2_INVOICE_PIPELINE_HEADER = 'X-Workshop2-Invoice-Pipeline';

/** Значение header: HTML/JSON + print-to-PDF, без binary PDF bytes. */
export const WORKSHOP2_INVOICE_PIPELINE_HTML_STUB = 'html_stub_not_binary_pdf';

/** Значение header: server-side jsPDF binary (schet-offerta.pdf). */
export const WORKSHOP2_INVOICE_PIPELINE_JSPDF = 'jspdf_binary_v1';

/** Path для CSV export и journal (HTML route, не .pdf bytes). */
export function buildWorkshop2B2bInvoiceStubUrl(orderId: string): string {
  return `/api/shop/b2b/orders/${encodeURIComponent(orderId.trim())}/invoice-stub`;
}

/** Wave 56: canonical HTML invoice URL for PG column invoice_html_url. */
export function buildWorkshop2B2bInvoiceHtmlUrl(orderId: string): string {
  return buildWorkshop2B2bInvoiceStubUrl(orderId);
}

export function buildWorkshop2B2bSchetOffertaApiUrl(orderId: string): string {
  return `/api/shop/b2b/orders/${encodeURIComponent(orderId.trim())}/schet-offerta.pdf`;
}

/** File journal выкл. когда PG configured (ADR-002 pg-primary). */
export function isWorkshop2B2bInvoiceJournalFilePersistEnabled(): boolean {
  if (process.env.NODE_ENV === 'test') return true;
  const db = process.env.WORKSHOP2_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (db) return false;
  if (process.env.PLATFORM_CORE_SPINE_PG_PRIMARY === '1') return false;
  return true;
}

function invoiceJournalPath(): string {
  return path.join(process.cwd(), INVOICE_JOURNAL_BASENAME);
}

export type Workshop2B2bInvoiceStubJournalEntry = {
  id: string;
  orderId: string;
  brandId: string;
  tenantId: string;
  totalRub: number;
  pdfPathPlaceholderRu: string;
  mode: 'journal_only';
  at: string;
};

function loadJournal(): Workshop2B2bInvoiceStubJournalEntry[] {
  if (!isWorkshop2B2bInvoiceJournalFilePersistEnabled()) return [];
  try {
    if (!fs.existsSync(invoiceJournalPath())) return [];
    const parsed = JSON.parse(fs.readFileSync(invoiceJournalPath(), 'utf8')) as {
      entries?: Workshop2B2bInvoiceStubJournalEntry[];
    };
    return Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    return [];
  }
}

/** Wave 54: read journal_only invoice stubs for export fallback. */
export function readWorkshop2B2bInvoiceStubJournal(): Workshop2B2bInvoiceStubJournalEntry[] {
  return loadJournal();
}

function flushJournal(entries: Workshop2B2bInvoiceStubJournalEntry[]): void {
  if (!isWorkshop2B2bInvoiceJournalFilePersistEnabled()) return;
  fs.mkdirSync(path.dirname(invoiceJournalPath()), { recursive: true });
  fs.writeFileSync(invoiceJournalPath(), JSON.stringify({ entries }, null, 2), 'utf8');
}

/** Добавляет stub-счёт в journal_only (без SMTP/PDF — только placeholder path RU). */
export function appendWorkshop2B2bInvoiceStubJournal(input: {
  orderId: string;
  brandId: string;
  tenantId: string;
  totalRub: number;
}): Workshop2B2bInvoiceStubJournalEntry {
  const orderId = input.orderId.trim();
  const entry: Workshop2B2bInvoiceStubJournalEntry = {
    id: `inv-stub-${Date.now()}`,
    orderId,
    brandId: input.brandId.trim(),
    tenantId: input.tenantId.trim(),
    totalRub: Number(input.totalRub) || 0,
    pdfPathPlaceholderRu: buildWorkshop2B2bSchetOffertaApiUrl(orderId),
    mode: 'journal_only',
    at: new Date().toISOString(),
  };
  if (!isWorkshop2B2bInvoiceJournalFilePersistEnabled()) return entry;
  const entries = loadJournal();
  entries.push(entry);
  flushJournal(entries);
  return entry;
}
