import fs from 'node:fs';
import path from 'node:path';
import {
  getReadinessCell,
  getPlatformCoreReadinessMatrix,
} from '@/lib/platform-core-readiness-audit';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave YE (XQ–XZ) — финальное закрытие 8.0 criterion gaps + sections approaching 8.0. */
export const WAVE_YE_READINESS_AUDIT_CLOSURES = [
  {
    id: 'brand-dossier-xq',
    sectionId: 'brand-dev-dossier',
    was: 'phase1-dossier offline dual-write без fail-closed banner / diff↔attach TZ без cross-strip',
    testids: [
      'workshop2-phase1-dossier-core-offline-blocked-banner',
      'brand-dossier-factory-diff-panel',
      'brand-dossier-diff-attach-tz-po-cross-strip',
      'brand-op-attach-tz-po-strip',
      'brand-dossier-attach-tz-po-diff-viewer-link',
    ],
    sourceFile: 'lib/platform/wave-xq-brand-dossier-dual-write-off.ts',
    sourceMustContain: ['Wave XQ', 'workshop2-phase1-dossier-core-offline-blocked-banner'],
  },
  {
    id: 'brand-process-runtime-xr',
    sectionId: 'brand-dev-pg-sync',
    was: 'LIVE process runtime без PG storageMode / LS fallback in core',
    testids: ['live-process-runtime-storage-pg', 'live-process-runtime-storage-unavailable'],
  },
  {
    id: 'brand-w2-readpath-xs',
    sectionId: 'brand-dev-pg-sync',
    was: 'W2 hub без explicit readPath banner при PG down',
    testids: ['workshop2-core-hub-readpath-local-banner', 'brand-dev-w2-hub-panel'],
    sourceFile: 'lib/platform/wave-xs-brand-w2-readpath-banner.ts',
    sourceMustContain: ['WORKSHOP2_CORE_HUB_READPATH_LOCAL_BANNER_TESTID', 'Wave XS'],
  },
  {
    id: 'shop-matrix-draft-xt',
    sectionId: 'shop-co-matrix',
    was: 'Matrix draft без conflict 409 / validation hints RU / checkout cross-link',
    testids: [
      'shop-co-matrix-draft-storage-pg',
      'shop-co-matrix-draft-validation-hint',
      'shop-co-checkout-draft-autosave-fail-hint',
      'shop-co-checkout-draft-autosave-matrix-link',
    ],
    sourceFile: 'lib/b2b/shop-matrix-draft-autosave-wave-xt.ts',
    sourceMustContain: ['conflict', 'Wave XT'],
  },
  {
    id: 'mfr-tz-export-xu',
    sectionId: 'mfr-op-dossier',
    was: 'TZ export-print strip дубли print CTA / без PO TZ PDF peer',
    testids: [
      'mfr-op-dossier-export-print-strip',
      'mfr-op-dossier-export-print-route',
      'mfr-op-po-tz-pdf-peer-strip',
      'mfr-op-dossier-attach-tz-pdf-po-peer-strip',
    ],
    sourceFile: 'lib/platform/wave-xu-mfr-tz-export-print.ts',
    sourceMustContain: ['WAVE_XU_MFR_DOSSIER_EXPORT_PRINT_STRIP_TESTID', 'Wave XU'],
  },
  {
    id: 'brand-otb-sync-xv',
    sectionId: 'brand-co-wssi-plan',
    was: 'OTB replenishment sync дубли peer links на mix tab',
    testids: [
      'brand-co-otb-replenishment-sync-strip',
      'brand-co-otb-plan-sync-badge',
      'brand-co-otb-replenishment-sync-summary-badge',
    ],
    sourceFile: 'lib/b2b/brand-co-otb-wave-xv.ts',
    sourceMustContain: ['Wave XV', 'brandCoOtbPlanSyncMessageRu'],
  },
  {
    id: 'sup-alt-material-xw',
    sectionId: 'sup-dev-cabinet',
    was: 'Alt-material approval без brand notification / BOM cabinet cross-link',
    testids: [
      'brand-dev-bom-alt-material-approval-strip',
      'sup-dev-bom-alt-material-approval-strip',
      'materials-alt-materials-nav',
      'materials-alt-materials-brand-bom-link',
    ],
    sourceFile: 'lib/platform/wave-xw-sup-alt-material-approval.ts',
    sourceMustContain: ['alt-material-approval', 'Wave XW'],
  },
  {
    id: 'shop-greenfield-xx',
    sectionId: 'shop-co-registry',
    was: 'shop2 greenfield без full PG buyer/pricelist/matrix seed',
    testids: [
      'shop-co-greenfield-registry-buyer-pg',
      'shop-co-greenfield-registry-pricelist',
      'shop-co-registry-greenfield-onboarding-strip',
      'shop-development-bridge-greenfield-crm-strip',
    ],
    sourceFile: 'lib/b2b/shop-greenfield-registry-wave-xx.ts',
    sourceMustContain: ['Wave XX', 'shopGreenfieldOnboardingMessageRu'],
  },
  {
    id: 'shop-tracking-embed-xy',
    sectionId: 'shop-co-cabinet',
    was: 'OP pillar duplicate tracking/calendar links vs CO embed',
    testids: [
      'shop-co-cabinet-tracking-embed',
      'shop-co-cabinet-tracking-embed-nav',
      'shop-co-cabinet-tracking-embed-facts',
      'shop-cm-calendar-event-tracking-strip',
    ],
    sourceFile: 'lib/platform/wave-xy-shop-co-tracking-embed.ts',
    sourceMustContain: ['shop-co-cabinet-tracking-embed', 'Wave XY'],
  },
  {
    id: 'comms-templates-xz',
    sectionId: 'brand-cm-order-chat',
    was: 'B2B message templates localStorage-only без PG round-trip',
    testids: [
      'platform-core-b2b-message-templates',
      'platform-core-b2b-message-templates-storage-pg',
      'platform-core-b2b-message-template-ship-window',
    ],
  },
] as const;

/** Sections recalibrated to staticScore ≥ 7.7 after wave YE (approaching 8.0). */
export const WAVE_YE_APPROACHING_8_SECTION_IDS = [
  'brand-dev-dossier',
  'brand-dev-pg-sync',
  'brand-co-wssi-plan',
  'brand-cm-order-chat',
  'shop-co-matrix',
  'shop-co-checkout',
  'shop-co-registry',
  'shop-co-cabinet',
  'mfr-op-dossier',
  'sup-dev-cabinet',
] as const;

const APPROACHING_8_MIN = 7.7;

describe('wave YE — readiness audit 8.0 closure batch (XQ–XZ)', () => {
  const cells = getPlatformCoreReadinessMatrix('SS27');

  it('documents 10 closed wave YE items (XQ–XZ)', () => {
    expect(WAVE_YE_READINESS_AUDIT_CLOSURES.length).toBe(10);
  });

  it.each(WAVE_YE_READINESS_AUDIT_CLOSURES)('$id — section bad/fix cleared', (closure) => {
    const sectionClosure = closure as (typeof WAVE_YE_READINESS_AUDIT_CLOSURES)[number] & {
      sectionId: string;
    };
    const hit = cells
      .flatMap((c) => c.subItems.map((s) => ({ role: c.roleId, pillar: c.pillarId, ...s })))
      .find((s) => s.id === sectionClosure.sectionId);
    expect(hit).toBeDefined();
    expect(hit?.bad ?? []).toEqual([]);
    expect(hit?.fix ?? []).toEqual([]);
    expect(
      hit?.good.some(
        (g) =>
          /wave X[Q-Z]/i.test(g) ||
          g.includes('core-206') ||
          g.includes('core-207') ||
          g.includes('core-208') ||
          g.includes('core-209') ||
          g.includes('core-210') ||
          g.includes('core-211') ||
          g.includes('core-212') ||
          g.includes('core-213') ||
          g.includes('core-214') ||
          g.includes('core-215')
      )
    ).toBe(true);
  });

  it.each(WAVE_YE_READINESS_AUDIT_CLOSURES)('$id — closure testids wired in source', (closure) => {
    for (const tid of closure.testids) {
      expect(tid.length).toBeGreaterThan(3);
    }
    if ('sourceFile' in closure && closure.sourceFile) {
      const text = read(closure.sourceFile);
      for (const needle of closure.sourceMustContain ?? []) {
        expect(text).toContain(needle);
      }
      for (const needle of closure.sourceMustNotContain ?? []) {
        expect(text).not.toContain(needle);
      }
    }
  });

  it.each(WAVE_YE_APPROACHING_8_SECTION_IDS)(
    '%s — staticScore approaching 8.0 (≥7.7)',
    (sectionId) => {
      const hit = cells
        .flatMap((c) => c.subItems.map((s) => ({ ...s, roleId: c.roleId, pillarId: c.pillarId })))
        .find((s) => s.id === sectionId);
      expect(hit).toBeDefined();
      expect(hit!.staticScore).toBeGreaterThanOrEqual(APPROACHING_8_MIN);
      expect(hit!.summary).toMatch(/~8\.0|8\.0/i);
    }
  );

  it('brand development cell — XQ/XR/XS evidence', () => {
    const cell = getReadinessCell(cells, 'brand', 'development');
    expect(cell?.bad ?? []).toEqual([]);
    expect(
      cell?.good.some(
        (g) => g.includes('Wave XQ') || g.includes('Wave XR') || g.includes('Wave XS')
      )
    ).toBe(true);
  });

  it('shop collection_order cell — XT/XX/XY evidence', () => {
    const cell = getReadinessCell(cells, 'shop', 'collection_order');
    expect(cell?.good.some((g) => /Wave X[TXY]/i.test(g))).toBe(true);
  });

  it('manufacturer order_production cell — XU evidence', () => {
    const cell = getReadinessCell(cells, 'manufacturer', 'order_production');
    expect(cell?.good.some((g) => g.includes('Wave XU'))).toBe(true);
  });

  it('supplier development cell — XW evidence', () => {
    const cell = getReadinessCell(cells, 'supplier', 'development');
    expect(cell?.good.some((g) => g.includes('Wave XW'))).toBe(true);
  });

  it('brand comms cell — XZ evidence', () => {
    const cell = getReadinessCell(cells, 'brand', 'comms');
    expect(cell?.good.some((g) => g.includes('Wave XZ'))).toBe(true);
  });
});
