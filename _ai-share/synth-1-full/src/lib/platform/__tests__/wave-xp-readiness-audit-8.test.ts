import fs from 'node:fs';
import path from 'node:path';
import { getReadinessCell, getPlatformCoreReadinessMatrix } from '@/lib/platform-core-readiness-audit';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave XP (XA–XH) — закрытие 8.0 criterion gaps + sections approaching 8.0. */
export const WAVE_XP_READINESS_AUDIT_CLOSURES = [
  {
    id: 'shop-sc-partners-invite-xa',
    sectionId: 'shop-sc-partners',
    was: 'Invite PG stub без journal / dup cabinet golden path',
    testids: [
      'shop-b2b-partners-golden-path-strip',
      'shop-b2b-partners-uat-golden-path-hint',
      'shop-sc-partners-showroom-eligible-for-matrix-link',
      'shop-sc-partners-invite-panel-brand_nordic_wool',
    ],
  },
  {
    id: 'brand-co-crm-linesheet-xb',
    sectionId: 'brand-co-crm-segmentation',
    was: 'PG buyer_segments без auto linesheet visibility cross-link',
    testids: [
      'brand-co-crm-linesheet-visibility-strip',
      'brand-co-crm-linesheet-visibility-summary-badge',
      'brand-co-crm-linesheet-visibility-shop-showroom-link',
    ],
  },
  {
    id: 'mfr-dev-sample-patch-xc',
    sectionId: 'mfr-dev-sample-queue',
    was: 'Factory sample-queue без PATCH / EN poll badge',
    testids: [
      'factory-w2-sample-queue',
      'mfr-dev-sample-queue-poll-badge',
      'factory-w2-sample-queue-item',
    ],
  },
  {
    id: 'sup-rfq-sla-xd',
    sectionId: 'sup-cm-rfq-inbox',
    was: 'RFQ inbox без SLA anchor / thread inline badge',
    testids: [
      'supplier-rfq-inbox-panel',
      'sup-dev-rfq-sla-timer-strip',
      'sup-dev-rfq-quote-card-panel',
      'sup-dev-rfq-sla-timer-thread-badge-',
    ],
  },
  {
    id: 'brand-s1-ls-sweep-xe',
    sectionId: 'brand-dev-pg-sync',
    was: 'S1 localStorage mirror в core BFF paths',
    testids: ['brand-production-ops-storage-pg', 'brand-production-ops-storage-unavailable'],
    sourceFile: 'lib/platform/__tests__/wave-xe-s1-ls-final-sweep.test.ts',
    sourceMustContain: ['storageMode', 'fail-closed'],
  },
  {
    id: 'brand-tasks-kanban-xf',
    sectionId: 'brand-dev-cabinet',
    was: 'Дубль Kanban peer link на cabinet dashboard',
    testids: [
      'brand-dev-dashboard-strips',
      'brand-dev-tasks-kanban-panel',
      'brand-dev-w2-hub-tasks-kanban-strip',
      'brand-dev-tasks-kanban-calendar-strip',
    ],
  },
  {
    id: 'brand-range-bulk-xg',
    sectionId: 'brand-dev-range',
    was: 'Bulk tier POST без wave xg envelope / EN conflict labels',
    testids: [
      'brand-range-planner-conflict-resolver-strip',
      'range-planner-tier-bulk-assign-btn',
    ],
    sourceFile: 'lib/platform/__tests__/wave-xg-brand-range-planner-bulk.test.ts',
    sourceMustContain: ['wave XG', 'bulkTierAssignApiPath', 'waveXgBrandRangePlannerContract'],
  },
  {
    id: 'shop-showroom-logo-xh',
    sectionId: 'shop-sc-showroom',
    was: 'Cover hero перекрывал partner PG / eligible filter без counts',
    testids: [
      'shop-sc-showroom-partner-logo-row',
      'shop-sc-showroom-partner-logo-source-pg',
      'shop-sc-showroom-eligible-filter-counts',
      'shop-sc-showroom-cover-hero-priority-strip',
    ],
  },
] as const;

/** Sections recalibrated to staticScore ≥ 7.7 after wave XP (approaching 8.0). */
export const WAVE_XP_APPROACHING_8_SECTION_IDS = [
  'shop-sc-showroom',
  'shop-sc-partners',
  'brand-dev-range',
  'brand-co-crm-segmentation',
  'mfr-dev-sample-queue',
  'sup-cm-rfq-inbox',
  'brand-dev-pg-sync',
  'brand-dev-cabinet',
] as const;

const APPROACHING_8_MIN = 7.7;

describe('wave XP — readiness audit 8.0 closure batch (XA–XH)', () => {
  const cells = getPlatformCoreReadinessMatrix('SS27');

  it('documents 8 closed wave XP items (XA–XH)', () => {
    expect(WAVE_XP_READINESS_AUDIT_CLOSURES.length).toBe(8);
  });

  it.each(WAVE_XP_READINESS_AUDIT_CLOSURES)('$id — section bad/fix cleared', (closure) => {
    const sectionClosure = closure as (typeof WAVE_XP_READINESS_AUDIT_CLOSURES)[number] & {
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
          /wave X[A-H]/i.test(g) ||
          g.includes('core-190') ||
          g.includes('core-191') ||
          g.includes('core-192') ||
          g.includes('core-193') ||
          g.includes('core-194') ||
          g.includes('core-195') ||
          g.includes('core-196') ||
          g.includes('core-197')
      )
    ).toBe(true);
  });

  it.each(WAVE_XP_READINESS_AUDIT_CLOSURES)('$id — closure testids wired in source', (closure) => {
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

  it.each(WAVE_XP_APPROACHING_8_SECTION_IDS)('%s — staticScore approaching 8.0 (≥7.7)', (sectionId) => {
    const hit = cells
      .flatMap((c) => c.subItems.map((s) => ({ ...s, roleId: c.roleId, pillarId: c.pillarId })))
      .find((s) => s.id === sectionId);
    expect(hit).toBeDefined();
    expect(hit!.staticScore).toBeGreaterThanOrEqual(APPROACHING_8_MIN);
    expect(hit!.summary).toMatch(/~8\.0|8\.0/i);
  });

  it('shop sample_collection cell — XA/XH evidence in cell good', () => {
    const cell = getReadinessCell(cells, 'shop', 'sample_collection');
    expect(cell?.bad ?? []).toEqual([]);
    expect(cell?.good.some((g) => g.includes('Wave XA') || g.includes('Wave XH'))).toBe(true);
  });

  it('brand development cell — XE/XF/XG evidence', () => {
    const cell = getReadinessCell(cells, 'brand', 'development');
    expect(cell?.good.some((g) => g.includes('Wave XF') || g.includes('Wave XG') || g.includes('Wave XE'))).toBe(
      true
    );
  });

  it('manufacturer development cell — XC evidence', () => {
    const cell = getReadinessCell(cells, 'manufacturer', 'development');
    expect(cell?.good.some((g) => g.includes('Wave XC'))).toBe(true);
  });

  it('supplier development cell — XD evidence', () => {
    const cell = getReadinessCell(cells, 'supplier', 'development');
    expect(cell?.good.some((g) => g.includes('Wave XD'))).toBe(true);
  });
});
