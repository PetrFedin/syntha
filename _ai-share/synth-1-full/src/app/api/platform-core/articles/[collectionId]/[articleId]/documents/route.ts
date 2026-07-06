import { NextRequest, NextResponse } from 'next/server';

import { getPlatformCoreDocumentsForArticle } from '@/lib/platform-core-gateways/documents-gateway';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

/** GET — document packet snapshot для handoff/shipment/closeout gates. */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const stage = req.nextUrl.searchParams.get('stage') ?? undefined;
  const orderId = req.nextUrl.searchParams.get('orderId') ?? undefined;

  const result = await getPlatformCoreDocumentsForArticle({
    collectionId,
    articleId,
    stage,
    orderId,
  });
  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.reason === 'invalid_path' ? 400 : 404,
    });
  }
  return NextResponse.json(result);
}
