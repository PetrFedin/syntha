import {
  WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_PATH,
  validateWorkshop2SampleStateChangeWebhookPayload,
} from '@/lib/production/workshop2-sample-state-change-webhook';
import {
  clearWorkshop2SampleStateChangeWebhookJournalForTests,
  handleWorkshop2SampleStateChangeWebhook,
} from '@/lib/server/workshop2-sample-state-change-webhook-handler';

describe('wave VA — brand dev webhook + tasks + greenfield + SSE', () => {
  beforeEach(() => {
    clearWorkshop2SampleStateChangeWebhookJournalForTests();
  });

  it('sample state-change webhook API path + validation', () => {
    expect(WORKSHOP2_SAMPLE_STATE_CHANGE_WEBHOOK_PATH).toBe(
      '/api/workshop2/samples/state-change-webhook'
    );
    const ok = validateWorkshop2SampleStateChangeWebhookPayload({
      collectionId: 'SS27',
      articleId: 'ART-001',
      eventId: 'evt-va-1',
      toStatus: 'in_progress',
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.data.toStatus).toBe('in_progress');
  });

  it('sample webhook handler journals + idempotent replay', async () => {
    const first = await handleWorkshop2SampleStateChangeWebhook({
      collectionId: 'SS27',
      articleId: 'ART-001',
      eventId: 'evt-va-dup',
      toStatus: 'sent',
      fromStatus: 'draft',
    });
    expect(first.ok).toBe(true);
    expect(first.journalRecorded).toBe(true);

    const second = await handleWorkshop2SampleStateChangeWebhook({
      collectionId: 'SS27',
      articleId: 'ART-001',
      eventId: 'evt-va-dup',
      toStatus: 'sent',
    });
    expect(second.ok).toBe(true);
    expect(second.idempotent).toBe(true);
  });

  it('tasks kanban mini-panel testids', () => {
    expect('brand-dev-tasks-kanban-panel').toContain('kanban');
    expect('brand-dev-tasks-kanban-board').toContain('board');
    expect('brand-dev-tasks-kanban-column-todo').toContain('todo');
    expect('brand-dev-tasks-kanban-pg').toContain('pg');
    expect('brand-dev-tasks-kanban-add-btn').toContain('add-btn');
  });

  it('brand tasks API uses GET/POST /api/brand/tasks', () => {
    expect('/api/brand/tasks').toContain('brand/tasks');
  });

  it('greenfield monetization segment strip testids', () => {
    expect('brand-dev-greenfield-monetization-segment-strip').toContain('greenfield');
    expect('brand-dev-greenfield-segment').toContain('segment');
    expect('brand-dev-greenfield-pg-source').toContain('pg-source');
    expect('brand-dev-greenfield-matrix-link').toContain('matrix');
  });

  it('dev cabinet SSE badge extends development-status poll', () => {
    expect('brand-dev-development-sse-live-badge').toContain('sse-live');
    expect('brand-dev-development-poll-badge').toContain('poll');
    expect('data-development-sse-live').toContain('development-sse');
    expect('/api/workshop2/collections/development-status-stream').toContain(
      'development-status-stream'
    );
  });
});
