import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_ZE_E2E_SPEC,
  WAVE_ZE_MFR_DEV_MIRROR_BADGE_RU,
  WAVE_ZE_PARTNER_COUNT_LOADING_RU,
  WAVE_ZE_READ_PATH_API_BADGE_RU,
  WAVE_ZE_SC_COLLECTION_ERROR_RU,
  formatBrandCoPartnerCountLabelRu,
  formatBrandScMiniMatrixHintRu,
  formatHubCabinetPartnerStorageModeSuffixRu,
  formatPublishedReadPathBadgeRu,
  formatPublishedReadPathBadgeTitleRu,
} from '@/lib/platform/wave-ze-hub-diagnostics-ru';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave ZE — hub diagnostics RU microcopy pass 3. */
export const WAVE_ZE_HUB_PILLAR_FIXES = [
  {
    id: 'brand-sc-collection-error-ru',
    file: 'components/platform/BrandSampleCollectionMini.tsx',
    mustContain: ['WAVE_ZE_SC_COLLECTION_ERROR_RU'],
    mustNotContain: ['проверьте PG и сеть'],
  },
  {
    id: 'brand-co-partner-loading-ru',
    file: 'components/platform/CollectionOrderPillarCard.tsx',
    mustContain: ['WAVE_ZE_PARTNER_COUNT_LOADING_RU', 'formatHubCabinetPartnerStorageModeSuffixRu'],
    mustNotContain: ['PG · партнёры'],
  },
  {
    id: 'readpath-badge-title-ru',
    file: 'components/platform/PlatformCorePublishedArticlesReadPathBadge.tsx',
    mustContain: ['formatPublishedReadPathBadgeTitleRu', 'formatPublishedReadPathBadgeRu'],
    mustNotContain: ['publishedArticlesReadPath='],
  },
  {
    id: 'pillar-diagnostics-audit-hint-ru',
    file: 'components/platform/PillarCabinetDiagnostics.tsx',
    mustContain: ['WAVE_ZE_DIAGNOSTICS_AUDIT_HINT_RU'],
    mustNotContain: ['аудит / SSE'],
  },
  {
    id: 'mfr-dev-mirror-empty-ru',
    file: 'components/factory/MfrDevDevelopmentStatusMirrorStrip.tsx',
    mustContain: ['WAVE_ZE_MFR_DEV_MIRROR_EMPTY_RU', 'WAVE_ZE_MFR_DEV_PG_UNAVAILABLE_RU'],
    mustNotContain: ['Нет шагов development-status', 'bootstrap db:core'],
  },
  {
    id: 'brand-sc-cross-matrix-readpath-ru',
    file: 'lib/b2b/brand-sc-cross-matrix.ts',
    mustContain: ['formatPublishedReadPathBadgeRu', 'formatBrandScMiniMatrixHintRu'],
    mustNotContain: ['PG · список из API', 'localStorage · не core SoT', 'с prefill SKU'],
  },
  {
    id: 'brand-co-partner-count-label-ru',
    file: 'lib/b2b/brand-co-wave-yg.ts',
    mustContain: ['formatBrandCoPartnerCountLabelRu'],
    mustNotContain: ['pgLabel: activePartners > 0 ? `PG ·'],
  },
];

describe('wave ZE — hub diagnostics RU formatters', () => {
  it('read path badge RU without PG/API/localStorage noise', () => {
    expect(formatPublishedReadPathBadgeRu('api')).toBe(WAVE_ZE_READ_PATH_API_BADGE_RU);
    expect(formatPublishedReadPathBadgeRu('localStorage')).not.toMatch(/localStorage|API|PG/i);
    expect(formatPublishedReadPathBadgeTitleRu('api')).toMatch(/баз/i);
    expect(formatPublishedReadPathBadgeTitleRu('localStorage')).toMatch(/локальн/i);
  });

  it('partner count label without PG prefix', () => {
    expect(formatBrandCoPartnerCountLabelRu(2)).toBe('2 партн.');
    expect(formatBrandCoPartnerCountLabelRu(0)).toBe('0 партн.');
  });

  it('mini-matrix hint without qty/prefill English', () => {
    expect(formatBrandScMiniMatrixHintRu(0)).toMatch(/подстановкой SKU лайншита/);
    expect(formatBrandScMiniMatrixHintRu(3, 9)).toContain('кол-во 9');
    expect(formatBrandScMiniMatrixHintRu(3, 9)).not.toMatch(/qty/i);
  });

  it('storage mode suffix audit-only', () => {
    expect(formatHubCabinetPartnerStorageModeSuffixRu('file', false)).toBe('');
    expect(formatHubCabinetPartnerStorageModeSuffixRu('file', true)).toBe(' · файл');
    expect(formatHubCabinetPartnerStorageModeSuffixRu('postgres', true)).toBe('');
  });

  it('mfr mirror badge RU', () => {
    expect(WAVE_ZE_MFR_DEV_MIRROR_BADGE_RU).toBe('Статус разработки');
    expect(WAVE_ZE_SC_COLLECTION_ERROR_RU).not.toMatch(/\bPG\b/);
    expect(WAVE_ZE_PARTNER_COUNT_LOADING_RU).not.toMatch(/\bPG\b/);
  });
});

describe('wave ZE — hub pillar wiring', () => {
  it.each(WAVE_ZE_HUB_PILLAR_FIXES)('$id — source wired', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });

  it('core-246 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e', WAVE_ZE_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain(`**/${WAVE_ZE_E2E_SPEC}`);
  });
});
