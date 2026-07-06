import { shopCoreBuyerLabelRu } from '@/lib/order/shop-core-buyer-context';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-demo-context';
import { shopB2bMatrixReorderHref } from '@/lib/routes';
import {
  SHOP_SC_CABINET_BUYER_PROFILE_DEMO_RU,
  SHOP_SC_CABINET_BUYER_PROFILE_MEMORY_RU,
  SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU,
} from '@/lib/b2b/shop-sc-cabinet-buyer-profile-honesty';
import type { ShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';
import { resolveShopBuyerDefaultSegmentKey } from '@/lib/b2b/shop-buyer-crm-profile';
import {
  SHOP_GREENFIELD_DEFAULT_BUYER_ID,
  shopGreenfieldOnboardingApiPath,
  type ShopGreenfieldOnboardingSnapshot,
} from '@/lib/b2b/shop-greenfield-registry-wave-xx';

/** Wave YM — EMPTY27 shop SC onboarding: PG buyer profile read/write + greenfield dedupe (extends UW/VN/XX). */
export const SHOP_EMPTY27_BUYER_PROFILE_API = '/api/shop/b2b/buyer-crm-profile' as const;

export const SHOP_EMPTY27_ONBOARDING_COLLECTION_ID = 'EMPTY27' as const;

export const SHOP_EMPTY27_MATRIX_SEED_COLLECTION_ID = 'SS27' as const;

export const SHOP_EMPTY27_WAVE_YM_MIGRATION = '061_wave_uw_shop_partnership_invite_journal' as const;

export const SHOP_EMPTY27_ONBOARDING_STRIP_TESTID = 'shop-sc-empty27-onboarding-strip' as const;
export const SHOP_EMPTY27_ONBOARDING_PG_TESTID = 'shop-sc-empty27-onboarding-pg' as const;
export const SHOP_EMPTY27_ONBOARDING_MEMORY_TESTID = 'shop-sc-empty27-onboarding-memory' as const;
export const SHOP_EMPTY27_ONBOARDING_GREENFIELD_TESTID =
  'shop-sc-empty27-onboarding-greenfield' as const;
export const SHOP_EMPTY27_ONBOARDING_CRM_TESTID = 'shop-sc-empty27-onboarding-crm' as const;
export const SHOP_EMPTY27_ONBOARDING_PRICELIST_TESTID =
  'shop-sc-empty27-onboarding-pricelist' as const;
export const SHOP_EMPTY27_ONBOARDING_HINT_TESTID = 'shop-sc-empty27-onboarding-hint' as const;
export const SHOP_EMPTY27_GREENFIELD_HINT_TESTID = 'shop-sc-empty27-greenfield-hint' as const;
export const SHOP_EMPTY27_ONBOARDING_PARTNERS_LINK_TESTID =
  'shop-sc-empty27-onboarding-partners-link' as const;
export const SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID =
  'shop-sc-empty27-onboarding-matrix-link' as const;
export const SHOP_EMPTY27_ONBOARDING_SEED_PROFILE_TESTID =
  'shop-sc-empty27-onboarding-seed-profile' as const;

export const SHOP_EMPTY27_BUYER_PROFILE_STRIP_TESTID = 'shop-sc-cabinet-buyer-profile-strip' as const;
export const SHOP_EMPTY27_BUYER_PROFILE_PG_TESTID = 'shop-sc-cabinet-buyer-profile-pg' as const;
export const SHOP_EMPTY27_BUYER_PROFILE_MEMORY_TESTID =
  'shop-sc-cabinet-buyer-profile-memory' as const;
export const SHOP_EMPTY27_BUYER_PROFILE_DEMO_TESTID = 'shop-sc-cabinet-buyer-profile-demo' as const;
export const SHOP_EMPTY27_BUYER_PROFILE_NO_SEGMENT_TESTID =
  'shop-sc-cabinet-buyer-profile-no-segment' as const;
export const SHOP_EMPTY27_BUYER_PROFILE_SEGMENT_TESTID =
  'shop-sc-cabinet-buyer-profile-segment' as const;
export const SHOP_EMPTY27_BUYER_PROFILE_REFRESH_TESTID =
  'shop-sc-cabinet-buyer-profile-refresh' as const;

export const SHOP_EMPTY27_ONBOARDING_TITLE_RU = 'Онбординг';
export const SHOP_EMPTY27_BUYER_PROFILE_TITLE_RU = 'Профиль покупателя';
export const SHOP_EMPTY27_BUYER_PROFILE_LOADING_RU = 'Загрузка CRM-профиля…';
export const SHOP_EMPTY27_BUYER_PROFILE_NO_SEGMENT_HINT_RU =
  'Подключите партнёра или попросите бренд назначить tier.';
export const SHOP_EMPTY27_GREENFIELD_HINT_RU =
  'Подключите партнёра или назначьте CRM-сегмент — затем перейдите в матрицу SS27.';
export const SHOP_EMPTY27_BUYER_PROFILE_SEED_CTA_RU = 'Инициализировать PG';
export const SHOP_EMPTY27_BUYER_PROFILE_SEED_BUSY_RU = 'Запись PG…';
export const SHOP_EMPTY27_BUYER_PROFILE_REFRESH_RU = 'Обновить';
export const SHOP_EMPTY27_MATRIX_LINK_RU = 'Матрица SS27';
export const SHOP_EMPTY27_PARTNERS_LINK_RU = 'Каталог партнёров';

export {
  SHOP_SC_CABINET_BUYER_PROFILE_DEMO_RU,
  SHOP_SC_CABINET_BUYER_PROFILE_MEMORY_RU,
  SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU,
};

export function shopEmpty27BuyerProfileApiPath(buyerId: string): string {
  const params = new URLSearchParams({
    buyerId: buyerId.trim() || SHOP_GREENFIELD_DEFAULT_BUYER_ID,
  });
  return `${SHOP_EMPTY27_BUYER_PROFILE_API}?${params.toString()}`;
}

export function shopEmpty27GreenfieldOnboardingApiPath(
  buyerId: string,
  collectionId: string = SHOP_EMPTY27_ONBOARDING_COLLECTION_ID
): string {
  return shopGreenfieldOnboardingApiPath(buyerId, collectionId);
}

export function shopEmpty27OnboardingTitleRu(collectionId: string): string {
  return `${SHOP_EMPTY27_ONBOARDING_TITLE_RU} · ${getPlatformCoreCollectionLabel(collectionId)}`;
}

export function shopEmpty27OnboardingStorageBadgeTestId(
  storageMode: string | null | undefined
): string | null {
  if (storageMode === 'postgres') return SHOP_EMPTY27_ONBOARDING_PG_TESTID;
  if (storageMode === 'memory') return SHOP_EMPTY27_ONBOARDING_MEMORY_TESTID;
  return null;
}

export function shopEmpty27BuyerProfileStorageBadgeTestId(
  storageMode: string | null | undefined
): string | null {
  if (storageMode === 'pg') return SHOP_EMPTY27_BUYER_PROFILE_PG_TESTID;
  if (storageMode === 'memory') return SHOP_EMPTY27_BUYER_PROFILE_MEMORY_TESTID;
  if (storageMode === 'demo') return SHOP_EMPTY27_BUYER_PROFILE_DEMO_TESTID;
  return null;
}

export function shopEmpty27BuyerProfileStorageBadgeRu(
  storageMode: string | null | undefined
): string | null {
  if (storageMode === 'pg') return 'PG';
  if (storageMode === 'memory') return SHOP_SC_CABINET_BUYER_PROFILE_MEMORY_RU;
  if (storageMode === 'demo') return SHOP_SC_CABINET_BUYER_PROFILE_DEMO_RU;
  return null;
}

export function shopEmpty27GreenfieldHintRu(state: ShopGreenfieldOnboardingSnapshot | null): string {
  if (state?.crmReady && state?.pricelistReady) {
    return `${shopCoreBuyerLabelRu(SHOP_GREENFIELD_DEFAULT_BUYER_ID)}: CRM и прайс готовы — откройте матрицу SS27.`;
  }
  return SHOP_EMPTY27_GREENFIELD_HINT_RU;
}

export function shopEmpty27MatrixSeedHref(input: {
  buyerId: string;
  state?: ShopGreenfieldOnboardingSnapshot | null;
}): string {
  return (
    input.state?.matrixSeedHref ??
    shopB2bMatrixReorderHref(
      SHOP_EMPTY27_MATRIX_SEED_COLLECTION_ID,
      input.state?.firstOrderId ?? '',
      { buyerId: input.buyerId.trim() || SHOP_GREENFIELD_DEFAULT_BUYER_ID }
    )
  );
}

export function shopEmpty27BuyerProfileReadMessageRu(
  profile: ShopBuyerCrmProfile | null
): string {
  if (!profile) {
    return `${SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU} · ${SHOP_EMPTY27_BUYER_PROFILE_NO_SEGMENT_HINT_RU}`;
  }
  return `${profile.segmentNameRu} · net ${profile.netTermDays} дн. · ${profile.priceTier}`;
}

export function shopEmpty27BuyerProfileSeedNoteRu(buyerId: string): string {
  const label = shopCoreBuyerLabelRu(buyerId);
  return `${label}: EMPTY27 onboarding — сегмент назначен для первого заказа через витрину SS27.`;
}

export function shopEmpty27BuyerProfileWriteMessageRu(
  profile: ShopBuyerCrmProfile | null,
  storageMode: string | null | undefined
): string {
  if (!profile) return 'CRM-профиль покупателя недоступен.';
  const storage =
    storageMode === 'pg' ? 'PG' : storageMode === 'memory' ? SHOP_SC_CABINET_BUYER_PROFILE_MEMORY_RU : '—';
  return `Сегмент «${profile.segmentNameRu}» записан · ${storage}`;
}

export function resolveShopEmpty27BuyerProfileSeedSegmentKey(buyerId: string): string {
  return resolveShopBuyerDefaultSegmentKey(buyerId);
}

/** Embedded buyer profile in EMPTY27 strip — hide peer CTAs (greenfield section owns links). */
export function shopEmpty27BuyerProfileOmitsPeerLinks(surface: 'embedded' | 'standalone'): boolean {
  return surface === 'embedded';
}
