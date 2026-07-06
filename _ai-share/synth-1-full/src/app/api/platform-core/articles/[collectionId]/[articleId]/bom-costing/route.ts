import { NextRequest, NextResponse } from 'next/server';

import { getPlatformCoreBomCostingForArticle } from '@/lib/platform-core-gateways/bom-costing-gateway';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

/** GET — узкий BOM/costing snapshot для Platform Core (read-only). */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const result = await getPlatformCoreBomCostingForArticle({ collectionId, articleId });
  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.reason === 'invalid_path' ? 400 : 404,
    });
  }
  return NextResponse.json(result);
}
