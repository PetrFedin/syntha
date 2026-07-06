/**
 * GET — hub rollup: sample orders by status (collection или multi-article scope).
 *
 * Query:
 * - collectionId — одна коллекция
 * - articles — comma-separated `collectionId:articleId` для агрегации видимых карточек
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildWorkshop2HubProductionRollupSnapshot,
  parseWorkshop2HubArticleScope,
} from '@/lib/server/workshop2-hub-production-rollup-server';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

export const GET = withWorkshop2ApiErrorRu(async function getHubProductionRollup(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const articleScope = parseWorkshop2HubArticleScope(req.nextUrl.searchParams.get('articles'));

  if (!collectionId && articleScope.length === 0) {
    return jsonWorkshop2ErrorRu(400, 'collection_id_required', {
      messageRu: 'Укажите collectionId или articles=col:art,col:art.',
    });
  }

  const rollup = await buildWorkshop2HubProductionRollupSnapshot({
    collectionId: collectionId || undefined,
    articleScope: articleScope.length > 0 ? articleScope : undefined,
  });

  if (!rollup) {
    return jsonWorkshop2ErrorRu(400, 'collection_id_required', {
      messageRu: 'Укажите collectionId или articles=col:art,col:art.',
    });
  }

  return NextResponse.json({
    ok: true,
    ...rollup,
  });
});
