import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';

import {
  evaluateWorkshop2BulkShowroomPublishForArticle,
  summarizeWorkshop2BulkShowroomPublish,
} from '@/lib/production/workshop2-bulk-showroom-publish';
import { evaluateBrandMaterialPassportReleaseGateForCollection } from '@/lib/server/brand-material-passport-release-gate-server';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';

type RouteParams = { params: Promise<{ collectionId: string }> };

/** POST bulk showroom publish gate (Wave 7 #6). */
async function postBulkShowroomPublish(req: NextRequest, ctx: RouteParams) {
  const { collectionId: rawCollectionId } = await ctx.params;
  const collectionId = rawCollectionId?.trim();
  if (!collectionId) {
    return jsonWorkshop2ErrorRu(400, 'missing_collection_id');
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const articleIds = Array.isArray((body as { articleIds?: unknown }).articleIds)
    ? (body as { articleIds: unknown[] }).articleIds.map((id) => String(id).trim()).filter(Boolean)
    : [];

  if (!articleIds.length) {
    return jsonWorkshop2ErrorRu(400, 'invalid_request', {
      messageRu: 'Передайте articleIds[] в теле запроса.',
    });
  }

  const releaseGate = await evaluateBrandMaterialPassportReleaseGateForCollection({ collectionId });
  if (releaseGate.blocked) {
    return jsonWorkshop2ErrorRu(409, 'material_passport_release_gate', {
      messageRu: releaseGate.messageRu,
      summary: releaseGate.summary,
      storageMode: releaseGate.storageMode,
    });
  }

  const publishDefaults = (body as { publish?: Record<string, unknown> }).publish;

  const results = await Promise.all(
    articleIds.map(async (articleId) => {
      const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
      const result = evaluateWorkshop2BulkShowroomPublishForArticle({
        articleId,
        dossier: record?.dossier ?? null,
        publish: publishDefaults as Parameters<
          typeof evaluateWorkshop2BulkShowroomPublishForArticle
        >[0]['publish'],
      });
      if (result.passed) {
        void enqueueWorkshop2DomainEvent({
          type: 'showroom.published',
          collectionId,
          articleId,
          payload: {
            campaignName: result.campaignName,
            source: 'bulk_showroom_publish',
            gateScope: 'showroom_publish',
          },
        }).catch(() => {
          /* best-effort */
        });
      }
      return result;
    })
  );

  const summary = summarizeWorkshop2BulkShowroomPublish({ collectionId, results });

  return NextResponse.json({
    ok: true,
    passed: summary.passed,
    blocked: summary.blocked,
    results: summary.results,
    messageRu: summary.blocked.length
      ? `Bulk showroom: ${summary.passed} прошли, ${summary.blocked.length} заблокированы.`
      : `Bulk showroom: все ${summary.passed} артикул(ов) прошли gate.`,
  });
}

export const POST = withWorkshop2ApiErrorRu(postBulkShowroomPublish);
