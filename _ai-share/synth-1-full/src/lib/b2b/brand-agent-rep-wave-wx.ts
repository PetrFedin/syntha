import {
  brandAgentRepShopPortalReadOnlyHref,
} from '@/lib/fashion/brand-agent-rep-oversight';
import { SHOP_AGENT_REP_COMMISSION_PAYOUT_API } from '@/lib/b2b/shop-agent-rep-wave-ws';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';

/** Wave WX — brand CO agent rep: commission dispute PG stub + read-only portal RU strip. */
export const BRAND_AGENT_REP_COMMISSION_DISPUTE_API = '/api/brand/b2b/commissions/dispute';

export const BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_STRIP_TESTID =
  'brand-agent-rep-shop-portal-readonly-ru-strip';
export const BRAND_AGENT_REP_SHOP_PORTAL_READONLY_LINK_TESTID =
  'brand-co-agent-rep-shop-portal-readonly-link';
export const BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_LINK_TESTID =
  'brand-agent-rep-shop-rep-payout-peer-link';
export const BRAND_AGENT_REP_COMMISSION_DISPUTE_STORAGE_BADGE_TESTID =
  'brand-agent-rep-commission-dispute-storage-badge';

export const BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_LABEL =
  'Портал магазина · только просмотр';
export const BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_RU_LABEL =
  'Выплата rep · shop ledger (WS)';

export function brandAgentRepShopRepPayoutPeerHref(input?: {
  collectionId?: string;
  repId?: string;
}): string {
  const params = new URLSearchParams({ [PILLAR_CAPABILITY_FEATURE_PARAM]: 'commission' });
  if (input?.collectionId?.trim()) {
    params.set('collection', input.collectionId.trim());
  }
  if (input?.repId?.trim()) {
    params.set('rep', input.repId.trim());
  }
  params.set('payoutPeer', 'brand-dispute');
  return `${ROUTES.shop.b2bSalesRepPortal}?${params.toString()}`;
}

export function brandAgentRepShopPortalReadOnlyLinkHref(): string {
  return brandAgentRepShopPortalReadOnlyHref();
}

export { SHOP_AGENT_REP_COMMISSION_PAYOUT_API };
