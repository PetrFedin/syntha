import fs from 'node:fs';
import path from 'node:path';
import {
  FACTORY_SAMPLE_PATCH_STATUSES,
  validateFactorySamplePatch,
  validateFactorySampleStatusTransition,
} from '@/lib/production/workshop2-factory-sample-patch';
import {
  clearWorkshop2SampleStateChangeWebhookJournalForTests,
  handleWorkshop2SampleStateChangeWebhook,
} from '@/lib/server/workshop2-sample-state-change-webhook-handler';
import {
  factorySampleQueueDeepHref,
  factorySampleQueueItemDomId,
  factorySampleQueueItemHash,
  formatMfrSampleQueueStatusLabelRu,
  mfrSampleQueuePollLabelRu,
  parseFactorySampleQueueHash,
  WAVE_XC_FACTORY_SAMPLE_PATCH_API,
  WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH,
  WAVE_XC_MFR_SAMPLE_QUEUE_POLL_SSE_RU,
} from '@/lib/platform/wave-xc-mfr-sample-status-patch';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave XC — mfr sample queue status PATCH + hash-scroll', () => {
  beforeEach(() => {
    clearWorkshop2SampleStateChangeWebhookJournalForTests();
  });

  it('factory PATCH allows only in_progress + received', () => {
    expect(FACTORY_SAMPLE_PATCH_STATUSES).toEqual(['in_progress', 'received']);
    expect(validateFactorySamplePatch({ status: 'draft' }).ok).toBe(false);
    expect(validateFactorySamplePatch({ note: 'комментарий' }).ok).toBe(true);
    expect(validateFactorySamplePatch({ status: 'received' }).ok).toBe(true);
    expect(validateFactorySampleStatusTransition('sent', 'in_progress').allowed).toBe(true);
    expect(validateFactorySampleStatusTransition('draft', 'received').allowed).toBe(false);
  });

  it('hash-scroll helpers parse section and order item', () => {
    expect(parseFactorySampleQueueHash('#sample-queue')).toEqual({
      section: WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH,
    });
    expect(parseFactorySampleQueueHash('sample-queue-ord%2F1')).toEqual({
      section: WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH,
      orderId: 'ord/1',
    });
    expect(factorySampleQueueItemHash('SO-42')).toBe('sample-queue-SO-42');
    expect(factorySampleQueueItemDomId('SO-42')).toBe(factorySampleQueueItemHash('SO-42'));
  });

  it('deep href carries pcf=sample-queue and item hash', () => {
    const href = factorySampleQueueDeepHref({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      factoryId: 'fact-1',
      orderId: 'SO-1',
    });
    expect(href).toContain('pcf=sample-queue');
    expect(href).toContain('collection=SS27');
    expect(href).toContain('#sample-queue-SO-1');
  });

  it('RU status labels + poll meta (no EN poll/SSE noise)', () => {
    expect(formatMfrSampleQueueStatusLabelRu('sent')).toBe('Отправлен');
    expect(formatMfrSampleQueueStatusLabelRu('in_progress')).toBe('В работе');
    expect(mfrSampleQueuePollLabelRu(true)).toBe(WAVE_XC_MFR_SAMPLE_QUEUE_POLL_SSE_RU);
    expect(mfrSampleQueuePollLabelRu(false)).toContain('15');
  });

  it('PATCH route bumps development-status + sample webhook journal', async () => {
    const routeSrc = read('app/api/workshop2/factory/sample-queue/[orderId]/route.ts');
    expect(routeSrc).toContain('handleWorkshop2SampleStateChangeWebhook');
    expect(routeSrc).toContain('bumpPlatformCoreDevelopmentStatus');
    expect(routeSrc).toContain('factory_sample_patch');

    const webhook = await handleWorkshop2SampleStateChangeWebhook({
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      orderId: 'SO-xc-1',
      eventId: 'evt-xc-factory-patch',
      fromStatus: 'sent',
      toStatus: 'in_progress',
      actorLabel: 'factory-sample-patch',
    });
    expect(webhook.ok).toBe(true);
    expect(webhook.journalRecorded).toBe(true);
  });

  it('UI wiring — queue panel RU badges, item scroll ids, poll dedupe', () => {
    const panel = read('components/factory/FactoryWorkshop2SampleQueuePanel.tsx');
    expect(panel).toContain('formatMfrSampleQueueStatusLabelRu');
    expect(panel).toContain('factorySampleQueueItemDomId');
    expect(panel).toContain('WAVE_XC_MFR_SAMPLE_QUEUE_POLL_BADGE_TESTID');
    expect(panel).not.toContain('SSE live');
    expect(panel).not.toContain('poll 15s');

    const mirror = read('components/factory/MfrDevDevelopmentStatusMirrorStrip.tsx');
    expect(mirror).toContain('suppressDevPollHook');
    expect(mirror).toContain('mfrSampleQueuePollLabelRu');

    const devCard = read('components/platform/DevelopmentPillarCard.tsx');
    expect(devCard).toContain('suppressDevPollHook');
  });

  it('exports canonical factory PATCH API prefix', () => {
    expect(WAVE_XC_FACTORY_SAMPLE_PATCH_API).toBe('/api/workshop2/factory/sample-queue/');
  });
});
