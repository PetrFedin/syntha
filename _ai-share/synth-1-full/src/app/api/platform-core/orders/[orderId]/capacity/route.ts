import { NextRequest, NextResponse } from 'next/server';

import { getPlatformCoreCapacityForOrder } from '@/lib/platform-core-gateways/capacity-gateway';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ orderId: string }> };

/** GET — capacity snapshot для production_start_ready gate. */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { orderId } = await ctx.params;
  const factoryId = req.nextUrl.searchParams.get('factoryId') ?? undefined;
  const startDate = req.nextUrl.searchParams.get('startDate') ?? undefined;

  const result = await getPlatformCoreCapacityForOrder({ orderId, factoryId, startDate });
  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.reason === 'invalid_path' ? 400 : 404,
    });
  }
  return NextResponse.json(result);
}
