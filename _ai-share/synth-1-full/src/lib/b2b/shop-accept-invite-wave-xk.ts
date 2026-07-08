import { B2B_PARTNER_TIER_COOKIE } from '@/lib/b2b/resolve-b2b-buyer-tier';
import {
  SHOP_B2B_CART_SESSION_COOKIE,
  SHOP_CORE_BUYER_COOKIE,
} from '@/lib/order/shop-core-buyer-context';
/** Wave XK — accept-invite partner session/tier PG (no localStorage in core). */
export const SHOP_ACCEPT_INVITE_API_PATH = '/api/shop/b2b/accept-invite' as const;

export const SHOP_ACCEPT_INVITE_PAGE_PATH = '/shop/b2b/accept-invite' as const;

export const SHOP_ACCEPT_INVITE_PG_TABLE = 'shop_b2b_partner_sessions' as const;

export const SHOP_ACCEPT_INVITE_WAVE_XK_MIGRATION =
  '042_wave_se_matrix_draft_stages_invite' as const;

export const SHOP_ACCEPT_INVITE_PG_BADGE_TESTID = 'b2b-accept-invite-storage-pg' as const;

export const SHOP_ACCEPT_INVITE_PANEL_TESTID = 'b2b-accept-invite' as const;

export const SHOP_ACCEPT_INVITE_PARTNER_COOKIES = [
  SHOP_B2B_CART_SESSION_COOKIE,
  B2B_PARTNER_TIER_COOKIE,
  SHOP_CORE_BUYER_COOKIE,
] as const;

export function shopAcceptInvitePageHref(token: string): string {
  const params = new URLSearchParams({ token: token.trim() });
  return `${SHOP_ACCEPT_INVITE_PAGE_PATH}?${params.toString()}`;
}

export function shopAcceptInviteApiPath(): string {
  return SHOP_ACCEPT_INVITE_API_PATH;
}
