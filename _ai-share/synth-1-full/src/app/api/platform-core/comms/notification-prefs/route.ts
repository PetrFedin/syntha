import { NextRequest, NextResponse } from 'next/server';

import type { PlatformCoreCommsNotificationPrefs } from '@/lib/platform-core-comms-notification-prefs';
import { bumpPlatformCoreCommsNotificationPrefs } from '@/lib/server/platform-core-comms-notification-prefs-hub';
import {
  getPlatformCoreCommsNotificationPrefsServer,
  putPlatformCoreCommsNotificationPrefsServer,
  type PlatformCoreCommsNotificationRole,
} from '@/lib/server/platform-core-comms-notification-prefs-server';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

const ROLES: PlatformCoreCommsNotificationRole[] = ['shop', 'brand', 'manufacturer', 'supplier'];

function resolveRole(raw: string | null): PlatformCoreCommsNotificationRole {
  const v = raw?.trim() as PlatformCoreCommsNotificationRole;
  return ROLES.includes(v) ? v : 'shop';
}

async function resolveScopeKey(
  req: NextRequest,
  role: PlatformCoreCommsNotificationRole
): Promise<string | NextResponse> {
  let scopeKey = req.nextUrl.searchParams.get('scopeKey')?.trim() ?? '';
  if (role === 'shop') {
    const checkoutAuth = await guardShopB2bCheckoutRoute(req);
    if (checkoutAuth instanceof NextResponse) return checkoutAuth;
    scopeKey =
      scopeKey ||
      resolveShopCoreBuyerIdFromRequest(req, req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId);
    return scopeKey;
  }
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;
  return scopeKey || auth.organizationId || 'org-brand-001';
}

/** GET — PG prefs уведомлений comms по role×scope (S2). */
export async function GET(req: NextRequest) {
  const role = resolveRole(req.nextUrl.searchParams.get('role'));
  const scopeKey = await resolveScopeKey(req, role);
  if (scopeKey instanceof NextResponse) return scopeKey;

  const { prefs, storageMode } = await getPlatformCoreCommsNotificationPrefsServer({
    role,
    scopeKey,
  });
  return NextResponse.json({ ok: true, role, scopeKey, prefs, storageMode });
}

/** PUT — сохранить prefs (S2). */
export async function PUT(req: NextRequest) {
  const role = resolveRole(req.nextUrl.searchParams.get('role'));
  const scopeKey = await resolveScopeKey(req, role);
  if (scopeKey instanceof NextResponse) return scopeKey;

  const body = (await req.json()) as { prefs?: PlatformCoreCommsNotificationPrefs };
  if (!body.prefs) {
    return NextResponse.json({ ok: false, messageRu: 'Нет prefs' }, { status: 400 });
  }

  const result = await putPlatformCoreCommsNotificationPrefsServer({
    role,
    scopeKey,
    prefs: body.prefs,
  });
  bumpPlatformCoreCommsNotificationPrefs({ role, scopeKey });
  return NextResponse.json({ ok: true, role, scopeKey, storageMode: result.storageMode });
}
