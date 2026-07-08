import fs from 'node:fs';
import path from 'node:path';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  buildBrandOpDossierLockedBadgeCrossLinks,
  shouldMountBrandDossierFactoryDiffLegacyStrip,
  shouldOmitBrandDossierDiffAttachTzCrossStrip,
  shouldOmitBrandOpDossierInlineDiffSummary,
  summarizeBrandDossierFactoryDiffCompactRu,
  WAVE_YL_BRAND_DOSSIER_DIFF_COMPACT_PANEL_TESTID,
  WAVE_YL_BRAND_OP_DOSSIER_LOCKED_ATTACH_TZ_LINK_TESTID,
  WAVE_YL_BRAND_OP_DOSSIER_LOCKED_CROSS_STRIP_TESTID,
  WAVE_YL_BRAND_OP_DOSSIER_LOCKED_DIFF_LINK_TESTID,
  WAVE_YL_DIFF_BRAND_COL_RU,
  WAVE_YL_DIFF_FACTORY_COL_RU,
  WAVE_YL_DIFF_LOCKED_ATTACH_TZ_RU,
  WAVE_YL_DIFF_LOCKED_DIFF_LINK_RU,
  WAVE_YL_DIFF_MATCH_RU,
  WAVE_YL_DIFF_READ_ONLY_BADGE_RU,
} from '@/lib/platform/wave-yl-brand-dossier-diff-viewer';
import { buildBrandDossierFactoryDiffStubRows } from '@/lib/fashion/brand-dossier-factory-diff-stub';
import { BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID } from '@/lib/platform/wave-xq-brand-dossier-dual-write-off';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

export const WAVE_YL_BRAND_DOSSIER_DIFF_FIXES = [
  {
    id: 'diff-panel-compact-ru',
    file: 'components/platform/BrandDossierFactoryDiffPanel.tsx',
    mustContain: [
      'wave-yl-brand-dossier-diff-viewer',
      'WAVE_YL_DIFF_READ_ONLY_BADGE_RU',
      'WAVE_YL_DIFF_BRAND_COL_RU',
      'WAVE_YL_DIFF_FACTORY_COL_RU',
      'context =',
      'shouldOmitBrandDossierDiffAttachTzCrossStrip',
    ],
    mustNotContain: ['>New SKU<'],
  },
  {
    id: 'brand-op-locked-cross-links',
    file: 'components/platform/PlatformCoreB2bOrderDetailFacts.tsx',
    mustContain: [
      'buildBrandOpDossierLockedBadgeCrossLinks',
      'WAVE_YL_BRAND_OP_DOSSIER_LOCKED_CROSS_STRIP_TESTID',
      'WAVE_YL_BRAND_OP_DOSSIER_LOCKED_DIFF_LINK_TESTID',
      'WAVE_YL_BRAND_OP_DOSSIER_LOCKED_ATTACH_TZ_LINK_TESTID',
      'context="brand-op"',
      'shouldOmitBrandOpDossierInlineDiffSummary',
    ],
    mustNotContain: [],
  },
  {
    id: 'brand-op-omit-attach-tz-dedup',
    file: 'components/platform/BrandDossierFactoryDiffPanel.tsx',
    mustContain: ['brand-dossier-factory-diff-peer-strip', 'omitAttachTzCrossStrip'],
    mustNotContain: [],
  },
  {
    id: 'legacy-diff-strip-unmounted',
    file: 'components/brand/production/BrandDossierFactoryDiffStrip.tsx',
    mustContain: ['shouldMountBrandDossierFactoryDiffLegacyStrip', 'superseded'],
    mustNotContain: [],
  },
] as const;

describe('wave YL — brand dossier diff viewer compact RU + dedupe', () => {
  it('exports compact RU labels + testids', () => {
    expect(WAVE_YL_DIFF_READ_ONLY_BADGE_RU).toBe('Сверка');
    expect(WAVE_YL_DIFF_BRAND_COL_RU).toBe('Бренд');
    expect(WAVE_YL_DIFF_FACTORY_COL_RU).toBe('Цех');
    expect(WAVE_YL_DIFF_MATCH_RU).toBe('Совпадает');
    expect(WAVE_YL_DIFF_LOCKED_DIFF_LINK_RU).toMatch(/сверка/i);
    expect(WAVE_YL_DIFF_LOCKED_ATTACH_TZ_RU).toBe('ТЗ → PO');
    expect(WAVE_YL_BRAND_DOSSIER_DIFF_COMPACT_PANEL_TESTID).toContain('compact');
    expect(WAVE_YL_BRAND_OP_DOSSIER_LOCKED_CROSS_STRIP_TESTID).toContain('locked-cross');
    expect(WAVE_YL_BRAND_OP_DOSSIER_LOCKED_DIFF_LINK_TESTID).toContain('locked-diff');
    expect(WAVE_YL_BRAND_OP_DOSSIER_LOCKED_ATTACH_TZ_LINK_TESTID).toContain('locked-attach');
  });

  it('compact summary RU', () => {
    const rows = buildBrandDossierFactoryDiffStubRows({
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
    });
    expect(summarizeBrandDossierFactoryDiffCompactRu(rows)).toMatch(/OK|≠/);
  });

  it('dedupe attach TZ cross-strip on brand OP only', () => {
    expect(shouldOmitBrandDossierDiffAttachTzCrossStrip('brand-dev')).toBe(false);
    expect(shouldOmitBrandDossierDiffAttachTzCrossStrip('brand-op')).toBe(true);
    expect(shouldOmitBrandOpDossierInlineDiffSummary('brand-op')).toBe(true);
    expect(shouldOmitBrandOpDossierInlineDiffSummary('brand-dev')).toBe(false);
    expect(shouldMountBrandDossierFactoryDiffLegacyStrip()).toBe(false);
  });

  it('locked badge cross-links diff viewer ↔ attach TZ PO', () => {
    const links = buildBrandOpDossierLockedBadgeCrossLinks({
      orderId: PLATFORM_CORE_DEMO.demoOrderId,
      collectionId: PLATFORM_CORE_DEMO.collectionId,
      articleId: PLATFORM_CORE_DEMO.demoArticleId,
      productionOrderId: PLATFORM_CORE_DEMO.productionOrderId,
    });
    expect(links.diffViewerHref).toContain('#brand-dossier-factory-diff');
    expect(links.attachTzPoHref).toContain('#w2-tz-export');
    expect(links.attachTzPdfPeerHref).toContain('attachTzPdf=1');
    expect(links.diffViewerAnchor).toBe('brand-dossier-factory-diff');
  });

  it('brand-dev keeps wave XQ attach TZ cross-strip testid', () => {
    expect(BRAND_DOSSIER_DIFF_ATTACH_TZ_PO_CROSS_STRIP_TESTID).toContain('cross-strip');
  });

  it.each(WAVE_YL_BRAND_DOSSIER_DIFF_FIXES)('$id — source wired', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });
});
