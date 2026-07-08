/**
 * POST — опциональный MoySklad → WMS reserve hints (Wave 5 #71).
 * Без 2xx от api.moysklad.ru — без fake GRN.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { syncWorkshop2SupplyLinesFromDossierBom } from '@/lib/production/workshop2-supply-sync-from-bom';
import {
  buildWorkshop2MoySkladImportSummary,
  fetchWorkshop2MoySkladStockSnapshot,
  mapWorkshop2MoySkladStockToWmsHints,
  resolveWorkshop2MoySkladConfig,
} from '@/lib/production/workshop2-moysklad-wms-adapter';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  if (!cid || !aid) {
    return jsonWorkshop2ErrorRu(400, 'invalid_path');
  }

  let dryRun = false;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    dryRun = body.dryRun === true;
  } catch {
    dryRun = true;
  }

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  const supplySynced = record
    ? syncWorkshop2SupplyLinesFromDossierBom({ dossier: record.dossier })
    : null;
  const supplyLines = supplySynced?.supply.lines ?? [];
  const supplyLinesForHints = supplyLines.map((line) => ({
    id: line.id,
    label: line.label,
    qty: line.qty ?? 0,
    unit: line.unit ?? 'ед.',
    sourceNote: line.sourceNote,
  }));

  const cfg = resolveWorkshop2MoySkladConfig();
  if (!cfg.configured) {
    return NextResponse.json(
      {
        ok: false,
        error: 'moysklad_not_configured',
        status: 501,
        messageRu:
          'МойСклад не настроен: задайте MOYSKLAD_TOKEN (см. docs). Импорт не блокирует заказ образца.',
        dryRunSupported: true,
        mappedHints: mapWorkshop2MoySkladStockToWmsHints({
          stockRows: [],
          supplyLines: supplyLinesForHints,
        }),
        importedCount: 0,
      },
      { status: 501 }
    );
  }

  const snapshot = await fetchWorkshop2MoySkladStockSnapshot({
    baseUrl: cfg.baseUrl,
    token: cfg.token,
  });

  const mappedHints = mapWorkshop2MoySkladStockToWmsHints({
    stockRows: snapshot.rows,
    supplyLines: supplyLinesForHints,
  });

  const summary = buildWorkshop2MoySkladImportSummary({
    fetchOk: snapshot.ok,
    httpStatus: snapshot.httpStatus,
    mappedHints,
    collectionId: cid,
    articleId: aid,
    dryRun,
  });

  if (!snapshot.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: snapshot.error ?? 'moysklad_fetch_failed',
        httpStatus: snapshot.httpStatus,
        messageRu: summary.messageRu,
        mappedHints,
        partialUiLink: summary.partialUiLink,
        dryRun,
      },
      { status: snapshot.httpStatus >= 400 ? snapshot.httpStatus : 502 }
    );
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      httpStatus: snapshot.httpStatus,
      fetchedStockRows: snapshot.rows.length,
      mappedHints,
      messageRu: summary.messageRu,
      partialUiLink: summary.partialUiLink,
      importedCount: 0,
    });
  }

  return NextResponse.json({
    ok: summary.ok,
    dryRun: false,
    httpStatus: snapshot.httpStatus,
    fetchedStockRows: snapshot.rows.length,
    mappedHints,
    importedCount: mappedHints.filter((h) => h.importStatus !== 'skipped').length,
    messageRu: summary.messageRu,
    partialUiLink: summary.partialUiLink,
    moySkladUrl: cfg.baseUrl,
  });
}
