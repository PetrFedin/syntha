/**
 * POST wave 38 #50: DPP registry staging attempt → journal в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import { buildWorkshop2DppExportBlock } from '@/lib/production/workshop2-dpp-export';
import { postWorkshop2DppRegistryStaging } from '@/lib/production/workshop2-dpp-registry-staging';
import { evaluateWorkshop2DppRegistryWriteHonesty } from '@/lib/production/workshop2-dpp-registry-write-honesty';
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

  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'dpp-staging-api';
  const block = buildWorkshop2DppExportBlock({
    dossier: record.dossier,
    collectionId: cid,
    articleId: aid,
  });
  const result = await postWorkshop2DppRegistryStaging({
    dossier: record.dossier,
    block,
    actor,
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: result.dossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_dpp_registry_staging' },
  });
  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  const postHonesty = evaluateWorkshop2DppRegistryWriteHonesty({
    dossier: result.dossier,
    collectionId: cid,
    articleId: aid,
  });
  const status =
    result.ok && postHonesty.allowStagingSuccessUi
      ? 200
      : !result.ok && !result.skipped
        ? 502
        : postHonesty.httpStatusHint;
  return NextResponse.json(
    {
      ok: result.ok && postHonesty.allowStagingSuccessUi,
      skipped: result.skipped,
      httpStatus: result.httpStatus,
      error: result.error,
      messageRu: postHonesty.messageRu,
      registryStubOnly: postHonesty.registryStubOnly,
      mirror: result.dossier.dppRegistryDraftMirror,
    },
    { status }
  );
}
