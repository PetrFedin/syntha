import { NextRequest, NextResponse } from 'next/server';

import { SUPPLIER_PRICE_DELTA_DEFAULT_THRESHOLD_PCT } from '@/lib/fashion/supplier-price-delta-alerts';
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { listSupplierPriceDeltaAlertsServer } from '@/lib/server/workshop2-supplier-price-delta-alerts';
import {
  guardWorkshop2Route,
  WORKSHOP2_EVENTS_READ_ROLES,
} from '@/lib/server/workshop2-route-auth';

/** GET /api/workshop2/supplier/price-delta-alerts?collectionId=&articleId=&thresholdPct= */
export const GET = withWorkshop2ApiErrorRu(async function getSupplierPriceDeltaAlerts(
  req: NextRequest
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_EVENTS_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const collectionId = String(
    searchParams.get('collectionId') ?? searchParams.get('collection') ?? ''
  ).trim();
  const articleId = String(
    searchParams.get('articleId') ?? searchParams.get('article') ?? ''
  ).trim();
  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_query', {
      messageRu: 'Укажите collectionId и articleId.',
    });
  }

  const thresholdRaw = searchParams.get('thresholdPct');
  const thresholdPct = thresholdRaw
    ? Number(thresholdRaw)
    : SUPPLIER_PRICE_DELTA_DEFAULT_THRESHOLD_PCT;

  const result = await listSupplierPriceDeltaAlertsServer({
    collectionId,
    articleId,
    thresholdPct: Number.isFinite(thresholdPct) ? thresholdPct : undefined,
  });

  return NextResponse.json({
    ok: true,
    collectionId,
    articleId,
    thresholdPct: thresholdPct || SUPPLIER_PRICE_DELTA_DEFAULT_THRESHOLD_PCT,
    alerts: result.alerts,
    journalCount: result.journalCount,
    currentCount: result.currentCount,
    storageMode: result.storageMode,
    honestEmpty: result.alerts.length === 0,
  });
});
