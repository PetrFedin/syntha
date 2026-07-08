import { SHOP_PARTNERSHIP_INVITE_API_PATH } from '@/lib/b2b/shop-partnership-invite';
import { ROUTES } from '@/lib/routes';

/** Wave XA — shop SC partners catalog: invite PG stub + eligible-for-matrix cross-link. */
export {
  SHOP_PARTNERSHIP_INVITE_API_PATH,
  postShopPartnershipInvite,
} from '@/lib/b2b/shop-partnership-invite';

export const SHOP_PARTNERSHIP_INVITE_PG_TABLE = 'shop_b2b_partnership_invite_journal' as const;

export const SHOP_PARTNERS_WAVE_XA_MIGRATION = '067_wave_xa_shop_partners_catalog_stub' as const;

export const SHOP_B2B_PARTNERS_GOLDEN_PATH_UAT_RU =
  'UAT: ростер → подбор → invite PG → витрина eligible-for-matrix → матрица → трекинг';

export const SHOP_SC_PARTNERS_SHOWROOM_ELIGIBLE_LINK_TESTID =
  'shop-sc-partners-showroom-eligible-for-matrix-link';

export const SHOP_SC_PARTNERS_INVITE_STORAGE_BADGE_TESTID = 'shop-sc-partners-invite-storage-badge';

export const SHOP_SC_PARTNERS_ELIGIBLE_MATRIX_PEER_LABEL_RU = 'Витрина · eligible-for-matrix';

export const SHOP_SC_PARTNERS_CHAT_LINK_TESTID_PREFIX = 'shop-sc-partners-chat-';

/** Legacy alias kept for core-01 smoke (`shop-sc-partners-invite-*`). */
export const SHOP_SC_PARTNERS_CHAT_LINK_LEGACY_TESTID_PREFIX = 'shop-sc-partners-invite-';

export function shopPartnersShowroomEligibleForMatrixHref(input?: {
  collectionId?: string;
  buyerId?: string;
}): string {
  const params = new URLSearchParams({
    eligibleOnly: '1',
    partnersPeer: 'eligible-matrix',
  });
  if (input?.collectionId?.trim()) {
    params.set('collection', input.collectionId.trim());
  }
  if (input?.buyerId?.trim()) {
    params.set('buyerId', input.buyerId.trim());
  }
  return `${ROUTES.shop.b2bShowroom}?${params.toString()}`;
}

export function shopPartnershipInviteApiPath(): string {
  return SHOP_PARTNERSHIP_INVITE_API_PATH;
}
