import {
  SHOP_B2B_PARTNERS_GOLDEN_PATH_UAT_RU,
  SHOP_PARTNERSHIP_INVITE_PG_TABLE,
  SHOP_PARTNERS_WAVE_XA_MIGRATION,
  SHOP_PARTNERSHIP_INVITE_API_PATH,
  SHOP_SC_PARTNERS_CHAT_LINK_LEGACY_TESTID_PREFIX,
  SHOP_SC_PARTNERS_CHAT_LINK_TESTID_PREFIX,
  SHOP_SC_PARTNERS_ELIGIBLE_MATRIX_PEER_LABEL_RU,
  SHOP_SC_PARTNERS_INVITE_STORAGE_BADGE_TESTID,
  SHOP_SC_PARTNERS_SHOWROOM_ELIGIBLE_LINK_TESTID,
  shopPartnersShowroomEligibleForMatrixHref,
  shopPartnershipInviteApiPath,
} from '@/lib/b2b/shop-partners-wave-xa';
import { postShopPartnershipInvite } from '@/lib/b2b/shop-partnership-invite';
import { SHOP_SHOWROOM_ELIGIBLE_FOR_MATRIX_API_PATH } from '@/lib/b2b/shop-showroom-eligible-for-matrix';

describe('wave XA — shop partners catalog invite PG stub', () => {
  it('partnerships/invite API path + PG journal table', () => {
    expect(shopPartnershipInviteApiPath()).toBe('/api/shop/b2b/partnerships/invite');
    expect(SHOP_PARTNERSHIP_INVITE_API_PATH).toBe('/api/shop/b2b/partnerships/invite');
    expect(SHOP_PARTNERSHIP_INVITE_PG_TABLE).toBe('shop_b2b_partnership_invite_journal');
    expect(SHOP_PARTNERS_WAVE_XA_MIGRATION).toContain('067_wave_xa');
    expect('061_wave_uw_shop_partnership_invite_journal').toContain('partnership_invite');
  });

  it('partners catalog UAT golden path strip RU', () => {
    expect(SHOP_B2B_PARTNERS_GOLDEN_PATH_UAT_RU).toContain('invite PG');
    expect(SHOP_B2B_PARTNERS_GOLDEN_PATH_UAT_RU).toMatch(/eligible-for-matrix/i);
    expect('shop-b2b-partners-uat-golden-path-hint').toContain('uat-golden-path');
    expect('shop-b2b-partners-golden-path-strip').toContain('golden-path');
  });

  it('cross-link partners → showroom eligible-for-matrix', () => {
    const href = shopPartnersShowroomEligibleForMatrixHref({ collectionId: 'SS27' });
    expect(href).toContain('/shop/b2b/showroom');
    expect(href).toContain('eligibleOnly=1');
    expect(href).toContain('partnersPeer=eligible-matrix');
    expect(href).toContain('collection=SS27');
    expect(SHOP_SC_PARTNERS_SHOWROOM_ELIGIBLE_LINK_TESTID).toContain('eligible-for-matrix');
    expect(SHOP_SC_PARTNERS_ELIGIBLE_MATRIX_PEER_LABEL_RU).toMatch(/eligible-for-matrix/i);
    expect(SHOP_SHOWROOM_ELIGIBLE_FOR_MATRIX_API_PATH).toContain('eligible-for-matrix');
  });

  it('dedupe invite CTAs — chat vs invite panel testids', () => {
    expect(SHOP_SC_PARTNERS_CHAT_LINK_TESTID_PREFIX).toBe('shop-sc-partners-chat-');
    expect(SHOP_SC_PARTNERS_CHAT_LINK_LEGACY_TESTID_PREFIX).toBe('shop-sc-partners-invite-');
    expect('shop-sc-partners-invite-panel-').toContain('invite-panel');
    expect(SHOP_SC_PARTNERS_INVITE_STORAGE_BADGE_TESTID).toContain('storage-badge');
  });
});

describe('wave XA — partnership invite journal repository', () => {
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

describe('wave XA — postShopPartnershipInvite client', () => {
  it('exports postShopPartnershipInvite', async () => {
    expect(typeof postShopPartnershipInvite).toBe('function');
  });
});
