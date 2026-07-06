import {
  clearBrandScPublishAuditJournalMemoryForTests,
  listBrandScPublishAuditJournalForCollection,
} from '@/lib/server/brand-sc-publish-audit-repository';
import {
  clearWorkshop2DomainEventOutboxMemoryForTests,
  enqueueWorkshop2DomainEvent,
} from '@/lib/server/workshop2-domain-events';

describe('listBrandScPublishAuditJournalForCollection', () => {
  beforeEach(() => {
    clearBrandScPublishAuditJournalMemoryForTests();
    clearWorkshop2DomainEventOutboxMemoryForTests();
  });

  it('returns showroom.published events for collection newest-first', async () => {
    await enqueueWorkshop2DomainEvent({
      type: 'showroom.published',
      collectionId: 'SS27',
      articleId: 'art-a',
      payload: { source: 'bulk_showroom_publish', campaignName: 'SS27 drop' },
      dispatchNow: false,
    });
    await enqueueWorkshop2DomainEvent({
      type: 'dossier.gate_passed',
      collectionId: 'SS27',
      articleId: 'art-b',
      payload: {},
      dispatchNow: false,
    });
    await enqueueWorkshop2DomainEvent({
      type: 'showroom.published',
      collectionId: 'FW27',
      articleId: 'art-x',
      payload: {},
      dispatchNow: false,
    });

    const all = await listBrandScPublishAuditJournalForCollection('SS27', 10);
    expect(all.length).toBe(1);
    expect(all[0]?.articleId).toBe('art-a');
    expect(all[0]?.eventType).toBe('showroom.published');
  });
});
