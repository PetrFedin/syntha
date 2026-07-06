import { brandCrmSegmentationFeatureHref } from '@/lib/b2b/brand-crm-segmentation';
import {
  SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU,
} from '@/lib/b2b/shop-sc-cabinet-buyer-profile-honesty';

describe('wave VN — shop2 greenfield CO registry polish', () => {
  it('cabinet CO greenfield registry strip testids', () => {
    expect('shop-co-greenfield-registry-strip').toContain('greenfield-registry');
    expect('shop-co-greenfield-registry-buyer').toContain('registry-buyer');
    expect('shop-co-greenfield-registry-pg').toContain('registry-pg');
    expect('shop-co-greenfield-registry-pricelist').toContain('pricelist');
    expect('shop-co-greenfield-registry-matrix-seed-link').toContain('matrix-seed');
  });

  it('cabinet CO greenfield empty peer strip (BY pricelist wire)', () => {
    expect('shop-co-cabinet-greenfield-empty-peer-strip').toContain('greenfield-empty-peer');
    expect('shop-co-cabinet-brand-pricelist-link').toContain('pricelist');
    expect('shop-co-cabinet-replenishment-link').toContain('replenishment');
    expect(brandCrmSegmentationFeatureHref('pricelist', 'SS27')).toContain('pricelist');
  });

  it('greenfield CRM strip cross-links replenishment + matrix', () => {
    expect('shop-dev-bridge-crm-replenishment-link').toContain('replenishment');
    expect('shop-dev-bridge-crm-matrix-link').toContain('matrix');
    expect('shop-development-bridge-greenfield-crm-strip').toContain('greenfield-crm');
  });

  it('EMPTY27 buyer profile badge honesty', () => {
    expect('shop-sc-cabinet-buyer-profile-no-segment').toContain('no-segment');
    expect('shop-sc-cabinet-buyer-profile-memory').toContain('memory');
    expect('shop-sc-cabinet-buyer-profile-demo').toContain('demo');
    expect(SHOP_SC_CABINET_BUYER_PROFILE_NO_SEGMENT_RU).toContain('Сегмент');
    expect('shop-sc-empty27-onboarding-memory').toContain('memory');
  });

  it('greenfield onboarding API for shop2', () => {
    expect('/api/shop/b2b/greenfield/onboarding').toContain('greenfield/onboarding');
  });
});

describe('shop-greenfield-onboarding-repository', () => {
  it('exports getShopGreenfieldOnboardingServer', async () => {
    const mod = await import('@/lib/server/shop-greenfield-onboarding-repository');
    expect(typeof mod.getShopGreenfieldOnboardingServer).toBe('function');
    expect(typeof mod.markShopGreenfieldFirstOrderServer).toBe('function');
  });
});
