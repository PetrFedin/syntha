/**
 * Wave D4 · P2-LINESHEET-GEN — auto linesheet from published-articles + PXM overlay.
 */
import 'server-only';

import { listWorkshop2PublishedShowroomArticles } from '@/lib/server/workshop2-showroom-repository';
import { mergePxmMediaIntoPublishedArticles } from './pxm-media-overlay';
import { workshop2CollectionLinesheetPdfHref } from '@/lib/production/workshop2-collection-linesheet-pdf-href';
import {
  getLatestLinesheetForCollection,
  persistLinesheetGen,
  type LinesheetGenRecord,
} from './linesheet-gen-persistence.file';

export type LinesheetGenResult = {
  collectionId: string;
  articleCount: number;
  pxmOverlayCount: number;
  pdfHref: string;
  generatedAt: string;
  sources: Array<'w2_published' | 'centric_pxm'>;
};

export async function generateCollectionLinesheet(
  collectionId: string
): Promise<LinesheetGenRecord> {
  const cid = collectionId.trim();
  const raw = await listWorkshop2PublishedShowroomArticles(cid);
  const articles = mergePxmMediaIntoPublishedArticles(raw);
  const pxmOverlayCount = articles.filter((a) => a.pxmSource).length;

  const result: LinesheetGenResult = {
    collectionId: cid,
    articleCount: articles.length,
    pxmOverlayCount,
    pdfHref: workshop2CollectionLinesheetPdfHref(cid),
    generatedAt: new Date().toISOString(),
    sources: pxmOverlayCount > 0 ? ['w2_published', 'centric_pxm'] : ['w2_published'],
  };

  return persistLinesheetGen(result);
}

export function getCollectionLinesheetSnapshot(
  collectionId: string
): LinesheetGenRecord | undefined {
  return getLatestLinesheetForCollection(collectionId);
}
