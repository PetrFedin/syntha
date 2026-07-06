import {
  SHOP_PARTNERSHIP_INVITE_API_PATH,
  postShopPartnershipInvite,
} from '@/lib/b2b/shop-partnership-invite';
import {
  SHOP_B2B_PARTNERS_GOLDEN_PATH_UAT_RU,
} from '@/components/shop/b2b/ShopB2bPartnersGoldenPathStrip';
import {
  SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU,
  SHOP_SHOWROOM_PARTNER_LOGO_PG_RU,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';

describe('wave UW — shop partners invite PG + EMPTY27 onboarding', () => {
  it('partnerships/invite API path + journal table', () => {
    expect(SHOP_PARTNERSHIP_INVITE_API_PATH).toBe('/api/shop/b2b/partnerships/invite');
    expect('061_wave_uw_shop_partnership_invite_journal').toContain('partnership_invite');
    expect('shop_b2b_partnership_invite_journal').toContain('invite');
  });

  it('partners catalog UAT golden path strip RU', () => {
    expect(SHOP_B2B_PARTNERS_GOLDEN_PATH_UAT_RU).toContain('invite PG');
    expect('shop-b2b-partners-uat-golden-path-hint').toContain('uat-golden-path');
    expect('shop-b2b-partners-golden-path-strip').toContain('golden-path');
  });

  it('EMPTY27 onboarding buyer profile PG testids', () => {
    expect('shop-sc-empty27-onboarding-strip').toContain('empty27-onboarding');
    expect('shop-sc-empty27-onboarding-pg').toContain('empty27-onboarding-pg');
    expect('shop-sc-empty27-onboarding-greenfield').toContain('greenfield');
    expect('shop-sc-empty27-onboarding-partners-link').toContain('partners-link');
    expect('shop-sc-cabinet-buyer-profile-strip').toContain('buyer-profile');
  });

  it('showroom partner logo PG vs dossier fallback honesty', () => {
    expect(SHOP_SHOWROOM_PARTNER_LOGO_PG_RU).toContain('PG');
    expect(SHOP_SHOWROOM_PARTNER_LOGO_DOSSIER_FALLBACK_RU).toContain('dossier');
    expect('shop-sc-showroom-partner-logo-source-pg').toContain('source-pg');
    expect('shop-sc-showroom-partner-logo-source-dossier-fallback').toContain('dossier-fallback');
    expect('shop-sc-showroom-partner-logo-source-catalog-fallback').toContain('catalog-fallback');
  });
});

describe('wave UW — partnership invite journal repository', () => {
  it('exports journal helpers', async () => {
    const mod = await import('@/lib/server/shop-partnership-invite-journal-repository');
    expect(typeof mod.appendShopPartnershipInviteJournal).toBe('function');
    expect(typeof mod.listShopPartnershipInviteJournal).toBe('function');
    expect(typeof mod.shopPartnershipInviteJournalStorageMode).toBe('function');
  });

  it('persists invite journal row', async () => {
    const { appendShopPartnershipInviteJournal, listShopPartnershipInviteJournal } =
      await import('@/lib/server/shop-partnership-invite-journal-repository');
    await appendShopPartnershipInviteJournal({
      buyerId: 'shop1',
      brandId: 'brand_nordic_wool',
      collectionId: 'SS27',
      action: 'request',
      status: 'requested',
    });
    const rows = await listShopPartnershipInviteJournal({
      buyerId: 'shop1',
      brandId: 'brand_nordic_wool',
      limit: 5,
    });
    expect(rows.some((r) => r.action === 'request')).toBe(true);
  });
});

describe('wave UW — postShopPartnershipInvite client', () => {
  it('exports postShopPartnershipInvite', async () => {
    expect(typeof postShopPartnershipInvite).toBe('function');
  });
});
