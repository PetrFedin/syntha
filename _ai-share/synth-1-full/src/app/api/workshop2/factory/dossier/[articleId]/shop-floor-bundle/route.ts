import { NextRequest, NextResponse } from 'next/server';
import { getWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { buildPlatformCoreShopFloorBundleText } from '@/lib/server/platform-core-shop-floor-bundle';
import { getPlatformCoreDemoByArticleId } from '@/lib/platform-core-hub-matrix';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ articleId: string }> };

/** GET — plain-text shop-floor bundle (mfr×op PDF substitute for core path). */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { articleId: rawArticle } = await ctx.params;
  const articleId = rawArticle?.trim();
  if (!articleId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан articleId.' }, { status: 400 });
  }

  const collectionId =
    req.nextUrl.searchParams.get('collectionId')?.trim() ||
    getPlatformCoreDemoByArticleId(articleId).collectionId;
  const b2bOrderId =
    req.nextUrl.searchParams.get('orderId')?.trim() ||
    req.nextUrl.searchParams.get('order')?.trim() ||
    undefined;

  let dossier = getWorkshop2Phase1Dossier(collectionId, articleId) ?? null;
  if (!dossier) {
    const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
    dossier = record?.dossier ?? null;
  }
  if (!dossier) {
    return NextResponse.json(
      { ok: false, messageRu: 'Досье артикула не найдено.' },
      { status: 404 }
    );
  }

  const text = await buildPlatformCoreShopFloorBundleText({
    collectionId,
    articleId,
    b2bOrderId,
    dossier,
  });

  const filename = `shop-floor-${articleId}${b2bOrderId ? `-${b2bOrderId}` : ''}.txt`;
  return new NextResponse(text, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
