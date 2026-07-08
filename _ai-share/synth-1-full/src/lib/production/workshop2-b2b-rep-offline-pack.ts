/**
 * Wave 56: rep offline pack — linesheet + cart snapshot SS27 (journal_only / PG file).
 */
import fs from 'node:fs';
import path from 'node:path';

import { listWorkshop2BrandTenantRegistry } from '@/lib/production/workshop2-brand-tenant-registry';
import {
  getWorkshop2B2bCartSession,
  upsertWorkshop2B2bCartLine,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import { WORKSHOP2_SS27_COLLECTION_ID } from '@/lib/production/workshop2-ru-journey-ss27';

const OFFLINE_PACK_JOURNAL = '.planning/workshop2-b2b-rep-offline-pack-journal.json';

export type Workshop2B2bRepOfflinePack = {
  packId: string;
  season: string;
  repId: string;
  tenantId: string;
  brandId: string;
  generatedAt: string;
  mode: 'journal_only' | 'pg';
  linesheet: {
    collectionId: string;
    articles: { articleId: string; labelRu: string; wholesaleRub: number }[];
  };
  cartSnapshot: {
    sessionId: string;
    lineCount: number;
    totalRub: number;
    lines: { articleId: string; qty: number; wholesalePriceRub: number }[];
  };
  messageRu: string;
};

function journalPath(): string {
  return path.join(process.cwd(), OFFLINE_PACK_JOURNAL);
}

function readJournal(): Workshop2B2bRepOfflinePack[] {
  try {
    if (!fs.existsSync(journalPath())) return [];
    const parsed = JSON.parse(fs.readFileSync(journalPath(), 'utf8')) as {
      packs?: Workshop2B2bRepOfflinePack[];
    };
    return Array.isArray(parsed.packs) ? parsed.packs : [];
  } catch {
    return [];
  }
}

function writeJournal(packs: Workshop2B2bRepOfflinePack[]): void {
  fs.mkdirSync(path.dirname(journalPath()), { recursive: true });
  fs.writeFileSync(journalPath(), JSON.stringify({ packs }, null, 2), 'utf8');
}

/** SS27 demo linesheet для rep offline (journal_only). */
function buildSs27Linesheet(): Workshop2B2bRepOfflinePack['linesheet'] {
  return {
    collectionId: WORKSHOP2_SS27_COLLECTION_ID,
    articles: [
      { articleId: 'demo-ss27-01', labelRu: 'SS27 Look 01', wholesaleRub: 12500 },
      { articleId: 'demo-ss27-02', labelRu: 'SS27 Look 02', wholesaleRub: 14200 },
      { articleId: 'demo-ss27-03', labelRu: 'SS27 Look 03', wholesaleRub: 9800 },
    ],
  };
}

/** Собирает offline pack: cart session + linesheet; сохраняет в journal. */
export function buildWorkshop2B2bRepOfflinePack(input: {
  repId: string;
  tenantId?: string;
  brandId?: string;
  sessionId?: string;
}): Workshop2B2bRepOfflinePack {
  const repId = input.repId.trim() || 'rep-demo';
  const registry = listWorkshop2BrandTenantRegistry();
  const brandId = input.brandId?.trim() || registry[0]?.brandId || 'demo-brand';
  const tenantId =
    input.tenantId?.trim() ||
    registry.find((e) => e.brandId === brandId)?.tenantId ||
    'tenant-demo';
  const sessionId = input.sessionId?.trim() || `rep-offline-${repId}`;

  let session = getWorkshop2B2bCartSession(sessionId);
  if (!session) {
    session = upsertWorkshop2B2bCartLine({
      sessionId,
      tier: 'standard',
      line: {
        collectionId: WORKSHOP2_SS27_COLLECTION_ID,
        articleId: 'demo-ss27-01',
        qty: 2,
        wholesalePriceRub: 12500,
        brandId,
        colorCode: '001',
        size: 'M',
      },
    });
  }

  const lines = session.lines.map((l) => ({
    articleId: l.articleId,
    qty: l.qty,
    wholesalePriceRub: l.wholesalePriceRub,
  }));
  const totalRub = lines.reduce((s, l) => s + l.qty * l.wholesalePriceRub, 0);

  const pack: Workshop2B2bRepOfflinePack = {
    packId: `offline-${repId}-${Date.now()}`,
    season: WORKSHOP2_SS27_COLLECTION_ID,
    repId,
    tenantId,
    brandId,
    generatedAt: new Date().toISOString(),
    mode: 'journal_only',
    linesheet: buildSs27Linesheet(),
    cartSnapshot: {
      sessionId: session.sessionId,
      lineCount: lines.length,
      totalRub,
      lines,
    },
    messageRu:
      'Offline pack SS27 — journal_only. Синхронизация через POST cart при online; service worker не требуется.',
  };

  const packs = readJournal();
  packs.push(pack);
  writeJournal(packs.slice(-50));
  return pack;
}

export function listWorkshop2B2bRepOfflinePackJournal(): Workshop2B2bRepOfflinePack[] {
  return readJournal();
}
