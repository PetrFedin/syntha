/**
 * GET /api/shop/b2b/rep/offline-pack — JSON bundle linesheet + cart SS27 (Wave 56).
 */
import { NextRequest, NextResponse } from 'next/server';

import { buildWorkshop2B2bRepOfflinePack } from '@/lib/production/workshop2-b2b-rep-offline-pack';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const repId = req.nextUrl.searchParams.get('repId')?.trim() || 'rep-demo';
  const tenantId = req.nextUrl.searchParams.get('tenantId')?.trim();
  const brandId = req.nextUrl.searchParams.get('brandId')?.trim();
  const sessionId = req.nextUrl.searchParams.get('sessionId')?.trim();

  const pack = buildWorkshop2B2bRepOfflinePack({ repId, tenantId, brandId, sessionId });
  return NextResponse.json(
    { ok: true, pack },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}
