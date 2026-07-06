import { NextRequest, NextResponse } from 'next/server';

import {
  listPlatformCoreNotificationEvents,
  type PlatformCoreNotificationRole,
} from '@/lib/server/platform-core-notification-events-repository';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

const ROLES: PlatformCoreNotificationRole[] = ['shop', 'brand', 'manufacturer', 'supplier'];

function resolveRole(raw: string | null): PlatformCoreNotificationRole {
  const v = raw?.trim() as PlatformCoreNotificationRole;
  return ROLES.includes(v) ? v : 'shop';
}

/** GET — PG notification_events по role/order (S4). */
export async function GET(req: NextRequest) {
  const role = resolveRole(req.nextUrl.searchParams.get('role'));
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() ?? '';
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';

  let scopeKey = req.nextUrl.searchParams.get('scopeKey')?.trim() ?? '';

  if (role === 'shop') {
    const checkoutAuth = await guardShopB2bCheckoutRoute(req);
    if (checkoutAuth instanceof NextResponse) return checkoutAuth;
    scopeKey =
      scopeKey ||
      resolveShopCoreBuyerIdFromRequest(
        req,
        req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
      );
  } else {
    const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
    if (auth instanceof NextResponse) return auth;
    scopeKey = scopeKey || auth.organizationId || 'org-brand-001';
  }

  const { events, storageMode } = await listPlatformCoreNotificationEvents({
    role,
    scopeKey,
    orderId: orderId || undefined,
  });

  return NextResponse.json({
    ok: true,
    role,
    orderId: orderId || undefined,
    collectionId: collectionId || undefined,
    events,
    storageMode,
    messageRu:
      events.length > 0
        ? `${events.length} событий в центре уведомлений.`
        : 'Нет событий — push появится после смены chain-status.',
  });
}
