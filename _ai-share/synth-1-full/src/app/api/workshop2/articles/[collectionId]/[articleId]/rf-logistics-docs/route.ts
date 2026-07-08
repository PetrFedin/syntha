/**
 * GET/POST — шаблоны ТТН/УПД (JSON для client PDF), связь с logisticsShipmentMirror.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildWorkshop2RfLogisticsDocTemplate,
  listWorkshop2RfLogisticsDocKinds,
  workshop2RfLogisticsPdfFileName,
} from '@/lib/production/workshop2-rf-logistics-docs';
import { buildWorkshop2RfLogisticsPdfBytes } from '@/lib/production/workshop2-rf-logistics-pdf';
import { resolveWorkshop2B2bVatRate } from '@/lib/production/workshop2-b2b-checkout-rub';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

export const GET = withWorkshop2ApiErrorRu(async function getRfLogisticsDocs(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  const format = req.nextUrl.searchParams.get('format')?.trim().toLowerCase();
  const kindParam = req.nextUrl.searchParams.get('kind')?.trim().toLowerCase();
  const kind: 'ttn' | 'upd' = kindParam === 'ttn' ? 'ttn' : 'upd';

  if (format === 'pdf' && cid && aid) {
    const record = await getWorkshop2ServerDossierRecord(cid, aid);
    if (!record) {
      return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
    }
    const template = buildWorkshop2RfLogisticsDocTemplate({
      kind,
      dossier: record.dossier,
      collectionId: cid,
      articleId: aid,
      vatRatePct: resolveWorkshop2B2bVatRate(),
    });
    const bytes = buildWorkshop2RfLogisticsPdfBytes(template);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${workshop2RfLogisticsPdfFileName(kind, aid)}"`,
      },
    });
  }

  let inlinePreview: ReturnType<typeof buildWorkshop2RfLogisticsDocTemplate> | null = null;
  if (cid && aid) {
    const record = await getWorkshop2ServerDossierRecord(cid, aid);
    if (record) {
      inlinePreview = buildWorkshop2RfLogisticsDocTemplate({
        kind,
        dossier: record.dossier,
        collectionId: cid,
        articleId: aid,
        vatRatePct: resolveWorkshop2B2bVatRate(),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    kinds: listWorkshop2RfLogisticsDocKinds(),
    collectionId: cid,
    articleId: aid,
    inlinePreview,
    messageRu:
      'Документы РФ: preview в ответе; PDF — GET ?format=pdf&kind=ttn|upd (без обязательной кнопки POST).',
  });
});

export const POST = withWorkshop2ApiErrorRu(async function postRfLogisticsDocs(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  let kind: 'ttn' | 'upd' = 'upd';
  try {
    const body = (await req.json()) as { kind?: string };
    if (body.kind === 'ttn' || body.kind === 'upd') kind = body.kind;
  } catch {
    /* default upd */
  }

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const template = buildWorkshop2RfLogisticsDocTemplate({
    kind,
    dossier: record.dossier,
    collectionId: cid,
    articleId: aid,
    vatRatePct: resolveWorkshop2B2bVatRate(),
  });

  return NextResponse.json({
    ok: true,
    template,
    clientPdfHintRu: 'Сформируйте PDF на клиенте из template — без отправки в ФНС из stub.',
  });
});
