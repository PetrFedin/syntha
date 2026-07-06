import { NextRequest, NextResponse } from 'next/server';

import { getPlatformCoreShipmentForOrder } from '@/lib/platform-core-gateways/shipment-gateway';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ orderId: string }> };

/** GET — shipment/ASN gate (QC + documents + DPP + logistics). */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { orderId } = await ctx.params;
  const org = req.nextUrl.searchParams.get('organizationId') ?? undefined;
  const result = await getPlatformCoreShipmentForOrder({ orderId, organizationId: org });
  if (!result.ok) {
    return NextResponse.json(result, {
      status: result.reason === 'invalid_path' ? 400 : 404,
    });
  }
  return NextResponse.json(result);
}
