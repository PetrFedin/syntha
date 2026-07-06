import { NextRequest, NextResponse } from 'next/server';

import { getPlatformCoreCommsForArticle } from '@/lib/platform-core-gateways/entity-comms-gateway';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

/** GET — entity-linked thread + calendar для артикула. */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const org = req.nextUrl.searchParams.get('organizationId') ?? undefined;
  const result = await getPlatformCoreCommsForArticle({ collectionId, articleId, organizationId: org });
  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.reason === 'invalid_path' ? 400 : 404,
    });
  }
  return NextResponse.json(result);
}
