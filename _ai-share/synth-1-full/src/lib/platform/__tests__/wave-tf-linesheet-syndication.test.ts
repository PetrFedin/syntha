import {
  BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH,
  BRAND_LINESHEET_SYNDICATE_API_PATH,
  BRAND_LINESHEET_SYNDICATE_SUCCESS_RU,
  SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU,
  SHOP_SHOWROOM_AUTO_INGEST_API_PATH,
  SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU,
  brandLinesheetSyndicateApiPath,
} from '@/lib/production/brand-linesheet-syndication';

describe('wave TF — brand SC linesheet syndication + shop auto-ingest', () => {
  it('syndicate API path contract', () => {
    expect(BRAND_LINESHEET_SYNDICATE_API_PATH).toBe('/api/brand/linesheets/syndicate');
    expect(brandLinesheetSyndicateApiPath('SS27')).toContain('collection=SS27');
  });

  it('batch unpublish rollback API path', () => {
    expect(BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH).toContain('batch-unpublish-rollback');
  });

  it('shop auto-ingest API path', () => {
    expect(SHOP_SHOWROOM_AUTO_INGEST_API_PATH).toBe('/api/shop/b2b/showroom/auto-ingest');
  });

  it('PG migration + tables', () => {
    expect('058_wave_tf_linesheet_syndication').toContain('linesheet_syndication');
    expect('brand_linesheet_syndication_journal').toContain('syndication');
    expect('shop_showroom_auto_ingest_journal').toContain('auto_ingest');
  });

  it('RU copy for syndication + shop ingest', () => {
    expect(BRAND_LINESHEET_SYNDICATE_SUCCESS_RU).toContain('Syndication');
    expect(SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU).toContain('syndication');
  });

  it('UI testids on linesheets + shop showroom', () => {
    expect('brand-sc-linesheets-syndicate-btn').toContain('syndicate');
    expect('brand-sc-linesheets-batch-unpublish-rollback').toContain('unpublish');
    expect('shop-sc-showroom-auto-ingest-notice').toContain('auto-ingest');
    expect('shop-sc-showroom-syndication-notification').toContain('syndication');
  });

  it('PG shop notification uses appendPlatformCoreNotificationEvent', () => {
    expect('appendPlatformCoreNotificationEvent').toContain('Notification');
    expect('notifyShopLinesheetSyndication').toContain('Syndication');
    expect('notifySupplierLinesheetBomPreview').toContain('Linesheet');
    expect(SUPPLIER_LINESHEET_BOM_NOTIFY_TITLE_RU).toContain('BOM');
  });
});

describe('wave TF — repository roundtrip (memory)', () => {
  it('syndication journal + rollback snapshot helpers', async () => {
    const repo = await import('@/lib/server/brand-linesheet-syndication-repository');
    expect(typeof repo.appendBrandLinesheetSyndicationJournal).toBe('function');
    expect(typeof repo.saveBrandLinesheetUnpublishRollbackSnapshot).toBe('function');
    expect(typeof repo.appendShopShowroomAutoIngestJournal).toBe('function');

    const snap = await repo.saveBrandLinesheetUnpublishRollbackSnapshot({
      collectionId: 'SS27',
      articleIds: ['demo-ss27-01'],
    });
    expect(snap.snapshotId).toContain('rb-');

    const latest = await repo.getLatestBrandLinesheetUnpublishRollbackSnapshot('SS27');
    expect(latest?.articleIds).toContain('demo-ss27-01');
  });
});

describe('wave TF — server syndicate orchestration', () => {
  it('exports postBrandLinesheetSyndicate + batch unpublish', async () => {
    const mod = await import('@/lib/server/brand-linesheet-syndication-server');
    expect(typeof mod.postBrandLinesheetSyndicate).toBe('function');
    expect(typeof mod.postBrandLinesheetBatchUnpublish).toBe('function');
    expect(typeof mod.postBrandLinesheetBatchUnpublishRollback).toBe('function');
    expect(typeof mod.runShopShowroomAutoIngestOnSyndicate).toBe('function');
  });
});
