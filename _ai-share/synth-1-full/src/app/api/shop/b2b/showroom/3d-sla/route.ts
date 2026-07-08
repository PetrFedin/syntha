import { NextRequest, NextResponse } from 'next/server';

import { summarizeWorkshop2B2b3dSlaFromJournal } from '@/lib/production/workshop2-b2b-3d-sla';
import { readWorkshop2SloTargetsFromDisk } from '@/lib/production/workshop2-ops-sla-dashboard';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET B2B 3D SLA aggregates из journal_only. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const summary = summarizeWorkshop2B2b3dSlaFromJournal();
  const sloTargets = readWorkshop2SloTargetsFromDisk();
  const sloOk = summary.sessionCount === 0 || summary.errorRatePct <= sloTargets.b2b3dErrorRatePct;
  return NextResponse.json({
    ok: true,
    ...summary,
    sloTargets,
    sloOk,
  });
}
