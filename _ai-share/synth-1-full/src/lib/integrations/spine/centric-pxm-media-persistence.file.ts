/**
 * Wave B3 · Centric PXM media assets per article (pillar 2 sample_collection).
 */
import 'server-only';

import fs from 'fs';
import path from 'path';

export type CentricPxmAsset = {
  assetId: string;
  url: string;
  kind: 'hero' | 'linesheet' | 'detail';
  mimeType?: string;
};

export type CentricPxmMediaRecord = {
  collectionId: string;
  articleId: string;
  centricStyleId: string;
  heroUrl: string;
  assets: CentricPxmAsset[];
  importedAt: string;
};

type FileV1 = {
  schemaVersion: 1;
  byArticleKey: Record<string, CentricPxmMediaRecord>;
};

const EMPTY: FileV1 = { schemaVersion: 1, byArticleKey: {} };

function pathFile(): string {
  return (
    process.env.B2B_CENTRIC_PXM_MEDIA_FILE?.trim() ||
    path.join(process.cwd(), 'data', 'b2b-centric-pxm-media.json')
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

export function upsertCentricPxmMedia(record: CentricPxmMediaRecord): CentricPxmMediaRecord {
  const data = load();
  data.byArticleKey[articleKey(record.collectionId, record.articleId)] = record;
  save(data);
  return record;
}

export function getCentricPxmMedia(
  collectionId: string,
  articleId: string
): CentricPxmMediaRecord | undefined {
  return load().byArticleKey[articleKey(collectionId, articleId)];
}

export function listCentricPxmMediaForCollection(collectionId: string): CentricPxmMediaRecord[] {
  const cid = collectionId.trim();
  return Object.values(load().byArticleKey).filter((r) => r.collectionId === cid);
}
