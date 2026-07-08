import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  SHOP_PRODUCTION_VISIBILITY_HINTS_RU,
  SHOP_PRODUCTION_VISIBILITY_LABELS_RU,
  getShopProductionVisibilityPolicy,
  isShopProductionVisibility,
} from '@/lib/platform-core-shop-production-visibility';
import {
  getCollectionShopProductionVisibility,
  patchCollectionShopProductionVisibility,
} from '@/lib/server/workshop2-shop-production-visibility-repository';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string }> };

export const GET = withWorkshop2ApiErrorRu(async function getShopProductionVisibility(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId } = await ctx.params;
  const cid = collectionId?.trim() ?? '';
  if (!cid) return jsonWorkshop2ErrorRu(400, 'missing_collection');

  const { visibility, source } = await getCollectionShopProductionVisibility(cid);
  const policy = getShopProductionVisibilityPolicy(visibility);

  return NextResponse.json({
    ok: true,
    collectionId: cid,
    visibility,
    source,
    labelRu: SHOP_PRODUCTION_VISIBILITY_LABELS_RU[visibility],
    hintRu: SHOP_PRODUCTION_VISIBILITY_HINTS_RU[visibility],
    policy: {
      showProductionOrderId: policy.showProductionOrderId,
      showFactoryDetails: policy.showFactoryDetails,
      showMaterialsStep: policy.showMaterialsStep,
      showInventoryReserve: policy.showInventoryReserve,
      showWipDetail: policy.showWipDetail,
      showShipmentTracking: policy.showShipmentTracking,
    },
  });
});

export const PATCH = withWorkshop2ApiErrorRu(async function patchShopProductionVisibility(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId } = await ctx.params;
  const cid = collectionId?.trim() ?? '';
  if (!cid) return jsonWorkshop2ErrorRu(400, 'missing_collection');

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const visibility = String(body.visibility ?? '').trim();
  if (!isShopProductionVisibility(visibility)) {
    return jsonWorkshop2ErrorRu(400, 'invalid_visibility', {
      messageRu: 'visibility: none | milestones | logistics | full',
    });
  }

  const result = await patchCollectionShopProductionVisibility({ collectionId: cid, visibility });
  if (!result.ok) {
    return jsonWorkshop2ErrorRu(400, result.error, { messageRu: result.messageRu });
  }

  const resolved = await getCollectionShopProductionVisibility(cid);
  const policy = getShopProductionVisibilityPolicy(resolved.visibility);
  return NextResponse.json({
    ok: true,
    collectionId: cid,
    visibility: resolved.visibility,
    source: resolved.source,
    labelRu: SHOP_PRODUCTION_VISIBILITY_LABELS_RU[resolved.visibility],
    policy: {
      showProductionOrderId: policy.showProductionOrderId,
      showMaterialsStep: policy.showMaterialsStep,
      showInventoryReserve: policy.showInventoryReserve,
      showWipDetail: policy.showWipDetail,
      showShipmentTracking: policy.showShipmentTracking,
    },
  });
});
