import { NextRequest, NextResponse } from 'next/server';

import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { isCoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { getPlatformCorePillarSnapshotResilient } from '@/lib/server/platform-core-pillar-snapshot';

import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

/** GET /api/workshop2/platform-core/pillar-snapshot?collectionId=&pillarId=&roleId=&orderId= */
export async function GET(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const sp = req.nextUrl.searchParams;
  const collectionId = sp.get('collectionId')?.trim() || 'SS27';
  const pillarIdRaw = sp.get('pillarId')?.trim() || '';
  if (!isCoreHubPillarId(pillarIdRaw)) {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный pillarId.' }, { status: 400 });
  }
  const roleId = (sp.get('roleId')?.trim() || undefined) as CoreChainRoleId | undefined;
  const wholesaleOrderId = sp.get('orderId')?.trim() || undefined;
  const articleId = sp.get('articleId')?.trim() || undefined;
  const factoryId = sp.get('factoryId')?.trim() || undefined;
  const pillarVariantRaw = sp.get('pillarVariant')?.trim();
  const pillarVariant =
    pillarVariantRaw === 'brand' ||
    pillarVariantRaw === 'shop' ||
    pillarVariantRaw === 'manufacturer'
      ? pillarVariantRaw
      : undefined;

  try {
    const snapshot = await getPlatformCorePillarSnapshotResilient({
      collectionId,
      pillarId: pillarIdRaw as CoreHubPillarId,
      roleId,
      factoryId,
      wholesaleOrderId,
      articleId,
      pillarVariant,
    });
    return NextResponse.json({ ok: true, snapshot });
  } catch (err) {
    throw err;
  }
}
