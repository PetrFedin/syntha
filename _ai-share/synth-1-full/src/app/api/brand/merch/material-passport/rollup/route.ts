import { NextRequest, NextResponse } from 'next/server';

import {
  listBrandMaterialPassportRollupServer,
  refreshBrandMaterialPassportRollupServer,
} from '@/lib/server/brand-material-passport-rollup-repository';

/** GET /api/brand/merch/material-passport/rollup?collectionId=SS27 */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId') ?? undefined;
  const result = await listBrandMaterialPassportRollupServer({ collectionId });
  return NextResponse.json({
    ok: true,
    collectionId: result.collectionId,
    rows: result.rows,
    summary: result.summary,
    storageMode: result.storageMode,
    dossierLinked: result.dossierLinked,
    messageRu:
      result.storageMode === 'pg'
        ? `${result.summary.withComposition}/${result.summary.total} SKU · composition PG`
        : `${result.summary.withComposition}/${result.summary.total} SKU · ${result.storageMode}`,
  });
}

/** POST · re-sync rollup from catalog + dossier composition. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_BODY', message: 'JSON body required' } },
      { status: 400 }
    );
  }

  const collectionId = String(body.collectionId ?? '').trim();
  if (!collectionId) {
    return NextResponse.json(
      { ok: false, error: { code: 'MISSING_FIELDS', message: 'collectionId required' } },
      { status: 400 }
    );
  }

  try {
    const refreshed = await refreshBrandMaterialPassportRollupServer({ collectionId });
    const listed = await listBrandMaterialPassportRollupServer({
      collectionId,
      seedIfEmpty: false,
    });
    return NextResponse.json({
      ok: true,
      collectionId,
      rows: listed.rows,
      summary: listed.summary,
      storageMode: refreshed.storageMode,
      dossierLinked: listed.dossierLinked,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'ERROR', message: 'Failed to refresh rollup' } },
      { status: 500 }
    );
  }
}
