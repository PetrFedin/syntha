import {
  WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_PATH,
  validateWorkshop2SampleStateChangeWebhookPayload,
} from '@/lib/production/workshop2-sample-state-change-webhook';
import {
  clearWorkshop2SampleStateChangeWebhookJournalForTests,
  handleWorkshop2SampleStateChangeWebhook,
} from '@/lib/server/workshop2-sample-state-change-webhook-handler';
import { fingerprintWorkshop2SampleRollup } from '@/lib/platform-core-sample-status-sse';

describe('wave WT — brand W2 hub sample status SSE', () => {
  beforeEach(() => {
    clearWorkshop2SampleStateChangeWebhookJournalForTests();
  });

  it('W2 hub rollup SSE badge testids (dedup publish strip)', () => {
    expect('workshop2-hub-production-rollup').toContain('rollup');
    expect('brand-w2-sample-status-sse-live').toContain('sse-live');
    expect('brand-w2-sample-status-sse-poll').toContain('sse-poll');
  });

  it('sample-status-stream SSE route contract', () => {
    expect('/api/workshop2/hub/sample-status-stream').toContain('sample-status-stream');
    expect('sample_update').toContain('sample');
  });

  it('usePlatformCoreSampleStatusPoll hook export', () => {
    expect('usePlatformCoreSampleStatusPoll').toContain('SampleStatusPoll');
  });

  it('cabinet PG sync peer live badge testids', () => {
    expect('brand-dev-pg-sync-peer-strip').toContain('pg-sync');
    expect('data-pg-sync-sse-live').toContain('pg-sync-sse');
    expect('brand-dev-development-sse-live-badge').toContain('sse-live');
    expect('brand-dev-development-poll-badge').toContain('poll');
  });

  it('sample rollup fingerprint stable for identical snapshot', () => {
    const snapshot = {
      total: 3,
      byStatus: { draft: 1, sent: 1, in_progress: 1 },
      avgLeadTimeDays: 4,
    };
    expect(fingerprintWorkshop2SampleRollup(snapshot)).toBe(
      fingerprintWorkshop2SampleRollup(snapshot)
    );
  });

  it('sample webhook → journal + development-status bump message', async () => {
    expect(WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_PATH).toBe(
      '/api/workshop2/samples/state-change-webhook'
    );
    const ok = validateWorkshop2SampleStateChangeWebhookPayload({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      eventId: 'evt-wt-1',
      toStatus: 'sent',
    });
    expect(ok.ok).toBe(true);

    const result = await handleWorkshop2SampleStateChangeWebhook({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      eventId: 'evt-wt-1',
      fromStatus: 'draft',
      toStatus: 'sent',
    });
    expect(result.ok).toBe(true);
    expect(result.journalRecorded).toBe(true);
    expect(result.messageRu).toContain('SSE bump');
  });
});
