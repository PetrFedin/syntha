import { NextRequest, NextResponse } from 'next/server';

import { BRAND_DOSSIER_FACTORY_DIFF_API_PATH } from '@/lib/fashion/brand-dossier-factory-diff';
import {
  buildBrandDossierFactoryDiffStubRows,
  summarizeBrandDossierFactoryDiffRu,
} from '@/lib/fashion/brand-dossier-factory-diff-stub';
import { resolveBrandDossierFactoryDiff } from '@/lib/server/brand-dossier-factory-diff';

/** GET · live side-by-side brand W2 dossier vs factory mirror (Wave UN). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const articleId = req.nextUrl.searchParams.get('articleId')?.trim() ?? '';
  if (!collectionId || !articleId) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'MISSING_FIELDS', message: 'collectionId, articleId required' },
      },
      { status: 400 }
    );
  }

  const resolved = await resolveBrandDossierFactoryDiff({ collectionId, articleId });
  if (resolved.live && resolved.rows.length > 0) {
    return NextResponse.json({
      ok: true,
      live: true,
      apiPath: BRAND_DOSSIER_FACTORY_DIFF_API_PATH,
      collectionId,
      articleId,
      dossierVersion: resolved.dossierVersion,
      summaryRu: resolved.summaryRu,
      rows: resolved.rows,
      storageMode: resolved.storageMode,
    });
  }

  const stubRows = buildBrandDossierFactoryDiffStubRows({ collectionId, articleId });
  return NextResponse.json({
    ok: true,
    live: false,
    apiPath: BRAND_DOSSIER_FACTORY_DIFF_API_PATH,
    collectionId,
    articleId,
    summaryRu: summarizeBrandDossierFactoryDiffRu(stubRows),
    rows: stubRows,
    storageMode: 'stub',
  });
}
