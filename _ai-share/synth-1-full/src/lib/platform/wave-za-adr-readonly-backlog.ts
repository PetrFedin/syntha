/**
 * Wave ZA — intentional read-only empty-cell anchors (ADR-003 backlog).
 * Five peer-insight cells without checkout/write UI — core-242 e2e closure.
 */
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID,
  MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID,
} from '@/lib/platform/wave-yv-mfr-empty-pillars-final';

export const WAVE_ZA_ADR_ID = 'ADR-003' as const;

export const WAVE_ZA_ADR_DOC = 'docs/platform-core/ADR-003-readonly-empty-cells.md' as const;

export const WAVE_ZA_E2E_SPEC = 'core-242-wave-za-adr.spec.ts' as const;

export type WaveZaAdrReadonlyBacklogItem = {
  id: string;
  role: CoreChainRoleId;
  pillar: CoreHubPillarId;
  sectionId: string;
  adrRef: typeof WAVE_ZA_ADR_ID;
  wasBad: string;
  testids: readonly string[];
  sourceFile?: string;
  sourceMustContain?: readonly string[];
};

export const WAVE_ZA_ADR_READONLY_BACKLOG: readonly WaveZaAdrReadonlyBacklogItem[] = [
  {
    id: 'za-shop-empty-dev-status',
    role: 'shop',
    pillar: 'development',
    sectionId: 'shop-empty-dev-status',
    adrRef: WAVE_ZA_ADR_ID,
    wasBad: 'Read-only — нет редактирования ТЗ и W2 editor в empty development cell',
    testids: ['shop-development-bridge'],
    sourceFile: 'components/platform/empty-cells/shop-development-bridge-panel.tsx',
    sourceMustContain: ['shop-development-bridge'],
  },
  {
    id: 'za-mfr-empty-sc-status',
    role: 'manufacturer',
    pillar: 'sample_collection',
    sectionId: 'mfr-empty-sc-status',
    adrRef: WAVE_ZA_ADR_ID,
    wasBad: 'Read-only publish status panel — без B2B checkout UI в empty SC cell',
    testids: [MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID, 'manufacturer-sample-collection-pg-table'],
    sourceFile: 'components/platform/empty-cells/manufacturer-sample-collection-status-panel.tsx',
    sourceMustContain: [
      'MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID',
      'manufacturer-sample-collection-pg-table',
    ],
  },
  {
    id: 'za-mfr-empty-co-po',
    role: 'manufacturer',
    pillar: 'collection_order',
    sectionId: 'mfr-empty-co-po',
    adrRef: WAVE_ZA_ADR_ID,
    wasBad: 'Read-only handoff count panel — без shop-co-checkout в empty CO cell',
    testids: [MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID, 'manufacturer-po-expectation'],
    sourceFile: 'components/platform/empty-cells/manufacturer-po-expectation-panel.tsx',
    sourceMustContain: ['MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID'],
  },
  {
    id: 'za-sup-empty-sc-bom',
    role: 'supplier',
    pillar: 'sample_collection',
    sectionId: 'sup-empty-sc-bom',
    adrRef: WAVE_ZA_ADR_ID,
    wasBad: 'Read-only BOM preview mini — без write procurement wizard в empty SC cell',
    testids: ['supplier-bom-preview-mini'],
    sourceFile: 'components/platform/SupplierBomPreview.tsx',
    sourceMustContain: ['supplier-bom-preview-mini'],
  },
  {
    id: 'za-sup-empty-co-forecast',
    role: 'supplier',
    pillar: 'collection_order',
    sectionId: 'sup-empty-co-forecast',
    adrRef: WAVE_ZA_ADR_ID,
    wasBad: 'Read-only collection-order forecast — без checkout UI в empty CO cell',
    testids: ['supplier-collection-order-forecast'],
    sourceFile: 'components/platform/empty-cells/supplier-collection-order-forecast-panel.tsx',
    sourceMustContain: ['supplier-collection-order-forecast'],
  },
] as const;

/** Maps intentional read-only gaps to ADR-prefixed backlog strings (not audit bad). */
export function waveZaAdrBacklogForSection(sectionId: string): readonly string[] {
  return WAVE_ZA_ADR_READONLY_BACKLOG.filter((item) => item.sectionId === sectionId).map(
    (item) => `${WAVE_ZA_ADR_ID}: ${item.wasBad}`
  );
}
