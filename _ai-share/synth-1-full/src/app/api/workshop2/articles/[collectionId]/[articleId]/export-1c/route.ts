/**
 * POST /api/workshop2/articles/.../export-1c — JSON BOM для 1С (journal; live POST только с URL).
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildWorkshop2Erp1cCommerceMlFragment,
  buildWorkshop2Erp1cExportPayload,
  exportWorkshop2Erp1cJournal,
} from '@/lib/production/workshop2-erp-1c-stub';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

export const GET = withWorkshop2ApiErrorRu(async function getExport1c(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  if (!cid || !aid) {
    return jsonWorkshop2ErrorRu(400, 'invalid_path');
  }

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const format = req.nextUrl.searchParams.get('format')?.trim().toLowerCase() ?? 'json';
  const payload = buildWorkshop2Erp1cExportPayload({
    dossier: record.dossier,
    collectionId: cid,
    articleId: aid,
  });

  if (format === 'commerceml') {
    const xml = buildWorkshop2Erp1cCommerceMlFragment({ payload });
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="1c-${aid}.xml"`,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    format: 'json',
    payload,
    specRu: 'workshop2-1c-bom-v1 — загрузка в 1С:УНФ/ERP; CommerceML: ?format=commerceml',
  });
});

export const POST = withWorkshop2ApiErrorRu(async function postExport1c(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  if (!cid || !aid) {
    return jsonWorkshop2ErrorRu(400, 'invalid_path');
  }

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const result = await exportWorkshop2Erp1cJournal({
    dossier: record.dossier,
    collectionId: cid,
    articleId: aid,
  });

  return NextResponse.json({
    ok: result.ok,
    posted: result.posted,
    payload: result.payload,
    probe: 'erp1c',
    error: result.error,
    messageRu: result.messageRu,
  });
});
