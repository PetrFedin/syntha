/**
 * POST/GET — comment-only annotations к read-only ТЗ (Wave XN, PG journal).
 */
import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { bumpPlatformCoreDevelopmentStatus } from '@/lib/server/platform-core-development-status-hub';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';
import {
  appendFactoryDossierComment,
  listFactoryDossierComments,
} from '@/lib/server/workshop2-factory-dossier-comments';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

export const GET = withWorkshop2ApiErrorRu(async function getManufacturerDossierComments(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const articleId = req.nextUrl.searchParams.get('articleId')?.trim() ?? '';
  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_context', {
      messageRu: 'Укажите collectionId и articleId.',
    });
  }

  const result = await listFactoryDossierComments({ collectionId, articleId });
  return NextResponse.json(result);
});

export const POST = withWorkshop2ApiErrorRu(async function postManufacturerDossierComment(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const collectionId = String(b.collectionId ?? '').trim();
  const articleId = String(b.articleId ?? '').trim();
  const text = String(b.text ?? '').trim();
  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_context', {
      messageRu: 'Укажите collectionId и articleId.',
    });
  }

  const actor =
    resolveWorkshop2UpdatedBy(req, String(b.actor ?? ''), auth.actor) ?? 'manufacturer-dossier-comment';
  const result = await appendFactoryDossierComment({
    collectionId,
    articleId,
    text,
    actor,
    sectionKey: b.sectionKey != null ? String(b.sectionKey) : undefined,
  });

  if (!result.ok) {
    return jsonWorkshop2ErrorRu(409, 'comment_failed', { messageRu: result.messageRu });
  }

  bumpPlatformCoreDevelopmentStatus([collectionId]);
  return NextResponse.json({
    ok: true,
    comment: result.comment,
    storageMode: result.storageMode,
    messageRu: result.messageRu,
  });
});
