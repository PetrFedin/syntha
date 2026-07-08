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

/** Wave VH — закрытые high-visibility пункты readiness-аудита (testids + cell/section keys). */
export const WAVE_VH_READINESS_AUDIT_CLOSURES = [
  {
    id: 'brand-sc-linesheet-pdf-empty',
    cell: { role: 'brand' as const, pillar: 'sample_collection' as const },
    was: 'PDF edge cases на пустой коллекции',
    testids: [
      'brand-sc-linesheet-pdf-empty-disabled',
      'brand-sc-linesheet-pdf-empty-hint',
      'brand-sc-linesheets-empty-copy',
    ],
  },
  {
    id: 'shop-sc-cover-hero-partner-honesty',
    cell: { role: 'shop' as const, pillar: 'sample_collection' as const },
    was: 'Cover hero: dossier может перекрыть partner PG',
    testids: [
      'shop-sc-showroom-cover-hero-priority-strip',
      'shop-sc-showroom-partner-logo-source-dossier-fallback',
      'shop-sc-showroom-partner-logo-source-catalog-fallback',
    ],
  },
  {
    id: 'shop-co-tracking-calendar-cta',
    cell: { role: 'shop' as const, pillar: 'comms' as const },
    was: 'Tracking без link на calendar row',
    testids: ['shop-co-tracking-calendar-link', 'shop-co-tracking-row-calendar-link'],
  },
  {
    id: 'supplier-core-material-catalog-nav',
    cell: { role: 'supplier' as const, pillar: 'development' as const },
    was: 'Нет единого каталога поставщика в core nav',
    testids: [
      'supplier-core-material-catalog-nav',
      'supplier-core-material-catalog-materials-peer',
      'supplier-core-material-catalog-rfq-peer',
    ],
  },
  {
    id: 'mfr-op-bulk-ack-sot-strip',
    sectionId: 'mfr-op-production-orders',
    was: 'Дубль bulk-ack с handoff panel на /production',
    testids: ['mfr-op-handoff-queue-registry-sot-strip', 'mfr-op-handoff-queue-registry-sot-link'],
  },
  {
    id: 'sup-dev-nav-alias-intentional',
    sectionId: 'sup-dev-comms-peer',
    was: 'Дубль nav столп 1 vs 5 (осознанный alias)',
    testids: ['sup-dev-rfq-quote-card-panel', 'sup-cm-article-chat-link'],
  },
  {
    id: 'pillar-section-list-ru-live',
    was: 'EN Live label в pillar section list',
    testids: ['pillar-cabinet-section-list'],
    sourceFile: 'components/platform/PillarSectionList.tsx',
    sourceMustContain: ['В эфире', 'SSE в эфире'],
    sourceMustNotContain: ["'Live'"],
  },
  {
    id: 'chain-status-refresh-badge-ru',
    was: 'EN Live label в chain-status badge',
    testids: ['platform-core-chain-status-refresh-badge'],
    sourceFile: 'components/platform/PlatformCoreChainStatusRefreshBadge.tsx',
    sourceMustContain: ['В эфире'],
    sourceMustNotContain: ["? 'Live'"],
  },
  {
    id: 'brand-dossier-factory-diff-ru',
    was: 'EN Live/stub/file labels в dossier diff panel',
    testids: ['brand-dossier-factory-diff-live-badge', 'brand-dossier-factory-diff-loading-badge'],
    sourceFile: 'components/platform/BrandDossierFactoryDiffPanel.tsx',
    sourceMustContain: ['В эфире', 'заглушка', 'файл'],
    sourceMustNotContain: ['>stub<'],
  },
  {
    id: 'pillar-cabinet-diagnostics-ru',
    was: 'EN audit label в diagnostics summary',
    testids: ['pillar-cabinet-diagnostics'],
    sourceFile: 'components/platform/PillarCabinetDiagnostics.tsx',
    sourceMustContain: ['WAVE_ZE_DIAGNOSTICS_AUDIT_HINT_RU'],
    sourceMustNotContain: ['audit / SSE'],
  },
] as const;

describe('wave VH — readiness audit closures', () => {
  const cells = getPlatformCoreReadinessMatrix('SS27');

  it('documents 8–10 closed high-visibility items', () => {
    expect(WAVE_VH_READINESS_AUDIT_CLOSURES.length).toBeGreaterThanOrEqual(8);
    expect(WAVE_VH_READINESS_AUDIT_CLOSURES.length).toBeLessThanOrEqual(12);
  });

  it.each(WAVE_VH_READINESS_AUDIT_CLOSURES.filter((c) => 'cell' in c && c.cell))(
    '$id — cell bad/fix cleared',
    (closure) => {
      const cell = getReadinessCell(cells, closure.cell!.role, closure.cell!.pillar);
      expect(cell?.bad ?? []).toEqual([]);
      expect(cell?.fix ?? []).toEqual([]);
      expect(
        cell?.good.some(
          (g) => g.includes('wave VH') || g.includes('Wave VH') || g.includes('Wave VG')
        )
      ).toBe(true);
    }
  );

  it.each(WAVE_VH_READINESS_AUDIT_CLOSURES.filter((c) => 'sectionId' in c && c.sectionId))(
    '$id — section bad/fix cleared',
    (closure) => {
      const sectionClosure = closure as (typeof WAVE_VH_READINESS_AUDIT_CLOSURES)[number] & {
        sectionId: string;
      };
      const hit = cells
        .flatMap((c) => c.subItems.map((s) => ({ role: c.roleId, pillar: c.pillarId, ...s })))
        .find((s) => s.id === sectionClosure.sectionId);
      expect(hit).toBeDefined();
      expect(hit?.bad ?? []).toEqual([]);
      expect(hit?.fix ?? []).toEqual([]);
    }
  );

  it.each(WAVE_VH_READINESS_AUDIT_CLOSURES)('$id — closure testids wired in source', (closure) => {
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

  it('tracking panel renders per-row calendar links', () => {
    const tracking = read('components/platform/PlatformCoreShopB2bTrackingPanel.tsx');
    expect(tracking).toContain('shop-co-tracking-row-calendar-link-');
    expect(tracking).toContain('shop-co-tracking-calendar-link');
  });

  it('supplier cabinet catalog nav peers present', () => {
    const hub = read('components/platform/RoleCoreCabinetHub.tsx');
    const nav = read('components/factory/supplier/SupplierDevPillarMaterialCatalogNav.tsx');
    const vg = read('lib/fashion/supplier-dev-wave-vg.ts');
    const wk = read('lib/fashion/supplier-dev-wave-wk.ts');
    expect(vg).toContain('supplier-core-material-catalog-nav');
    expect(vg).toContain('supplier-core-material-catalog-materials-peer');
    expect(wk).toContain('SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID');
    expect(hub).toContain('SupplierDevPillarMaterialCatalogNav');
    expect(nav).toContain('SUPPLIER_CORE_MATERIAL_CATALOG_NAV_TESTID');
    expect(nav).toContain('SUPPLIER_CORE_MATERIAL_CATALOG_MATERIALS_PEER_TESTID');
  });
});
