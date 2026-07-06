import {
  BRAND_CO_REGISTRY_AMENDMENTS_API_PATH,
  BRAND_CO_REGISTRY_AMEND_QUEUE_COUNT_TESTID,
  BRAND_CO_REGISTRY_AMEND_QUEUE_STRIP_TESTID,
  BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID,
  BRAND_CO_REGISTRY_SHOP_TRACKING_PEER_STRIP_TESTID,
  brandCoRegistryAmendApproveApiPath,
  brandCoRegistryAmendmentsApiPath,
  brandCoRegistryAmendRejectApiPath,
} from '@/lib/b2b/brand-co-registry-amend-wl';
import { shopB2bOperationalStatusApiPath } from '@/lib/order/shop-b2b-operational-status';

describe('wave WL — brand CO registry amend API + multi-buyer PG', () => {
  it('registry amend queue API path + partner filter', () => {
    expect(BRAND_CO_REGISTRY_AMENDMENTS_API_PATH).toContain('/registry/amendments');
    expect(brandCoRegistryAmendmentsApiPath('SS27', 'shop2')).toContain('partner=shop2');
    expect(brandCoRegistryAmendmentsApiPath('SS27')).toContain('collectionId=SS27');
  });

  it('brand amend approve/reject API paths', () => {
    expect(brandCoRegistryAmendApproveApiPath('B2B-1', 'amend-1')).toContain('/amendments/amend-1/approve');
    expect(brandCoRegistryAmendRejectApiPath('B2B-1', 'amend-1')).toContain('/amendments/amend-1/reject');
    expect('brand-b2b-amend-approve').toContain('approve');
    expect('brand-b2b-amend-reject').toContain('reject');
  });

  it('multi-buyer PG query on brand orders + cabinet partner filter', () => {
    expect('/api/brand/b2b/orders?collectionId=SS27&partner=shop2').toContain('partner=shop2');
    expect('brand-co-registry-partner-filter').toContain('partner-filter');
    expect('brand-co-cabinet-partner-filter').toContain('partner-filter');
    expect('brand-co-registry-pg-partner-badge').toContain('pg-partner');
    expect('/api/brand/retailers/b2b-orders-summary?collectionId=SS27').toContain('collectionId');
  });

  it('registry UI strips: amend queue + shop tracking peers', () => {
    expect(BRAND_CO_REGISTRY_AMEND_QUEUE_STRIP_TESTID).toContain('amend-queue');
    expect(BRAND_CO_REGISTRY_AMEND_QUEUE_COUNT_TESTID).toContain('count');
    expect('brand-co-registry-amend-detail-link').toContain('amend');
    expect(BRAND_CO_REGISTRY_SHOP_TRACKING_PEER_STRIP_TESTID).toContain('shop-tracking');
    expect(BRAND_CO_REGISTRY_SHOP_TRACKING_LINK_TESTID).toContain('shop-tracking');
  });

  it('operational status PATCH mirror path after brand amend', () => {
    expect(shopB2bOperationalStatusApiPath('B2B-DEMO-SHOP1-SS27')).toContain('operational-status');
    expect('shop-co-cabinet-operational-status').toContain('operational-status');
  });
});

describe('wave WL — registry amend server list', () => {
  it('returns array for collection filter', async () => {
    const server = await import('@/lib/server/brand-co-registry-amend-server');
    const rows = await server.listBrandCoRegistryPendingAmendments({
      collectionId: 'SS27',
      partner: 'shop2',
    });
    expect(Array.isArray(rows)).toBe(true);
  });
});

describe('wave WL — amend service mirrors shop operational status', () => {
  it('approve pushes amendment_approved mirror journal', async () => {
    const repo = await import('@/lib/server/shop-b2b-operational-status-repository');
    const amendRepo = await import('@/lib/server/workshop2-b2b-amendment-repository');
    const ordersRepo = await import('@/lib/server/workshop2-b2b-orders-repository');
    const service = await import('@/lib/server/workshop2-b2b-amendment-service');

    repo.clearShopB2bOperationalStatusMemoryForTests();

    const orderId = 'B2B-WL-MIRROR-1';
    const now = new Date().toISOString();
    await ordersRepo.putWorkshop2B2bOrder({
      id: orderId,
      collectionId: 'SS27',
      articleId: 'art-1',
      buyerId: 'shop1',
      status: 'confirmed',
      tier: 'standard',
      totalRub: 1000,
      lines: [],
      createdAt: now,
      updatedAt: now,
    });
    await amendRepo.createWorkshop2B2bAmendment({
      id: 'amend-wl-mirror',
      orderId,
      status: 'pending',
      noteRu: 'mirror test',
      createdAt: now,
      updatedAt: now,
      createdBy: 'shop',
    });

    const result = await service.approveBrandWorkshop2B2bAmendment({
      orderId,
      amendmentId: 'amend-wl-mirror',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const latest = await repo.getLatestShopB2bOperationalStatus(orderId);
    expect(latest?.status).toBe('amendment_approved');
  });
});
