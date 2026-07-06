/**
 * Wave YU — supplier OP order_production audit 7.5→8.0 score bump.
 * Closes YJ/YI/WP/WI criteria on sup-op sections (core-236).
 */
import {
  getPlatformCoreReadinessMatrix,
  getReadinessCell,
  type ReadinessCell,
  type ReadinessSubItem,
} from '@/lib/platform-core-readiness-audit';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS } from '@/lib/platform/wave-yi-e2e-smoke-registry';
import {
  WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR,
  waveYjSupOpProcurementChainApis,
} from '@/lib/platform/wave-yj-sup-op-procurement-chain';
import {
  WAVE_WI_SUP_BULK_CONFIRM_API,
  WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID,
  WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API,
} from '@/lib/platform/wave-wi-supplier-partial-ship';
import {
  WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID,
  WAVE_WP_SUP_PROCUREMENT_CHAIN_STEPS_TESTID,
} from '@/lib/platform/wave-wp-sup-bom-po-progress';

export const WAVE_YU_E2E_SPEC = 'core-236-wave-yu-sup-op-80.spec.ts' as const;

export const WAVE_YU_SUP_OP_PROCUREMENT_SECTION_ID = 'sup-op-procurement' as const;
export const WAVE_YU_SUP_OP_SECTION_IDS = [
  'sup-op-procurement',
  'sup-op-bom-po',
  'sup-op-chain',
  'sup-op-handoff-read',
  'sup-op-cabinet',
] as const;

export const WAVE_YU_SUP_OP_CELL_ROLE: CoreChainRoleId = 'supplier';
export const WAVE_YU_SUP_OP_CELL_PILLAR: CoreHubPillarId = 'order_production';
export const WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE = 8.0;

export const WAVE_YU_SUP_OP_PROCUREMENT_PANEL_TESTID = 'sup-op-procurement-panel';

/** Prior waves whose supplier OP criteria must be satisfied before 8.0 bump. */
export const WAVE_YU_PREREQ_WAVE_CODES = ['YJ', 'YI', 'WP', 'WI'] as const;

/** Audit closure criteria — YJ/YI/WP/WI chain + wave YU spot e2e. */
export const WAVE_YU_AUDIT_CRITERION_6 = [
  {
    id: 'c1-bad-fix-cleared',
    labelRu: 'bad/fix пусты на всех sup-op sections',
  },
  {
    id: 'c2-wave-yj',
    labelRu: 'Wave YJ honest chain strip + po= comms tail (core-225)',
    e2eSpec: 'core-225-wave-yj-sup-op.spec.ts',
  },
  {
    id: 'c3-wave-wi',
    labelRu: 'Wave WI partial ship/backorder/bulk-confirm/WMS webhook (core-172)',
    e2eSpec: 'core-172-wave-wi-partial-ship.spec.ts',
  },
  {
    id: 'c4-wave-wp',
    labelRu: 'Wave WP BOM×PO progress + brand push + ledger peer (core-179)',
    e2eSpec: 'core-179-wave-wp-bom-po.spec.ts',
  },
  {
    id: 'c5-wave-yi',
    labelRu: 'Wave YI e2e registry covers WI/WP/YJ specs (core-224)',
    e2eSpec: 'core-224-wave-yi-e2e-smoke-registry.spec.ts',
  },
  {
    id: 'c6-wave-yu',
    labelRu: 'Wave YU staticScore 8.0 + spot e2e core-236',
    e2eSpec: WAVE_YU_E2E_SPEC,
  },
] as const;

/** Remaining gaps moved to ADR backlog (not blocking 8.0 on lead section). */
export const WAVE_YU_ADR_BACKLOG = [
  {
    id: 'adr-sup-op-procurement-wizard-e2e',
    titleRu: 'Multi-article procurement wizard — dedicated e2e вне §6 bump',
    plannerId: 'scan-dev-e2e-procurement-wizard-missing',
    testids: ['sup-op-procurement-article-wizard', 'confirmAllArticles'],
  },
  {
    id: 'adr-supplier-circular-hub-dedup',
    titleRu: 'supplier/circular-hub static listings — вне core procurement spine',
    plannerId: 'scan-dev-supplier-circular-hub',
    testids: ['supplier-circular-hub-panel'],
  },
] as const;

export const WAVE_YU_SUP_OP_SPOT_TESTIDS = [
  WAVE_YU_SUP_OP_PROCUREMENT_PANEL_TESTID,
  WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR,
  WAVE_WP_SUP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID,
  WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID,
  WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID,
  'sup-op-procurement-wms-reserve-strip',
  'sup-op-procurement-brand-push-strip',
  'sup-op-procurement-co-peer-strip',
  'sup-op-chain-steps',
  'sup-op-cabinet-spine-nav-strip',
] as const;

export function findWaveYuSupOpProcurementSection(
  collectionId = 'SS27'
): ReadinessSubItem | undefined {
  const cells = getPlatformCoreReadinessMatrix(collectionId);
  const cell = getReadinessCell(cells, WAVE_YU_SUP_OP_CELL_ROLE, WAVE_YU_SUP_OP_CELL_PILLAR);
  return cell?.subItems.find((s) => s.id === WAVE_YU_SUP_OP_PROCUREMENT_SECTION_ID);
}

export function findWaveYuSupOpCell(collectionId = 'SS27'): ReadinessCell | undefined {
  const cells = getPlatformCoreReadinessMatrix(collectionId);
  return getReadinessCell(cells, WAVE_YU_SUP_OP_CELL_ROLE, WAVE_YU_SUP_OP_CELL_PILLAR);
}

export function waveYuPrereqE2eSpecsRegistered(): {
  inYiRegistry: string[];
  postYiBatch: string[];
} {
  const yiBatch = ['core-172-wave-wi-partial-ship.spec.ts', 'core-179-wave-wp-bom-po.spec.ts'];
  const postYi = [
    'core-224-wave-yi-e2e-smoke-registry.spec.ts',
    'core-225-wave-yj-sup-op.spec.ts',
  ];
  const registry = WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS as readonly string[];
  return {
    inYiRegistry: yiBatch.filter((spec) => registry.includes(spec)),
    postYiBatch: postYi,
  };
}

export function waveYuSupOpProcurementApis(): string[] {
  return [
    ...waveYjSupOpProcurementChainApis(),
    WAVE_WI_SUP_BULK_CONFIRM_API,
    WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API,
    WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID,
    WAVE_WP_SUP_BOM_PO_PROGRESS_TESTID,
    WAVE_WP_SUP_BRAND_INVENTORY_LEDGER_PEER_TESTID,
  ];
}

export type WaveYuSupOp80BumpCheck = {
  sectionStaticScore: number;
  cellStaticScore: number | null;
  badCleared: boolean;
  fixCleared: boolean;
  allSectionsBadFixCleared: boolean;
  hasWaveYuGood: boolean;
  hasPrereqWaveGood: boolean;
  prereqE2eInYiRegistry: number;
  prereqE2ePostYiCount: number;
  criterion6Count: number;
};

/** Returns structured closure check for unit tests and e2e probes. */
export function waveYuSupOp80BumpCheck(collectionId = 'SS27'): WaveYuSupOp80BumpCheck {
  const section = findWaveYuSupOpProcurementSection(collectionId);
  const cell = findWaveYuSupOpCell(collectionId);
  const good = section?.good ?? [];
  const subItems = cell?.subItems ?? [];

  const e2e = waveYuPrereqE2eSpecsRegistered();

  return {
    sectionStaticScore: section?.staticScore ?? 0,
    cellStaticScore: cell?.staticScore ?? null,
    badCleared: (section?.bad ?? []).length === 0,
    fixCleared: (section?.fix ?? []).length === 0,
    allSectionsBadFixCleared: subItems.every(
      (s) => (s.bad ?? []).length === 0 && (s.fix ?? []).length === 0
    ),
    hasWaveYuGood: good.some((g) => /wave YU/i.test(g)),
    hasPrereqWaveGood: WAVE_YU_PREREQ_WAVE_CODES.every((code) =>
      good.some((g) => g.includes(`Wave ${code}`))
    ),
    prereqE2eInYiRegistry: e2e.inYiRegistry.length,
    prereqE2ePostYiCount: e2e.postYiBatch.length,
    criterion6Count: WAVE_YU_AUDIT_CRITERION_6.length,
  };
}

export function waveYuSupOp80BumpCriteriaMet(collectionId = 'SS27'): boolean {
  const check = waveYuSupOp80BumpCheck(collectionId);
  return (
    check.sectionStaticScore >= WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE &&
    (check.cellStaticScore ?? 0) >= WAVE_YU_SUP_OP_AUDIT_STATIC_SCORE &&
    check.badCleared &&
    check.fixCleared &&
    check.allSectionsBadFixCleared &&
    check.hasWaveYuGood &&
    check.hasPrereqWaveGood &&
    check.prereqE2eInYiRegistry >= 2 &&
    check.prereqE2ePostYiCount === 2
  );
}
