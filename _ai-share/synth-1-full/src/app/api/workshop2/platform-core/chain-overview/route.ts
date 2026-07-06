import { NextRequest, NextResponse } from 'next/server';

import { getPlatformCoreChainOverview } from '@/lib/server/platform-core-chain-overview';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET /api/workshop2/platform-core/chain-overview?collectionId=SS27 */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() || 'SS27';
  const overview = await getPlatformCoreChainOverview(collectionId);
  return NextResponse.json({ ok: true, overview });
}
