import { ROUTES } from '@/lib/routes';
import { shopPartnersShowroomEligibleForMatrixHref } from '@/lib/b2b/shop-partners-wave-xa';

/** Wave XK — shop accept-invite: partner session/tier PG + cookie (no localStorage in core). */

export const SHOP_PARTNERS_WAVE_XK_MIGRATION = '068_wave_xk_shop_accept_invite_pg' as const;

export const SHOP_B2B_ACCEPT_INVITE_API_PATH = '/api/shop/b2b/accept-invite' as const;

export const SHOP_B2B_PARTNER_SESSION_COOKIE = 'b2b_cart_session' as const;
export const SHOP_B2B_PARTNER_TIER_COOKIE = 'b2b_partner_tier' as const;

export const SHOP_B2B_ACCEPT_INVITE_STORAGE_PG_TESTID = 'b2b-accept-invite-storage-pg';
export const SHOP_B2B_ACCEPT_INVITE_PARTNERS_LINK_TESTID =
  'shop-sc-accept-invite-partners-golden-path-link';
export const SHOP_B2B_ACCEPT_INVITE_SHOWROOM_LINK_TESTID =
  'shop-sc-accept-invite-showroom-eligible-link';

export const SHOP_B2B_ACCEPT_INVITE_GOLDEN_PATH_UAT_RU =
  'UAT: invite → PG partner session → partners catalog → eligible-for-matrix → checkout';

export function shopPartnersAcceptInviteDiscoverHref(input?: {
  collectionId?: string;
  buyerId?: string;
}): string {
  const params = new URLSearchParams({ partnersPeer: 'accept-invite' });
  if (input?.collectionId?.trim()) {
    params.set('collection', input.collectionId.trim());
  }
  if (input?.buyerId?.trim()) {
    params.set('buyer', input.buyerId.trim());
  }
  return `${ROUTES.shop.b2bPartnersDiscover}?${params.toString()}`;
}

export function shopPartnersAcceptInviteShowroomEligibleHref(input?: {
  collectionId?: string;
  buyerId?: string;
}): string {
  return shopPartnersShowroomEligibleForMatrixHref({
    collectionId: input?.collectionId ?? 'SS27',
    buyerId: input?.buyerId,
  });
}
