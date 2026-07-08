import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { resolveSupplierRfqSlaAnchorServer } from '@/lib/server/workshop2-supplier-rfq-sla-anchor';
import {
  guardWorkshop2Route,
  WORKSHOP2_EVENTS_READ_ROLES,
} from '@/lib/server/workshop2-route-auth';

/** GET /api/workshop2/supplier/rfq-sla-anchor?collectionId=&articleId= */
export const GET = withWorkshop2ApiErrorRu(async function getSupplierRfqSlaAnchor(
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

  const anchor = await resolveSupplierRfqSlaAnchorServer({ collectionId, articleId });
  return NextResponse.json({ ok: true, collectionId, articleId, ...anchor });
});
