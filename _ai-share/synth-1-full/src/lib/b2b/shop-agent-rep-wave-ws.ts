import { brandAgentRepCommissionDisputeHref } from '@/lib/fashion/brand-agent-rep-oversight';

/** Wave WS — shop CO agent rep: offline drafts PG sync queue + commission payout ledger. */
export const SHOP_AGENT_REP_OFFLINE_DRAFTS_API = '/api/shop/b2b/rep/offline-drafts';
export const SHOP_AGENT_REP_COMMISSION_PAYOUT_API = '/api/shop/b2b/commissions/payout';
export const SHOP_AGENT_REP_COMMISSION_LEDGER_API = '/api/shop/b2b/rep/commission-ledger';
export const BRAND_AGENT_REP_COMMISSION_DISPUTE_API = '/api/brand/b2b/commissions/dispute';

export const SHOP_AGENT_REP_SECTION_RU_STRIP_TESTID = 'shop-agent-rep-section-ru-strip';
export const SHOP_AGENT_REP_OFFLINE_DRAFTS_SYNC_QUEUE_BADGE =
  'shop-agent-rep-offline-drafts-sync-queue-badge';
export const SHOP_AGENT_REP_BRAND_COMMISSION_DISPUTE_LINK =
  'shop-agent-rep-brand-commission-dispute-link';

export function shopAgentRepBrandCommissionDisputePeerHref(input?: {
  collectionId?: string;
  orderId?: string;
}): string {
  return brandAgentRepCommissionDisputeHref(input);
}
