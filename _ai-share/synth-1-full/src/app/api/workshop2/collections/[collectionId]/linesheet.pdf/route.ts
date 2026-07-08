/**
 * GET collection linesheet PDF — опубликованные артикулы PG (brand pillar 2).
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getPlatformCoreDemo,
  isPlatformCoreEmptyChainCollection,
} from '@/lib/platform-core-demo-context';
import { brandScLinesheetPdfEmptyApiMessageRu } from '@/lib/b2b/brand-sc-linesheet-readpath';
import { resolveWorkshop2B2bArticleHeroImageUrl } from '@/lib/production/workshop2-b2b-article-hero-image';
import { buildWorkshop2CollectionLinesheetPdfBytes } from '@/lib/production/workshop2-collection-linesheet-pdf';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { listWorkshop2PublishedShowroomArticles } from '@/lib/server/workshop2-showroom-repository';

type RouteCtx = { params: Promise<{ collectionId: string }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId: rawId } = await ctx.params;
  const collectionId = rawId?.trim();
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан collectionId.' }, { status: 400 });
  }

  let articles = await listWorkshop2PublishedShowroomArticles(collectionId);

  if (!articles.length && !isPlatformCoreEmptyChainCollection(collectionId)) {
    const demoArticleId = getPlatformCoreDemo(collectionId).demoArticleId;
    const record = await getWorkshop2ServerDossierRecord(collectionId, demoArticleId);
    if (record?.dossier) {
      const name =
        record.dossier.passportProductionBrief?.articleCardOwnerName?.trim() || demoArticleId;
      articles = [
        {
          collectionId,
          articleId: demoArticleId,
          name,
          sku: demoArticleId,
          wholesalePriceRub: 0,
          heroImageUrl: resolveWorkshop2B2bArticleHeroImageUrl(record.dossier),
        },
      ];
    }
  }

  if (!articles.length) {
    return NextResponse.json(
      {
        ok: false,
        messageRu: brandScLinesheetPdfEmptyApiMessageRu(collectionId),
        testId: 'brand-sc-linesheet-pdf-empty-api',
      },
      { status: 404 }
    );
  }

  const bytes = await buildWorkshop2CollectionLinesheetPdfBytes({ collectionId, articles });
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="linesheet-${collectionId}.pdf"`,
    },
  });
}
