import { NextRequest, NextResponse } from 'next/server';

import {
  getShopCommsNotificationPrefsServer,
  putShopCommsNotificationPrefsServer,
} from '@/lib/server/shop-comms-notification-prefs-server';
import type { PlatformCoreCommsNotificationPrefs } from '@/lib/platform-core-comms-notification-prefs';

export async function GET() {
  const buyerId = 'shop1';
  const { prefs, storageMode } = await getShopCommsNotificationPrefsServer(buyerId);
  return NextResponse.json({ ok: true, prefs, storageMode });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as { prefs?: PlatformCoreCommsNotificationPrefs };
  if (!body.prefs) {
    return NextResponse.json({ ok: false, messageRu: 'Нет prefs' }, { status: 400 });
  }
  const buyerId = 'shop1';
  const result = await putShopCommsNotificationPrefsServer(buyerId, body.prefs);
  return NextResponse.json({ ok: true, storageMode: result.storageMode });
}
