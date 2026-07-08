import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { BrandCentricRfqQuoteCard } from '@/lib/fashion/brand-centric-rfq-quotes';
import {
  getCentricRfqByArticle,
  getCentricRfqById,
} from '@/lib/integrations/spine/centric-rfq-persistence.file';
import { acknowledgeCentricRfq } from '@/lib/integrations/spine/centric-rfq-import.service';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-centric-rfq-quotes.json');
const memoryByQuoteId = new Map<string, BrandCentricRfqQuoteCard>();
let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as BrandCentricRfqQuoteCard[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) memoryByQuoteId.set(row.quoteId, row);
    }
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memoryByQuoteId.values()], null, 2));
  } catch {
    /* ignore */
  }
}

function newQuoteId(rfqId: string, supplierId: string): string {
  return `rfq-quote-${rfqId}-${supplierId}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
}

function mapPgRow(row: {
  quote_id: string;
  rfq_id: string;
  supplier_id: string;
  supplier_name: string;
  amount_rub: string | number;
  lead_time_days: number;
  currency: string;
  status: string;
  quote_json: { validUntil?: string } | string;
  updated_at: Date;
}): BrandCentricRfqQuoteCard {
  const quoteJsonRaw = row.quote_json;
  const quoteJson =
    typeof quoteJsonRaw === 'string'
      ? (JSON.parse(quoteJsonRaw) as { validUntil?: string })
      : (quoteJsonRaw ?? {});
  return {
    quoteId: row.quote_id,
    rfqId: row.rfq_id,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    amountRub: Number(row.amount_rub),
    leadTimeDays: row.lead_time_days,
    currency: 'RUB',
    status: row.status as BrandCentricRfqQuoteCard['status'],
    validUntil: quoteJson.validUntil,
    updatedAt: row.updated_at.toISOString(),
  };
}

function defaultSeedQuotes(rfqId: string): BrandCentricRfqQuoteCard[] {
  const now = new Date().toISOString();
  const validUntil = new Date(Date.now() + 14 * 86400000).toISOString();
  return [
    {
      quoteId: newQuoteId(rfqId, 'sup-textile-plus'),
      rfqId,
      supplierId: 'sup-textile-plus',
      supplierName: 'Текстиль Плюс',
      amountRub: 450_000,
      leadTimeDays: 21,
      currency: 'RUB',
      status: 'pending',
      validUntil,
      updatedAt: now,
    },
    {
      quoteId: newQuoteId(rfqId, 'sup-furnitura-pro'),
      rfqId,
      supplierId: 'sup-furnitura-pro',
      supplierName: 'Фурнитура Про',
      amountRub: 520_000,
      leadTimeDays: 14,
      currency: 'RUB',
      status: 'pending',
      validUntil,
      updatedAt: now,
    },
  ];
}

async function upsertQuotePg(org: string, quote: BrandCentricRfqQuoteCard): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO spine_centric_rfq_quotes
       (quote_id, rfq_id, organization_id, supplier_id, supplier_name,
        amount_rub, lead_time_days, currency, status, quote_json, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
     ON CONFLICT (quote_id) DO UPDATE SET
       supplier_name = EXCLUDED.supplier_name,
       amount_rub = EXCLUDED.amount_rub,
       lead_time_days = EXCLUDED.lead_time_days,
       currency = EXCLUDED.currency,
       status = EXCLUDED.status,
       quote_json = EXCLUDED.quote_json,
       updated_at = NOW()`,
    [
      quote.quoteId,
      quote.rfqId,
      org,
      quote.supplierId,
      quote.supplierName,
      quote.amountRub,
      quote.leadTimeDays,
      quote.currency,
      quote.status,
      JSON.stringify({ validUntil: quote.validUntil }),
    ]
  );
}

async function listQuotesPg(org: string, rfqId: string): Promise<BrandCentricRfqQuoteCard[]> {
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query(
    `SELECT quote_id, rfq_id, supplier_id, supplier_name, amount_rub, lead_time_days,
            currency, status, quote_json, updated_at
     FROM spine_centric_rfq_quotes
     WHERE organization_id = $1 AND rfq_id = $2
     ORDER BY amount_rub ASC`,
    [org, rfqId]
  );
  return res.rows.map((row) => mapPgRow(row as Parameters<typeof mapPgRow>[0]));
}

async function seedDefaultsPg(org: string, rfqId: string): Promise<BrandCentricRfqQuoteCard[]> {
  const seeds = defaultSeedQuotes(rfqId);
  for (const quote of seeds) {
    await upsertQuotePg(org, quote);
  }
  return listQuotesPg(org, rfqId);
}

function listQuotesMemory(rfqId: string): BrandCentricRfqQuoteCard[] {
  hydrateFileIfNeeded();
  return [...memoryByQuoteId.values()]
    .filter((q) => q.rfqId === rfqId)
    .sort((a, b) => a.amountRub - b.amountRub);
}

function seedDefaultsMemory(rfqId: string): BrandCentricRfqQuoteCard[] {
  hydrateFileIfNeeded();
  if (listQuotesMemory(rfqId).length) return listQuotesMemory(rfqId);
  const seeds = defaultSeedQuotes(rfqId);
  for (const quote of seeds) memoryByQuoteId.set(quote.quoteId, quote);
  persistFile();
  return seeds;
}

export function clearBrandCentricRfqQuotesMemoryForTests(): void {
  memoryByQuoteId.clear();
  fileHydrated = false;
}

export async function resolveCentricRfqId(input: {
  rfqId?: string;
  collectionId?: string;
  articleId?: string;
}): Promise<string | null> {
  const direct = input.rfqId?.trim();
  if (direct && getCentricRfqById(direct)) return direct;
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  if (collectionId && articleId) {
    const byArticle = getCentricRfqByArticle(collectionId, articleId);
    if (byArticle) return byArticle.rfqId;
  }
  return direct ?? null;
}

export async function listBrandCentricRfqQuotesServer(input: {
  rfqId?: string;
  collectionId?: string;
  articleId?: string;
  organizationId?: string;
  seedIfEmpty?: boolean;
}): Promise<{
  rfqId: string | null;
  quotes: BrandCentricRfqQuoteCard[];
  storageMode: 'pg' | 'file' | 'memory' | 'demo';
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const rfqId = await resolveCentricRfqId(input);
  if (!rfqId) {
    return { rfqId: null, quotes: [], storageMode: 'demo' };
  }

  if (isWorkshop2PostgresEnabled()) {
    let quotes = await listQuotesPg(org, rfqId);
    if (!quotes.length && input.seedIfEmpty !== false) {
      quotes = await seedDefaultsPg(org, rfqId);
    }
    return { rfqId, quotes, storageMode: 'pg' };
  }

  let quotes = listQuotesMemory(rfqId);
  if (!quotes.length && input.seedIfEmpty !== false) {
    quotes = seedDefaultsMemory(rfqId);
  }
  return {
    rfqId,
    quotes,
    storageMode: canUseDiskPersistence() ? 'file' : 'memory',
  };
}

export async function upsertBrandCentricRfqQuoteServer(input: {
  rfqId: string;
  supplierId: string;
  supplierName: string;
  amountRub: number;
  leadTimeDays: number;
  organizationId?: string;
  validUntil?: string;
}): Promise<{ quote: BrandCentricRfqQuoteCard; storageMode: 'pg' | 'file' | 'memory' }> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const rfqId = input.rfqId.trim();
  if (!getCentricRfqById(rfqId)) {
    throw new Error('RFQ_NOT_FOUND');
  }
  const quote: BrandCentricRfqQuoteCard = {
    quoteId: newQuoteId(rfqId, input.supplierId.trim()),
    rfqId,
    supplierId: input.supplierId.trim(),
    supplierName: input.supplierName.trim(),
    amountRub: input.amountRub,
    leadTimeDays: input.leadTimeDays,
    currency: 'RUB',
    status: 'pending',
    validUntil: input.validUntil,
    updatedAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await upsertQuotePg(org, quote);
    return { quote, storageMode: 'pg' };
  }

  hydrateFileIfNeeded();
  memoryByQuoteId.set(quote.quoteId, quote);
  persistFile();
  return { quote, storageMode: canUseDiskPersistence() ? 'file' : 'memory' };
}

export async function awardBrandCentricRfqQuoteServer(input: {
  rfqId: string;
  quoteId: string;
  organizationId?: string;
}): Promise<{
  quotes: BrandCentricRfqQuoteCard[];
  awardedQuoteId: string;
  storageMode: 'pg' | 'file' | 'memory';
}> {
  const org = input.organizationId ?? DEFAULT_ORG;
  const rfqId = input.rfqId.trim();
  const quoteId = input.quoteId.trim();
  const listed = await listBrandCentricRfqQuotesServer({
    rfqId,
    organizationId: org,
    seedIfEmpty: false,
  });
  const target = listed.quotes.find((q) => q.quoteId === quoteId);
  if (!target) throw new Error('QUOTE_NOT_FOUND');

  const now = new Date().toISOString();
  const nextQuotes = listed.quotes.map((q) => ({
    ...q,
    status: q.quoteId === quoteId ? ('accepted' as const) : ('rejected' as const),
    updatedAt: now,
  }));

  if (isWorkshop2PostgresEnabled()) {
    for (const quote of nextQuotes) {
      await upsertQuotePg(org, quote);
    }
  } else {
    hydrateFileIfNeeded();
    for (const quote of nextQuotes) memoryByQuoteId.set(quote.quoteId, quote);
    persistFile();
  }

  await acknowledgeCentricRfq({ rfqId, status: 'awarded', organizationId: org });

  return {
    quotes: nextQuotes.sort((a, b) => a.amountRub - b.amountRub),
    awardedQuoteId: quoteId,
    storageMode: listed.storageMode === 'demo' ? 'memory' : listed.storageMode,
  };
}
