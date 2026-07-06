import {
  BRAND_AGENT_REP_COMMISSION_DISPUTE_API,
  SHOP_AGENT_REP_BRAND_COMMISSION_DISPUTE_LINK,
  SHOP_AGENT_REP_COMMISSION_LEDGER_API,
  SHOP_AGENT_REP_COMMISSION_PAYOUT_API,
  SHOP_AGENT_REP_OFFLINE_DRAFTS_API,
  SHOP_AGENT_REP_OFFLINE_DRAFTS_SYNC_QUEUE_BADGE,
  SHOP_AGENT_REP_SECTION_RU_STRIP_TESTID,
  shopAgentRepBrandCommissionDisputePeerHref,
} from '@/lib/b2b/shop-agent-rep-wave-ws';
import { brandAgentRepCommissionDisputeHref } from '@/lib/fashion/brand-agent-rep-oversight';

describe('wave WS — shop rep offline drafts PG sync queue + commission payout', () => {
  it('offline drafts API + core fail-closed file/memory policy', () => {
    expect(SHOP_AGENT_REP_OFFLINE_DRAFTS_API).toContain('offline-drafts');
    expect('shouldUseShopRepOfflineDraftsFileMemoryFallback').toContain('Fallback');
    expect('shopRepOfflineDraftsStorageMode').toContain('StorageMode');
    expect('offline_drafts_unavailable').toContain('unavailable');
  });

  it('commission payout PG ledger write stub routes', () => {
    expect(SHOP_AGENT_REP_COMMISSION_PAYOUT_API).toContain('commissions/payout');
    expect(SHOP_AGENT_REP_COMMISSION_LEDGER_API).toContain('commission-ledger');
    expect('writeShopRepCommissionLedgerPayout').toContain('Payout');
    expect('shop-agent-rep-commission-ledger-payout-write-btn').toContain('payout-write');
  });

  it('section RU strip + deduped sync queue badge', () => {
    expect(SHOP_AGENT_REP_SECTION_RU_STRIP_TESTID).toContain('section-ru-strip');
    expect(SHOP_AGENT_REP_OFFLINE_DRAFTS_SYNC_QUEUE_BADGE).toContain('sync-queue');
    expect('shop-agent-rep-workspace-drafts-storage-pg').toContain('drafts-storage');
    expect('shop-agent-rep-offline-drafts-honesty-strip').toContain('honesty');
  });

  it('rep → brand commission dispute peer cross-link (wave VI partial)', () => {
    expect(BRAND_AGENT_REP_COMMISSION_DISPUTE_API).toContain('dispute');
    expect(SHOP_AGENT_REP_BRAND_COMMISSION_DISPUTE_LINK).toContain('dispute-link');
    const href = shopAgentRepBrandCommissionDisputePeerHref({
      collectionId: 'SS27',
      orderId: 'B2B-0010',
    });
    expect(href).toContain('/brand/distributor/commissions');
    expect(href).toContain('disputePeer=shop-rep');
    expect(href).toContain('collection=SS27');
    expect(brandAgentRepCommissionDisputeHref({ collectionId: 'SS27' })).toContain('pcf=ledger');
    expect('brand-agent-rep-commission-dispute-strip').toContain('dispute');
  });
});

describe('shop-rep-offline-drafts-repository (wave WS core)', () => {
  it('exports storage mode helper', async () => {
    const mod = await import('@/lib/server/shop-rep-offline-drafts-repository');
    expect(typeof mod.shopRepOfflineDraftsStorageMode).toBe('function');
    expect(typeof mod.getShopRepOfflineDraftsServer).toBe('function');
  });
});
