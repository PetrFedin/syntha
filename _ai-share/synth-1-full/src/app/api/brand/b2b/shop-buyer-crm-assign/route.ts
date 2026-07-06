import { NextRequest, NextResponse } from 'next/server';

import { parsePriceTierId } from '@/lib/b2b/price-tiers';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { normalizeShopCoreBuyerId } from '@/lib/order/shop-core-buyer-context';
import { pushBrandPricelistTierSyncToShopServer } from '@/lib/server/brand-pricelist-tier-sync-repository';
import {
  assignShopBuyerCrmProfileServer,
  getShopBuyerCrmProfileServer,
} from '@/lib/server/shop-buyer-crm-profile-repository';

/** GET · read shop buyer CRM assignment (brand onboarding). */
export async function GET(req: NextRequest) {
  const buyerId = normalizeShopCoreBuyerId(req.nextUrl.searchParams.get('buyerId') ?? 'shop2');
  const { profile, storageMode } = await getShopBuyerCrmProfileServer({ buyerId });
  return NextResponse.json({
    ok: true,
    buyerId,
    profile,
    storageMode,
    messageRu: profile
      ? `${profile.segmentNameRu} · net ${profile.netTermDays} дн.`
      : 'CRM-профиль покупателя не назначен.',
  });
}

/** POST · brand assigns CRM segment + pricelist tier to shop buyer. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_BODY' } }, { status: 400 });
  }

  const buyerId = normalizeShopCoreBuyerId(String(body.buyerId ?? 'shop2'));
  const segmentKey = String(body.segmentKey ?? '').trim();
  if (!segmentKey) {
    return NextResponse.json({ ok: false, error: { code: 'MISSING_FIELDS' } }, { status: 400 });
  }

  const onboardingNoteRu =
    typeof body.onboardingNoteRu === 'string' && body.onboardingNoteRu.trim()
      ? body.onboardingNoteRu.trim()
      : undefined;

  const collectionId =
    String(body.collectionId ?? PLATFORM_CORE_DEMO.collectionId).trim() ||
    PLATFORM_CORE_DEMO.collectionId;
  const syncTierToShop = body.syncTierToShop !== false;

  const { profile, storageMode } = await assignShopBuyerCrmProfileServer({
    buyerId,
    segmentKey,
    onboardingNoteRu,
  });

  if (!profile) {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  let tierSync:
    | {
        ok: boolean;
        tierId?: string;
        shopSynced?: boolean;
        syncedAt?: string;
        skipped?: boolean;
        reason?: string;
      }
    | undefined;

  const tierId = parsePriceTierId(profile.priceTier);
  if (!syncTierToShop) {
    tierSync = { ok: true, skipped: true, reason: 'sync_disabled' };
  } else if (!tierId) {
    tierSync = { ok: false, skipped: true, reason: 'unknown_tier' };
  } else {
    try {
      const pushed = await pushBrandPricelistTierSyncToShopServer({ collectionId, tierId });
      tierSync = {
        ok: true,
        tierId,
        shopSynced: pushed.row.shopSynced,
        syncedAt: pushed.row.syncedAt,
      };
    } catch {
      tierSync = { ok: false, tierId, reason: 'tier_sync_failed' };
    }
  }

  const tierSyncNote =
    tierSync?.ok && tierSync.shopSynced
      ? ` · tier ${tierSync.tierId} → shop matrix`
      : tierSync?.skipped
        ? ''
        : tierSync?.reason
          ? ` · tier sync: ${tierSync.reason}`
          : '';

  return NextResponse.json({
    ok: true,
    buyerId,
    collectionId,
    profile,
    storageMode,
    tierSync,
    messageRu: `Сегмент «${profile.segmentNameRu}» назначен · ${profile.priceTier}${tierSyncNote}`,
  });
}
