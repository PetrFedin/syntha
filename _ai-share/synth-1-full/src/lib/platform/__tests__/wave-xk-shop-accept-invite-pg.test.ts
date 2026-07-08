import {
  SHOP_B2B_ACCEPT_INVITE_API_PATH,
  SHOP_B2B_ACCEPT_INVITE_GOLDEN_PATH_UAT_RU,
  SHOP_B2B_ACCEPT_INVITE_PARTNERS_LINK_TESTID,
  SHOP_B2B_ACCEPT_INVITE_SHOWROOM_LINK_TESTID,
  SHOP_B2B_ACCEPT_INVITE_STORAGE_PG_TESTID,
  SHOP_B2B_PARTNER_SESSION_COOKIE,
  SHOP_B2B_PARTNER_TIER_COOKIE,
  SHOP_PARTNERS_WAVE_XK_MIGRATION,
  shopPartnersAcceptInviteDiscoverHref,
  shopPartnersAcceptInviteShowroomEligibleHref,
} from '@/lib/b2b/shop-partners-wave-xk';
import {
  normalizeShopCoreBuyerIdFromPartnerEmail,
  resolveShopCoreBuyerIdFromPartnerEmail,
  resolveShopCoreBuyerIdFromPartnerSessionIdSync,
} from '@/lib/b2b/resolve-shop-partner-session-buyer';
import { shopPartnersShowroomEligibleForMatrixHref } from '@/lib/b2b/shop-partners-wave-xa';
import { persistShopB2bPartnerSessionServer } from '@/lib/server/shop-b2b-partner-session-repository';
import { createWorkshop2B2bBuyerInviteToken } from '@/lib/production/workshop2-b2b-wave23-parity';

describe('wave XK — shop accept-invite PG partner session', () => {
  it('exports wave XK migration + cookie contract', () => {
    expect(SHOP_PARTNERS_WAVE_XK_MIGRATION).toBe('068_wave_xk_shop_accept_invite_pg');
    expect(SHOP_B2B_ACCEPT_INVITE_API_PATH).toBe('/api/shop/b2b/accept-invite');
    expect(SHOP_B2B_PARTNER_SESSION_COOKIE).toBe('b2b_cart_session');
    expect(SHOP_B2B_PARTNER_TIER_COOKIE).toBe('b2b_partner_tier');
    expect(SHOP_B2B_ACCEPT_INVITE_STORAGE_PG_TESTID).toBe('b2b-accept-invite-storage-pg');
  });

  it('golden path UAT RU + cross-links to wave XA partners catalog', () => {
    expect(SHOP_B2B_ACCEPT_INVITE_GOLDEN_PATH_UAT_RU).toMatch(/invite.*PG/i);
    expect(SHOP_B2B_ACCEPT_INVITE_GOLDEN_PATH_UAT_RU).toMatch(/partners catalog/i);
    expect(SHOP_B2B_ACCEPT_INVITE_GOLDEN_PATH_UAT_RU).toMatch(/eligible-for-matrix/i);
    const discoverHref = shopPartnersAcceptInviteDiscoverHref({
      collectionId: 'SS27',
      buyerId: 'shop1',
    });
    expect(discoverHref).toContain('/shop/b2b/partners/discover');
    expect(discoverHref).toContain('partnersPeer=accept-invite');
    expect(discoverHref).toContain('collection=SS27');
    expect(SHOP_B2B_ACCEPT_INVITE_PARTNERS_LINK_TESTID).toContain('partners-golden-path');
    const showroomHref = shopPartnersAcceptInviteShowroomEligibleHref({ collectionId: 'SS27' });
    expect(showroomHref).toBe(shopPartnersShowroomEligibleForMatrixHref({ collectionId: 'SS27' }));
    expect(SHOP_B2B_ACCEPT_INVITE_SHOWROOM_LINK_TESTID).toContain('showroom-eligible');
  });

  it('maps partner invite email → shop core buyer preset', () => {
    expect(resolveShopCoreBuyerIdFromPartnerEmail('buyer@shop-demo.local')).toBe('shop1');
    expect(resolveShopCoreBuyerIdFromPartnerEmail('buyer-demo-spb@shop-demo.local')).toBe('shop2');
    expect(normalizeShopCoreBuyerIdFromPartnerEmail('unknown@example.com')).toBe('shop1');
  });

  it('persists partner session and resolves buyer from memory cookie', async () => {
    const { token } = createWorkshop2B2bBuyerInviteToken({
      buyerEmail: 'buyer@shop-demo.local',
      tier: 'vip',
    });
    const sessionId = `b2b-partner-buyer-shop-demo-local-xk-${Date.now()}`;
    await persistShopB2bPartnerSessionServer({
      sessionId,
      buyerEmail: 'buyer@shop-demo.local',
      tier: 'vip',
      inviteToken: token,
    });

    expect(resolveShopCoreBuyerIdFromPartnerSessionIdSync(sessionId)).toBe('shop1');
    expect(
      typeof (await import('@/lib/server/shop-core-buyer-partner-session'))
        .resolveShopCoreBuyerIdFromRequestAsync
    ).toBe('function');
  });
});
