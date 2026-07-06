/**
 * POST — пакетное назначение tier артикулам range planner (Wave UM · Wave XG).
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  brandRangePlannerBulkTierAssignMessageRu,
  RANGE_PLANNER_BULK_TIER_MAX_BATCH,
} from '@/lib/production/wave-xg-brand-range-planner';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { bumpPlatformCoreDevelopmentStatus } from '@/lib/server/platform-core-development-status-hub';
import { bulkAssignWorkshop2ArticleRangePlannerTier } from '@/lib/server/workshop2-range-planner-repository';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

export const POST = withWorkshop2ApiErrorRu(async function postBulkTierAssign(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const b = body as {
    collectionId?: string;
    tier?: string;
    articleIds?: string[];
    allowPartial?: boolean;
  };

  const collectionId = b.collectionId?.trim() ?? '';
  const tier = b.tier?.trim() ?? '';
  const articleIds = Array.isArray(b.articleIds)
    ? b.articleIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  const allowPartial = b.allowPartial !== false;

  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан collectionId.' }, { status: 400 });
  }
  if (!tier || articleIds.length === 0) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите tier и хотя бы один articleId.' },
      { status: 400 }
    );
  }
  if (articleIds.length > RANGE_PLANNER_BULK_TIER_MAX_BATCH) {
    return NextResponse.json(
      {
        ok: false,
        error: 'batch_too_large',
        messageRu: `Не более ${RANGE_PLANNER_BULK_TIER_MAX_BATCH} артикулов за один запрос.`,
      },
      { status: 400 }
    );
  }

  const bulk = await bulkAssignWorkshop2ArticleRangePlannerTier({
    collectionId,
    tier,
    articleIds,
  });
  if (!bulk.ok) {
    const status =
      bulk.error === 'pg_disabled'
        ? 503
        : bulk.error === 'invalid_tier' || bulk.error === 'empty_batch'
          ? 400
          : 400;
    return NextResponse.json(
      { ok: false, error: bulk.error, messageRu: bulk.messageRu },
      { status }
    );
  }

  const partial = bulk.failed > 0;
  if (!allowPartial && partial) {
    return NextResponse.json(
      {
        ok: false,
        error: 'partial_not_allowed',
        assigned: bulk.assigned,
        failed: bulk.failed,
        tier,
        messageRu: brandRangePlannerBulkTierAssignMessageRu(
          bulk.assigned,
          bulk.failed,
          articleIds.length
        ),
      },
      { status: 409 }
    );
  }

  bumpPlatformCoreDevelopmentStatus([collectionId]);
  return NextResponse.json({
    ok: true,
    assigned: bulk.assigned,
    failed: bulk.failed,
    bulkAssigned: true,
    partial,
    tier,
    wave: 'xg',
    messageRu: brandRangePlannerBulkTierAssignMessageRu(
      bulk.assigned,
      bulk.failed,
      articleIds.length
    ),
  });
});
