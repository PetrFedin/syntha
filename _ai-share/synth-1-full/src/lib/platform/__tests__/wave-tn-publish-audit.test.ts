import {
  BRAND_SC_PUBLISH_AUDIT_EMPTY_RU,
  BRAND_SC_PUBLISH_AUDIT_LOG_API_PATH,
  BRAND_SC_PUBLISH_AUDIT_PG_READY_RU,
  brandScPublishAuditLogApiPath,
} from '@/lib/production/brand-sc-publish-audit';

describe('wave TN — brand SC publish audit PG journal', () => {
  it('publish audit API path contract', () => {
    expect(BRAND_SC_PUBLISH_AUDIT_LOG_API_PATH).toContain('collections');
    expect(brandScPublishAuditLogApiPath('SS27')).toContain('publish-audit-log');
    expect(brandScPublishAuditLogApiPath('SS27')).toContain('SS27');
  });

  it('PG migration + table', () => {
    expect('059_wave_tn_publish_audit_journal').toContain('publish_audit');
    expect('brand_sc_publish_audit_journal').toContain('publish_audit');
  });

  it('RU copy for PG-backed audit', () => {
    expect(BRAND_SC_PUBLISH_AUDIT_EMPTY_RU).toContain('batch publish');
    expect(BRAND_SC_PUBLISH_AUDIT_PG_READY_RU).toContain('PostgreSQL');
  });

  it('UI testids on cabinet + release publish', () => {
    expect('brand-release-publish-audit-panel').toContain('publish-audit');
    expect('brand-sc-publish-audit-log').toContain('publish-audit');
    expect('brand-sc-cabinet-panel').toContain('cabinet');
  });
});

describe('wave TN — repository roundtrip (memory)', () => {
  it('append + list publish audit journal', async () => {
    const repo = await import('@/lib/server/brand-sc-publish-audit-repository');
    repo.clearBrandScPublishAuditJournalMemoryForTests();

    const row = await repo.appendBrandScPublishAuditJournal({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      source: 'bulk_showroom_publish',
      campaignName: 'SS27 drop',
      payload: { source: 'bulk_showroom_publish' },
    });
    expect(row.id).toContain('pub-');

    const listed = await repo.listBrandScPublishAuditJournalForCollection('SS27', 5);
    expect(listed[0]?.articleId).toBe('demo-ss27-01');
    expect(listed[0]?.source).toBe('bulk_showroom_publish');
  });
});

describe('wave TN — domain event mirror hook', () => {
  it('enqueue showroom.published mirrors to audit repository', async () => {
    const repo = await import('@/lib/server/brand-sc-publish-audit-repository');
    const events = await import('@/lib/server/workshop2-domain-events');
    repo.clearBrandScPublishAuditJournalMemoryForTests();
    events.clearWorkshop2DomainEventOutboxMemoryForTests();

    await events.enqueueWorkshop2DomainEvent({
      type: 'showroom.published',
      collectionId: 'SS27',
      articleId: 'mirror-art',
      payload: { campaignName: 'mirror test', source: 'showroom_publish' },
      dispatchNow: false,
    });

    const journal = await repo.listBrandScPublishAuditJournalForCollection('SS27', 3);
    expect(journal.some((r) => r.articleId === 'mirror-art')).toBe(true);
  });
});
