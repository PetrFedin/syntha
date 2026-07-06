import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import {
  assembleRangePlannerArticle,
  assembleWorkshop2HubDialogArticle,
  parseRangePlannerTier,
  type RangePlannerTier,
} from '@/lib/production/workshop2-range-planner-bridge';
import { brandDevelopmentArticleHref } from '@/lib/platform-core-routes';
import { resolveWorkshop2ActorFromRequest } from '@/lib/server/workshop2-actor-from-request';
import { putWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/workshop2/articles — Range Planner или W2 hub dialog → PG commit.
 * Body (tier): { collectionId?, tier, budget?, targetMargin?, sku?, commit? }
 * Body (dialog): { collectionId?, sku, categoryLeafId, name?, comment?, commit? }
 */
export async function POST(req: NextRequest) {
  const auth = guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const b = body as {
    collectionId?: string;
    tier?: string;
    budget?: number;
    targetMargin?: number;
    sku?: string;
    categoryLeafId?: string;
    name?: string;
    comment?: string;
    commit?: boolean;
  };

  const collectionId = b.collectionId?.trim() || 'SS27';
  const actorRes = await resolveWorkshop2ActorFromRequest(req);
  const updatedBy = actorRes.ok ? actorRes.actor.actorLabel : 'range-planner';

  const tier = parseRangePlannerTier(b.tier) as RangePlannerTier | null;
  const dialogSku = b.sku?.trim();
  const dialogLeaf = b.categoryLeafId?.trim();

  let built:
    | ReturnType<typeof assembleRangePlannerArticle>
    | ReturnType<typeof assembleWorkshop2HubDialogArticle>;

  if (tier) {
    built = assembleRangePlannerArticle({
      collectionId,
      tier,
      budget: typeof b.budget === 'number' ? b.budget : undefined,
      targetMargin: typeof b.targetMargin === 'number' ? b.targetMargin : undefined,
      sku: dialogSku,
      updatedBy,
    });
  } else if (dialogSku && dialogLeaf) {
    built = assembleWorkshop2HubDialogArticle({
      collectionId,
      sku: dialogSku,
      categoryLeafId: dialogLeaf,
      name: b.name?.trim(),
      comment: b.comment?.trim(),
      updatedBy,
    });
  } else {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_body',
        message: 'tier (core|trend|novelty) или sku + categoryLeafId',
      },
      { status: 400 }
    );
  }

  if (!built.ok) {
    return NextResponse.json({ ok: false, error: built.error }, { status: 400 });
  }

  let committed = false;
  if (b.commit === true) {
    const putRes = await putWorkshop2ServerDossierRecord({
      collectionId,
      articleId: built.articleId,
      dossier: built.assembly.dossier,
      updatedBy,
    });
    if (!putRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: putRes.error ?? 'put_failed',
          articleId: built.articleId,
          sku: 'prefill' in built ? built.prefill.sku : built.sku,
        },
        { status: putRes.error === 'version_conflict' ? 409 : 500 }
      );
    }
    committed = true;
    const { bumpPlatformCoreDevelopmentStatus } =
      await import('@/lib/server/platform-core-development-status-hub');
    bumpPlatformCoreDevelopmentStatus([collectionId]);
  }

  const sku =
    'prefill' in built ? built.prefill.sku : built.sku;
  const tierOut = 'prefill' in built ? built.prefill.tier : undefined;
  const prefill = 'prefill' in built ? built.prefill : undefined;

  return NextResponse.json({
    ok: true,
    collectionId,
    articleId: built.articleId,
    sku,
    ...(tierOut ? { tier: tierOut } : {}),
    committed,
    ...(prefill ? { prefill } : {}),
    preview: built.assembly.preview.oneLineRu,
    href: brandDevelopmentArticleHref(collectionId, built.articleId),
  });
}
