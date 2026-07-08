/** @jest-environment node */
import {
  SHOP_EMPTY27_BUYER_PROFILE_API,
  SHOP_EMPTY27_BUYER_PROFILE_PG_TESTID,
  SHOP_EMPTY27_BUYER_PROFILE_SEED_CTA_RU,
  SHOP_EMPTY27_BUYER_PROFILE_STRIP_TESTID,
  SHOP_EMPTY27_ONBOARDING_COLLECTION_ID,
  SHOP_EMPTY27_ONBOARDING_MEMORY_TESTID,
  SHOP_EMPTY27_ONBOARDING_PG_TESTID,
  SHOP_EMPTY27_ONBOARDING_SEED_PROFILE_TESTID,
  SHOP_EMPTY27_ONBOARDING_STRIP_TESTID,
  SHOP_EMPTY27_WAVE_YM_MIGRATION,
  SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU,
  shopEmpty27BuyerProfileApiPath,
  shopEmpty27BuyerProfileOmitsPeerLinks,
  shopEmpty27BuyerProfileReadMessageRu,
  shopEmpty27BuyerProfileSeedNoteRu,
  shopEmpty27BuyerProfileWriteMessageRu,
  shopEmpty27GreenfieldHintRu,
  shopEmpty27GreenfieldOnboardingApiPath,
  shopEmpty27MatrixSeedHref,
  shopEmpty27OnboardingStorageBadgeTestId,
} from '@/lib/b2b/shop-sc-empty27-buyer-profile-wave-ym';
import { buildShopBuyerCrmProfile } from '@/lib/b2b/shop-buyer-crm-profile';
import { clearShopBuyerCrmProfilesMemoryForTests } from '@/lib/server/shop-buyer-crm-profile-repository';

describe('wave YM — EMPTY27 shop SC buyer profile PG read/write', () => {
  it('exports wave YM constants + extends UW/VN/XX testids', () => {
    expect(SHOP_EMPTY27_BUYER_PROFILE_API).toBe('/api/shop/b2b/buyer-crm-profile');
    expect(SHOP_EMPTY27_WAVE_YM_MIGRATION).toContain('partnership_invite');
    expect(SHOP_EMPTY27_ONBOARDING_STRIP_TESTID).toContain('empty27-onboarding');
    expect(SHOP_EMPTY27_ONBOARDING_PG_TESTID).toContain('empty27-onboarding-pg');
    expect(SHOP_EMPTY27_ONBOARDING_MEMORY_TESTID).toContain('memory');
    expect(SHOP_EMPTY27_ONBOARDING_SEED_PROFILE_TESTID).toContain('seed-profile');
    expect(SHOP_EMPTY27_BUYER_PROFILE_STRIP_TESTID).toContain('buyer-profile');
    expect(SHOP_EMPTY27_BUYER_PROFILE_PG_TESTID).toContain('buyer-profile-pg');
    expect(SHOP_EMPTY27_BUYER_PROFILE_SEED_CTA_RU).toMatch(/PG/i);
  });

  it('onboarding API paths for EMPTY27 + buyer profile read', () => {
    expect(
      shopEmpty27GreenfieldOnboardingApiPath('shop1', SHOP_EMPTY27_ONBOARDING_COLLECTION_ID)
    ).toContain('collectionId=EMPTY27');
    expect(shopEmpty27BuyerProfileApiPath('shop1')).toContain('buyerId=shop1');
    expect(shopEmpty27MatrixSeedHref({ buyerId: 'shop1', state: null })).toContain(
      '/shop/b2b/matrix'
    );
    expect(shopEmpty27MatrixSeedHref({ buyerId: 'shop1', state: null })).toContain('SS27');
  });

  it('RU strip helpers + storage badge testids', () => {
    expect(shopEmpty27OnboardingStorageBadgeTestId('postgres')).toBe(
      SHOP_EMPTY27_ONBOARDING_PG_TESTID
    );
    expect(shopEmpty27OnboardingStorageBadgeTestId('memory')).toBe(
      SHOP_EMPTY27_ONBOARDING_MEMORY_TESTID
    );
    expect(shopEmpty27GreenfieldHintRu(null)).toMatch(/CRM|партн/i);
    expect(shopEmpty27GreenfieldHintRu({ crmReady: true, pricelistReady: true })).toMatch(/готов/i);
    expect(shopEmpty27BuyerProfileSeedNoteRu('shop2')).toMatch(/EMPTY27|SS27/i);
  });

  it('embedded buyer profile dedupes greenfield peer CTAs', () => {
    expect(shopEmpty27BuyerProfileOmitsPeerLinks('embedded')).toBe(true);
    expect(shopEmpty27BuyerProfileOmitsPeerLinks('standalone')).toBe(false);
    const strip = require('node:fs').readFileSync(
      require('node:path').join(
        __dirname,
        '../../../components/shop/b2b/ShopScCabinetBuyerProfileStrip.tsx'
      ),
      'utf8'
    );
    expect(strip).toContain('omitPeerLinks');
    expect(strip).toContain('shopEmpty27BuyerProfileOmitsPeerLinks');
    const onboarding = require('node:fs').readFileSync(
      require('node:path').join(
        __dirname,
        '../../../components/shop/b2b/ShopScEmpty27OnboardingStrip.tsx'
      ),
      'utf8'
    );
    expect(onboarding).toContain('surface="embedded"');
    expect(onboarding).not.toContain('shop-sc-cabinet-buyer-profile-partners-link');
  });

  it('read/write message RU honesty', () => {
    expect(shopEmpty27BuyerProfileReadMessageRu(null)).toContain(
      SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU
    );
    const profile = buildShopBuyerCrmProfile({
      buyerId: 'shop2',
      segment: {
        id: 'seg-retail',
        segmentKey: 'retail',
        nameRu: 'Розница',
        query: {},
        defaultPriceTier: 'retail',
        defaultNetTermDays: 30,
        vatExempt: false,
        updatedAt: new Date().toISOString(),
      },
    });
    expect(shopEmpty27BuyerProfileReadMessageRu(profile)).toMatch(/Розница|net/i);
    expect(shopEmpty27BuyerProfileWriteMessageRu(profile, 'pg')).toMatch(/PG|Розница/i);
  });
});

describe('wave YM — buyer-crm-profile API route', () => {
  beforeEach(() => {
    clearShopBuyerCrmProfilesMemoryForTests();
  });

  it('GET returns profile read envelope', async () => {
    const { GET } = await import('@/app/api/shop/b2b/buyer-crm-profile/route');
    const { NextRequest } = await import('next/server');
    const req = new NextRequest(`http://localhost${shopEmpty27BuyerProfileApiPath('shop2')}`);
    const res = await GET(req);
    const json = (await res.json()) as {
      ok?: boolean;
      profile?: { segmentNameRu?: string } | null;
      storageMode?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(typeof json.messageRu).toBe('string');
    expect(['pg', 'file', 'memory', 'demo']).toContain(json.storageMode ?? 'demo');
  });

  it('POST seeds buyer CRM profile for EMPTY27 onboarding', async () => {
    const { POST } = await import('@/app/api/shop/b2b/buyer-crm-profile/route');
    const { NextRequest } = await import('next/server');
    const req = new NextRequest(`http://localhost${SHOP_EMPTY27_BUYER_PROFILE_API}`, {
      method: 'POST',
      body: JSON.stringify({
        buyerId: 'shop2',
        collectionId: SHOP_EMPTY27_ONBOARDING_COLLECTION_ID,
        action: 'seed',
        segmentKey: 'retail',
        onboardingNoteRu: shopEmpty27BuyerProfileSeedNoteRu('shop2'),
      }),
    });
    const res = await POST(req);
    expect(res.status).toBeLessThan(500);
    const json = (await res.json()) as {
      ok?: boolean;
      profile?: { segmentKey?: string };
      storageMode?: string;
      messageRu?: string;
    };
    expect(json.ok).toBe(true);
    expect(json.profile?.segmentKey).toBe('retail');
    expect(typeof json.messageRu).toBe('string');
  });
});

describe('wave YM — shop-buyer-crm-profile-store', () => {
  it('exports postShopBuyerCrmProfileOnboardingSeed', async () => {
    const mod = await import('@/lib/b2b/shop-buyer-crm-profile-store');
    expect(typeof mod.fetchShopBuyerCrmProfile).toBe('function');
    expect(typeof mod.postShopBuyerCrmProfileOnboardingSeed).toBe('function');
  });
});
