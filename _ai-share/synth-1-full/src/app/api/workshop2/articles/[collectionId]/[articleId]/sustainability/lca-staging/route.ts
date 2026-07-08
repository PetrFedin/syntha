/**
 * POST wave 38 #53: LCA staging attempt → journal в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import { attemptWorkshop2SustainabilityStaging } from '@/lib/production/workshop2-sustainability-staging';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  workshop2DossierPutFailureMessageRu,
  workshop2DossierPutFailureStatus,
} from '@/lib/server/workshop2-dossier-put-utils';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'lca-staging-api';
  const result = await attemptWorkshop2SustainabilityStaging({
    dossier: record.dossier,
    collectionId: cid,
    articleId: aid,
    actor,
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: result.dossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_lca_staging' },
  });
  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  const mirror = result.dossier.sustainabilityStagingMirror;
  const messageRu =
    mirror?.hintRu ??
    result.error ??
    'LCA/registry staging недоступен — задайте WORKSHOP2_LCA_API_URL.';

  if (result.skipped) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        error: result.error ?? 'lca_url_not_configured',
        messageRu,
        mirror,
      },
      { status: 503 }
    );
  }

  const status = result.ok ? 200 : 502;
  return NextResponse.json(
    {
      ok: result.ok,
      mirror,
      error: result.error,
      messageRu: result.ok ? undefined : messageRu,
    },
    { status }
  );
}
