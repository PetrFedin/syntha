/**
 * Wave D4 · Zedonk Z.Studio style enrich (costing hints · pillar 1).
 */
import 'server-only';

import fs from 'fs';
import path from 'path';

export type ZedonkStyleEnrichRecord = {
  styleId: string;
  collectionId: string;
  articleId: string;
  makeCostUsd?: number;
  freightUsd?: number;
  dutyPct?: number;
  currency?: string;
  importedAt: string;
};

type FileV1 = { schemaVersion: 1; byArticleKey: Record<string, ZedonkStyleEnrichRecord> };

const EMPTY: FileV1 = { schemaVersion: 1, byArticleKey: {} };

function pathFile(): string {
  return (
    process.env.B2B_ZEDONK_STYLE_FILE?.trim() ||
    path.join(process.cwd(), 'data', 'b2b-zedonk-style-enrich.json')
  );
}

function articleKey(collectionId: string, articleId: string): string {
  return `${collectionId}:${articleId}`;
}

function load(): FileV1 {
  try {
    const j = JSON.parse(fs.readFileSync(pathFile(), 'utf8')) as FileV1;
    return j?.schemaVersion === 1
      ? { schemaVersion: 1, byArticleKey: j.byArticleKey ?? {} }
      : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function save(data: FileV1): void {
  const p = pathFile();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

export function upsertZedonkStyleEnrich(record: ZedonkStyleEnrichRecord): ZedonkStyleEnrichRecord {
  const data = load();
  data.byArticleKey[articleKey(record.collectionId, record.articleId)] = record;
  save(data);
  return record;
}

export function getZedonkStyleEnrich(
  collectionId: string,
  articleId: string
): ZedonkStyleEnrichRecord | undefined {
  return load().byArticleKey[articleKey(collectionId, articleId)];
}
