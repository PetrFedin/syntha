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

/** Wave VZ — финальное закрытие bad/fix после VL–VS + VP S1 sweep. */
export const WAVE_VZ_READINESS_AUDIT_CLOSURES = [
  {
    id: 'mfr-dev-dossier-readonly-peer',
    sectionId: 'mfr-dev-dossier',
    was: 'Цех не редактирует состав / comment peer',
    testids: ['mfr-dev-dossier-comment-peer-strip', 'mfr-dev-dossier-panel'],
  },
  {
    id: 'mfr-op-handoff-bulk-ack-sot',
    sectionId: 'mfr-op-handoff-queue',
    was: 'Дубль bulk-ack с реестром /orders',
    testids: ['mfr-op-handoff-queue-registry-sot-strip', 'mfr-op-handoff-queue-registry-sot-link'],
  },
  {
    id: 'mfr-dev-dam-attach-vl',
    cell: { role: 'manufacturer' as const, pillar: 'development' as const },
    was: 'DAM attach на образце',
    testids: ['mfr-dev-sample-photo-dam-stub-strip'],
  },
  {
    id: 'brand-release-gate-vm',
    sectionId: 'brand-dev-material-passport',
    was: 'Schema↔passport peer + release gate',
    testids: [
      'brand-dev-schema-passport-peer-strip',
      'brand-material-passport-release-sc-gate-message',
    ],
  },
  {
    id: 'shop-greenfield-vn',
    sectionId: 'shop-co-cabinet',
    was: 'Shop2 greenfield CO registry',
    testids: ['shop-co-greenfield-registry-strip', 'shop-co-cabinet-brand-pricelist-link'],
  },
  {
    id: 'shop-dev-bridge-readonly-vz',
    was: 'Read-only shop development bridge',
    testids: ['shop-development-bridge', 'shop-development-bridge-dossier-preview-dialog'],
    sourceFile: 'lib/platform-core-readiness-sections/shop-audit.ts',
    sourceMustContain: ["id: 'shop-dev-bridge'", 'Wave VZ: read-only bridge', 'bad: []'],
  },
  {
    id: 'sup-logistics-vo',
    sectionId: 'sup-cm-calendar',
    was: 'RU ETA/map logistics peer',
    testids: ['sup-cm-logistics-eta-strip', 'sup-cm-calendar-logistics-peer-strip'],
  },
  {
    id: 'brand-op-chain-vq',
    sectionId: 'brand-op-registry',
    was: 'SSE dedup strip на registry',
    testids: ['brand-op-registry-sse-dedup-strip', 'brand-op-chain-sse-dedup-badge'],
  },
  {
    id: 'brand-co-otb-vr',
    sectionId: 'brand-co-cabinet',
    was: 'OTB × CRM × tier sync',
    testids: ['brand-co-otb-replenishment-sync-strip', 'brand-co-crm-linesheet-visibility-strip'],
  },
  {
    id: 'mfr-empty-pillars-vs',
    sectionId: 'mfr-dev-status',
    was: 'Empty SC/CO peer strips',
    testids: [
      'mfr-empty-sc-peer-strip',
      'mfr-empty-co-peer-strip',
      'mfr-empty-publish-status-badge',
    ],
  },
  {
    id: 's1-ls-sweep-vp',
    was: 'S1 localStorage final sweep fail-closed',
    testids: ['workshop2-core-readpath-local-banner'],
    sourceFile: 'lib/production/workshop2-pg-read-path-policy.ts',
    sourceMustContain: [
      'isWorkshop2CorePgReadPathOnly',
      'shouldUseLocalStorageClientFallbackInCore',
    ],
  },
  {
    id: 'pillar-co-checkout-ru-vz',
    was: 'EN checkout label в hub CO pillar card',
    testids: ['brand-pillar-to-shop-checkout'],
    sourceFile: 'components/platform/CollectionOrderPillarCard.tsx',
    sourceMustContain: ['UAT · оформление', 'оформление от магазина'],
    sourceMustNotContain: ['UAT checkout', 'ждите checkout'],
  },
] as const;

describe('wave VZ — readiness audit closure', () => {
  const cells = getPlatformCoreReadinessMatrix('SS27');

  it('documents 10–12 closed VL–VS + VP items', () => {
    expect(WAVE_VZ_READINESS_AUDIT_CLOSURES.length).toBeGreaterThanOrEqual(10);
    expect(WAVE_VZ_READINESS_AUDIT_CLOSURES.length).toBeLessThanOrEqual(14);
  });

  it.each(WAVE_VZ_READINESS_AUDIT_CLOSURES.filter((c) => 'cell' in c && c.cell))(
    '$id — cell bad/fix cleared',
    (closure) => {
      const cell = getReadinessCell(cells, closure.cell!.role, closure.cell!.pillar);
      expect(cell?.bad ?? []).toEqual([]);
      expect(cell?.fix ?? []).toEqual([]);
      expect(
        cell?.good.some(
          (g) =>
            g.includes('wave VZ') ||
            g.includes('Wave VZ') ||
            g.includes('Wave VL') ||
            g.includes('wave VL') ||
            g.includes('Wave VS')
        )
      ).toBe(true);
    }
  );

  it.each(WAVE_VZ_READINESS_AUDIT_CLOSURES.filter((c) => 'sectionId' in c && c.sectionId))(
    '$id — section bad/fix cleared',
    (closure) => {
      const sectionClosure = closure as (typeof WAVE_VZ_READINESS_AUDIT_CLOSURES)[number] & {
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

  it.each(WAVE_VZ_READINESS_AUDIT_CLOSURES)('$id — closure testids wired in source', (closure) => {
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

  it('supplier comms cell — chain push fix cleared (wave VK)', () => {
    const cell = getReadinessCell(cells, 'supplier', 'comms');
    expect(cell?.fix ?? []).toEqual([]);
    expect(cell?.good.some((g) => g.includes('Wave VK') || g.includes('chain-status push'))).toBe(
      true
    );
  });
});
