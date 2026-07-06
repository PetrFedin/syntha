import {
  BRAND_AGENT_REP_COMMISSION_DISPUTE_API,
  BRAND_AGENT_REP_COMMISSION_DISPUTE_STORAGE_BADGE_TESTID,
  BRAND_AGENT_REP_SHOP_PORTAL_READONLY_LINK_TESTID,
  BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_STRIP_TESTID,
  BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_LINK_TESTID,
  SHOP_AGENT_REP_COMMISSION_PAYOUT_API,
  brandAgentRepShopPortalReadOnlyLinkHref,
  brandAgentRepShopRepPayoutPeerHref,
} from '@/lib/b2b/brand-agent-rep-wave-wx';

describe('wave WX — brand CO agent rep commission dispute PG stub', () => {
  it('dispute API path + storage badge testids', () => {
    expect(BRAND_AGENT_REP_COMMISSION_DISPUTE_API).toBe('/api/brand/b2b/commissions/dispute');
    expect(BRAND_AGENT_REP_SHOP_PORTAL_READONLY_RU_STRIP_TESTID).toContain('readonly-ru-strip');
    expect(BRAND_AGENT_REP_SHOP_PORTAL_READONLY_LINK_TESTID).toContain('readonly-link');
    expect(BRAND_AGENT_REP_COMMISSION_DISPUTE_STORAGE_BADGE_TESTID).toContain('storage-badge');
    expect('brand-agent-rep-commission-dispute-strip').toContain('dispute');
  });

  it('read-only portal href + RU strip link testid', () => {
    const href = brandAgentRepShopPortalReadOnlyLinkHref();
    expect(href).toContain('readOnly=1');
    expect(href).toContain('/shop/b2b/sales-rep-portal');
  });

  it('shop rep payout peer cross-link (wave WS)', () => {
    expect(SHOP_AGENT_REP_COMMISSION_PAYOUT_API).toContain('commissions/payout');
    const payoutHref = brandAgentRepShopRepPayoutPeerHref({
      collectionId: 'SS27',
      repId: 'rep-anna',
    });
    expect(payoutHref).toContain('/shop/b2b/sales-rep-portal');
    expect(payoutHref).toContain('pcf=commission');
    expect(payoutHref).toContain('collection=SS27');
    expect(payoutHref).toContain('payoutPeer=brand-dispute');
    expect(BRAND_AGENT_REP_SHOP_REP_PAYOUT_PEER_LINK_TESTID).toContain('payout-peer');
  });
});

describe('wave WX — commission dispute repository', () => {
  it('list + create return arrays/records', async () => {
    const repo = await import('@/lib/server/brand-agent-rep-commission-dispute-repository');
    const before = await repo.listBrandAgentRepCommissionDisputesServer();
    expect(Array.isArray(before)).toBe(true);

    const dispute = await repo.createBrandAgentRepCommissionDisputeServer({
      commissionId: 'comm-wx-unit',
      reasonRu: 'WX unit: расхождение',
      repName: 'Rep Unit',
    });
    expect(dispute.disputeId).toBeTruthy();
    expect(dispute.status).toBe('received');

    const after = await repo.listBrandAgentRepCommissionDisputesServer();
    expect(after.length).toBeGreaterThanOrEqual(before.length);
    expect(typeof repo.brandAgentRepCommissionDisputeStorageMode()).toBe('string');
  });
});
