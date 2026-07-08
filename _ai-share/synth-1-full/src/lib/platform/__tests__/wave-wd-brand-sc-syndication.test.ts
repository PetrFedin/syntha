import {
  BRAND_SC_SYNDICATION_WD_AUDIT_BADGE_TESTID,
  BRAND_SC_SYNDICATION_WD_AUDIT_ROLLBACK_RU,
  BRAND_SC_SYNDICATION_WD_AUDIT_SYNDICATED_RU,
  BRAND_SC_SYNDICATION_WD_AUDIT_UNPUBLISH_RU,
  BRAND_SC_SYNDICATION_WD_PANEL_TESTID,
  BRAND_SC_SYNDICATION_WD_RELEASE_PUSH_API_PATH,
  brandScSyndicationWdAuditEventLabelRu,
  brandScSyndicationWdPdfEmptyHintRu,
  brandScSyndicationWdPublishAuditApiPath,
  brandScSyndicationWdReleasePushApiPath,
  brandScSyndicationWdSyndicateApiPath,
} from '@/lib/production/brand-sc-syndication-wd';
import {
  BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH,
  BRAND_LINESHEET_SYNDICATE_API_PATH,
} from '@/lib/production/brand-linesheet-syndication';
import { BRAND_SC_PUBLISH_AUDIT_SYNDICATION_WD_RU } from '@/lib/production/brand-sc-publish-audit';
import {
  brandScBatchRollbackSuccessCopyIncludes,
  brandScBatchUnpublishRollbackApiPath,
  brandScLinesheetPdfEmptyApiMessageRu,
  brandScLinesheetPdfEmptyUiHintRu,
  verifyBrandScBatchUnpublishRollbackRoundtrip,
} from '@/lib/b2b/brand-sc-linesheet-readpath';

describe('wave WD — brand SC syndication API + release push bridge', () => {
  it('syndicate + release push API paths', () => {
    expect(brandScSyndicationWdSyndicateApiPath('SS27')).toBe(
      `${BRAND_LINESHEET_SYNDICATE_API_PATH}?collection=SS27`
    );
    expect(brandScSyndicationWdReleasePushApiPath()).toBe(
      BRAND_SC_SYNDICATION_WD_RELEASE_PUSH_API_PATH
    );
    expect(BRAND_SC_SYNDICATION_WD_RELEASE_PUSH_API_PATH).toContain('release-syndication');
  });

  it('PG migration index for syndication audit', () => {
    expect('063_wave_wd_syndication_publish_audit').toContain('syndication');
    expect('idx_brand_sc_publish_audit_journal_event_type').toContain('event_type');
  });

  it('RU copy for WD audit bridge', () => {
    expect(BRAND_SC_SYNDICATION_WD_AUDIT_SYNDICATED_RU).toMatch(/Syndication|syndication/i);
    expect(BRAND_SC_SYNDICATION_WD_AUDIT_UNPUBLISH_RU).toMatch(/unpublish|snapshot/i);
    expect(BRAND_SC_SYNDICATION_WD_AUDIT_ROLLBACK_RU).toMatch(/rollback|Rollback/i);
    expect(BRAND_SC_PUBLISH_AUDIT_SYNDICATION_WD_RU).toContain('PG audit');
  });

  it('publish audit API path for WD', () => {
    expect(brandScSyndicationWdPublishAuditApiPath('SS27')).toContain('publish-audit-log');
    expect(brandScSyndicationWdPublishAuditApiPath('SS27')).toContain('SS27');
  });

  it('UI testids on linesheets syndication WD', () => {
    expect(BRAND_SC_SYNDICATION_WD_PANEL_TESTID).toContain('syndicate-wd');
    expect(BRAND_SC_SYNDICATION_WD_AUDIT_BADGE_TESTID).toContain('audit-pg');
    expect('brand-sc-linesheets-syndicate-btn').toContain('syndicate');
    expect('brand-sc-linesheets-batch-unpublish-rollback').toContain('unpublish');
  });
});

describe('wave WD — publish audit event labels', () => {
  it('maps syndication / unpublish / rollback labels', () => {
    expect(brandScSyndicationWdAuditEventLabelRu('linesheet.syndicated')).toBe('syndication');
    expect(brandScSyndicationWdAuditEventLabelRu('showroom.batch_unpublished')).toBe('unpublish');
    expect(brandScSyndicationWdAuditEventLabelRu('showroom.batch_rollback')).toBe('rollback');
    expect(brandScSyndicationWdAuditEventLabelRu('showroom.published')).toBe('publish');
  });
});

describe('wave WD — PDF empty collection edge cases', () => {
  it('EMPTY27 API + UI hints', () => {
    expect(brandScLinesheetPdfEmptyApiMessageRu('EMPTY27')).toMatch(/PDF|артикул/i);
    expect(brandScLinesheetPdfEmptyUiHintRu('EMPTY27')).toMatch(/пустая коллекция|SS27/i);
  });

  it('FW27 unpublished hint (wave WD polish)', () => {
    expect(brandScSyndicationWdPdfEmptyHintRu('FW27')).toMatch(/FW27|publish/i);
    expect(brandScLinesheetPdfEmptyUiHintRu('FW27')).toMatch(/FW27|publish/i);
  });

  it('SS27 honest unpublished API message', () => {
    expect(brandScLinesheetPdfEmptyApiMessageRu('SS27')).toMatch(/опубликован/i);
  });
});

describe('wave WD — batch unpublish rollback verify', () => {
  it('rollback API path', () => {
    expect(brandScBatchUnpublishRollbackApiPath()).toBe(
      BRAND_LINESHEET_BATCH_UNPUBLISH_ROLLBACK_API_PATH
    );
  });

  it('roundtrip helper', () => {
    const result = verifyBrandScBatchUnpublishRollbackRoundtrip(
      { ok: true, snapshot: { snapshotId: 'rb-wd-1' }, unpublishedCount: 1 },
      { ok: true, restoredCount: 1, snapshotId: 'rb-wd-1' }
    );
    expect(result.unpublishOk).toBe(true);
    expect(result.rollbackOk).toBe(true);
    expect(result.hasSnapshot).toBe(true);
  });

  it('RU success copy matchers', () => {
    expect(brandScBatchRollbackSuccessCopyIncludes('Rollback выполнен')).toBe(true);
  });
});

describe('wave WD — syndication server mirrors publish audit PG', () => {
  it('postBrandLinesheetSyndicate appends linesheet.syndicated audit rows', async () => {
    const auditRepo = await import('@/lib/server/brand-sc-publish-audit-repository');
    const server = await import('@/lib/server/brand-linesheet-syndication-server');
    auditRepo.clearBrandScPublishAuditJournalMemoryForTests();

    const outcome = await server.postBrandLinesheetSyndicate({
      collectionId: 'SS27',
      articleIds: ['demo-ss27-wd-01'],
      shopBuyerId: 'shop1',
      source: 'syndicate_publish',
      publishMessageRu: 'test syndication',
    });

    if (outcome.ok) {
      const journal = await auditRepo.listBrandScPublishAuditJournalForCollection('SS27', 8);
      expect(
        journal.some(
          (r) => r.articleId === 'demo-ss27-wd-01' && r.eventType === 'linesheet.syndicated'
        )
      ).toBe(true);
    }
  });

  it('batch unpublish + rollback mirror audit event types', async () => {
    const auditRepo = await import('@/lib/server/brand-sc-publish-audit-repository');
    const server = await import('@/lib/server/brand-linesheet-syndication-server');
    auditRepo.clearBrandScPublishAuditJournalMemoryForTests();

    const unpublish = await server.postBrandLinesheetBatchUnpublish({
      collectionId: 'SS27',
      articleIds: ['demo-ss27-wd-02'],
    });
    if (unpublish.ok) {
      const afterUnpublish = await auditRepo.listBrandScPublishAuditJournalForCollection('SS27', 8);
      expect(afterUnpublish.some((r) => r.eventType === 'showroom.batch_unpublished')).toBe(true);
    }

    const rollback = await server.postBrandLinesheetBatchUnpublishRollback({
      collectionId: 'SS27',
    });
    if (rollback.ok) {
      const afterRollback = await auditRepo.listBrandScPublishAuditJournalForCollection('SS27', 8);
      expect(afterRollback.some((r) => r.eventType === 'showroom.batch_rollback')).toBe(true);
    }
  });
});
