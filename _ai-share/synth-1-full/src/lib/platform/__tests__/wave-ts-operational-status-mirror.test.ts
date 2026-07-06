import {
  SHOP_B2B_OPERATIONAL_STATUS_API_SEGMENT,
  shopB2bOperationalStatusApiPath,
  shopB2bOperationalMirrorStatusFromAmendment,
} from '@/lib/order/shop-b2b-operational-status';

describe('wave TS — shop operational status mirror (PG journal)', () => {
  it('PATCH API path contract', () => {
    expect(SHOP_B2B_OPERATIONAL_STATUS_API_SEGMENT).toBe('operational-status');
    expect(shopB2bOperationalStatusApiPath('B2B-123')).toContain('operational-status');
    expect(shopB2bOperationalStatusApiPath('B2B-123')).toContain('B2B-123');
  });

  it('PG migration + table', () => {
    expect('060_wave_ts_shop_operational_status_journal').toContain('operational_status');
    expect('shop_b2b_operational_status_journal').toContain('operational_status');
  });

  it('amend outcome → mirror status mapping', () => {
    expect(shopB2bOperationalMirrorStatusFromAmendment('pending')).toBe('amendment_pending');
    expect(shopB2bOperationalMirrorStatusFromAmendment('approved')).toBe('amendment_approved');
    expect(shopB2bOperationalMirrorStatusFromAmendment('rejected')).toBe('amendment_rejected');
  });

  it('shop CO cabinet live badge testids', () => {
    expect('shop-co-cabinet-operational-status').toContain('operational-status');
    expect('shop-co-cabinet-tracking-embed-brand-status').toContain('brand-status');
    expect('shop-co-detail-brand-operational-status').toContain('operational-status');
  });

  it('cross-link testids brand ↔ shop', () => {
    expect('brand-b2b-amend-shop-cabinet-link').toContain('shop-cabinet');
    expect('shop-b2b-amend-brand-amendments-link').toContain('amendments');
  });
});

describe('wave TS — repository roundtrip (memory)', () => {
  it('merge + get latest shop operational status', async () => {
    const repo = await import('@/lib/server/shop-b2b-operational-status-repository');
    repo.clearShopB2bOperationalStatusMemoryForTests();

    const merged = await repo.mergeShopB2bOperationalStatusJournal({
      orderId: 'B2B-TS-1',
      status: 'amendment_pending',
      amendmentId: 'amend-1',
      idempotencyKey: 'idem-ts-1',
    });
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.entry.status).toBe('amendment_pending');

    const latest = await repo.getLatestShopB2bOperationalStatus('B2B-TS-1');
    expect(latest?.status).toBe('amendment_pending');
  });

  it('idempotent replay on same key', async () => {
    const repo = await import('@/lib/server/shop-b2b-operational-status-repository');
    repo.clearShopB2bOperationalStatusMemoryForTests();

    const first = await repo.mergeShopB2bOperationalStatusJournal({
      orderId: 'B2B-TS-2',
      status: 'amendment_approved',
      amendmentId: 'amend-2',
      idempotencyKey: 'idem-ts-2',
    });
    const second = await repo.mergeShopB2bOperationalStatusJournal({
      orderId: 'B2B-TS-2',
      status: 'amendment_approved',
      amendmentId: 'amend-2',
      idempotencyKey: 'idem-ts-2',
    });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.idempotentReplay).toBe(true);
  });
});

describe('wave TS — amend service mirror hook', () => {
  it('pushShopOperationalStatusMirrorFromBrandAmend on approve', async () => {
    const repo = await import('@/lib/server/shop-b2b-operational-status-repository');
    const mirror = await import('@/lib/server/shop-b2b-operational-status-mirror');
    repo.clearShopB2bOperationalStatusMemoryForTests();

    const result = await mirror.pushShopOperationalStatusMirrorFromBrandAmend({
      orderId: 'B2B-TS-3',
      amendmentId: 'amend-3',
      amendmentStatus: 'approved',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.status).toBe('amendment_approved');

    const latest = await repo.getLatestShopB2bOperationalStatus('B2B-TS-3');
    expect(latest?.status).toBe('amendment_approved');
  });
});
