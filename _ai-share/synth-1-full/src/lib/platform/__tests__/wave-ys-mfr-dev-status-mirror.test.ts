import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YS_BRAND_DEV_STATUS_RU,
  WAVE_YS_E2E_SPEC,
  WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU,
  WAVE_YS_MFR_DEV_STATUS_MIRROR_FIXES,
  WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID,
  WAVE_YS_SAMPLE_QUEUE_RU,
  buildMfrDevBrandDevelopmentStatusPeerHref,
  buildMfrDevSampleQueuePeerHref,
} from '@/lib/platform/wave-ys-mfr-dev-status-mirror';

const SRC = path.join(__dirname, '..', '..', '..');
const PKG_ROOT = path.join(SRC, '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

describe('wave YS — mfr dev status PG mirror', () => {
  it('exports RU badge + peer strip testids', () => {
    expect(WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU).toBe('Статус разработки');
    expect(WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID).toBe('mfr-dev-development-status-peer-strip');
    expect(WAVE_YS_BRAND_DEV_STATUS_RU).toBe('Статус разработки бренда');
    expect(WAVE_YS_SAMPLE_QUEUE_RU).toBe('Очередь образцов');
  });

  it('peer href builders — brand dev cabinet + sample queue deep link', () => {
    expect(buildMfrDevBrandDevelopmentStatusPeerHref('SS27')).toBe(
      '/brand/core?pillar=development&collection=SS27'
    );
    const queueHref = buildMfrDevSampleQueuePeerHref({
      collectionId: 'SS27',
      factoryId: 'fact-1',
      articleId: 'demo-ss27-01',
    });
    expect(queueHref).toContain('/factory/production?');
    expect(queueHref).toContain('collection=SS27');
    expect(queueHref).toContain('#sample-queue');
  });

  it('PG mirror API path contract', () => {
    expect('/api/workshop2/collections/').toContain('collections');
    expect('/development-status').toContain('development-status');
    expect('useMfrDevDevelopmentStatusMirror').toContain('Mirror');
    expect('mfr-dev-development-status-mirror-strip').toContain('mirror-strip');
  });

  it.each(WAVE_YS_MFR_DEV_STATUS_MIRROR_FIXES)('$id — source wired', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
  });

  it('core-234 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    expect(fs.existsSync(path.join(PKG_ROOT, 'e2e', WAVE_YS_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(path.join(PKG_ROOT, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain(`**/${WAVE_YS_E2E_SPEC}`);
  });
});
