import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * Wave ZD — hub navigation dead-end href fixes (YQ matrix + cross-role + distributor nav).
 * SoT for core-245-wave-zd-links.spec.ts + unit contract tests.
 */
import { ROUTES } from '@/lib/routes';
import { brandLinesheetsHrefForDemo, PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import {
  WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS,
  WAVE_YQ_HUB_MATRIX_CELLS,
} from '@/lib/platform/wave-yq-hub-matrix-5x4';
import {
  SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID,
  shopEmpty27MatrixSeedHref,
} from '@/lib/b2b/shop-sc-empty27-buyer-profile-wave-ym';

export const WAVE_ZD_COLLECTION_ID = 'SS27';
export const WAVE_ZD_CORE_E2E_SPEC = 'core-245-wave-zd-links.spec.ts' as const;
/** Legacy alias — core-245-wave-zd-dead-end.spec.ts spot checks. */
export const WAVE_ZD_E2E_SPEC = 'core-245-wave-zd-dead-end.spec.ts' as const;

export type WaveZdDeadEndLinkFix = {
  id: string;
  role?: string;
  pillar?: string;
  was: string;
  now?: string;
  testids: readonly string[];
  sourceFile: string;
  sourceMustContain: readonly string[];
  sourceMustNotContain?: readonly string[];
};

/** Twelve closed dead-end href fixes (S1 hub smoke + YQ peers + distributor nav). */
export const WAVE_ZD_DEAD_END_LINK_FIXES: readonly WaveZdDeadEndLinkFix[] = [
  {
    id: 'sup-forecast-procurement-href',
    role: 'supplier',
    pillar: 'collection_order',
    was: 'shopB2bOrderHref(activeOrderId) — cross-role dead-end для supplier',
    now: 'factoryMaterialsProcurementHrefForDemo',
    testids: ['supplier-forecast-b2b-order-link', 'supplier-collection-order-forecast'],
    sourceFile: 'components/platform/empty-cells/supplier-collection-order-forecast-panel.tsx',
    sourceMustContain: [
      'factoryMaterialsProcurementHrefForDemo',
      'supplier-forecast-b2b-order-link',
    ],
    sourceMustNotContain: ['shopB2bOrderHref('],
  },
  {
    id: 'shop-empty27-matrix-seed-href',
    role: 'shop',
    pillar: 'sample_collection',
    was: 'EMPTY27 matrix CTA без collection=SS27 — тупик на пустую матрицу',
    now: 'shopEmpty27MatrixSeedHref → SS27 seed',
    testids: [SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID, 'shop-sc-empty27-onboarding-strip'],
    sourceFile: 'components/shop/b2b/ShopScEmpty27OnboardingStrip.tsx',
    sourceMustContain: ['shopEmpty27MatrixSeedHref', 'SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID'],
    sourceMustNotContain: ['collection=EMPTY27'],
  },
  {
    id: 'shop-empty27-greenfield-api',
    role: 'shop',
    pillar: 'sample_collection',
    was: 'Greenfield onboarding без PG API — dead-end copy only',
    now: 'shopEmpty27GreenfieldOnboardingApiPath',
    testids: ['shop-sc-empty27-onboarding-greenfield', 'shop-sc-empty27-onboarding-pg'],
    sourceFile: 'lib/b2b/shop-sc-empty27-buyer-profile-wave-ym.ts',
    sourceMustContain: ['shopEmpty27GreenfieldOnboardingApiPath', 'shop-sc-empty27-onboarding-pg'],
  },
  {
    id: 'hub-cross-role-peer-helper',
    role: 'brand',
    pillar: 'order_production',
    was: 'Peer href без viewer context → factory handoff dead-end',
    now: 'getCrossRolePeerDemoHrefForDemo viewer-aware',
    testids: ['platform-core-hub-matrix'],
    sourceFile: 'lib/platform-core-hub-matrix.ts',
    sourceMustContain: ['getCrossRolePeerDemoHrefForDemo', 'без dead-end'],
  },
  {
    id: 'sup-empty-co-handoff-peer',
    role: 'supplier',
    pillar: 'collection_order',
    was: 'Expected PO strip без handoff queue link',
    now: 'factoryHandoffQueueHrefForDemo peer',
    testids: ['sup-empty-co-expected-po-handoff-link', 'sup-empty-co-expected-po-date-strip'],
    sourceFile: 'components/platform/empty-cells/SupEmptyCoExpectedPoDateStrip.tsx',
    sourceMustContain: ['handoffHref', 'sup-empty-co-expected-po-handoff-link'],
  },
  {
    id: 'mfr-empty-co-handoff-count',
    role: 'manufacturer',
    pillar: 'collection_order',
    was: 'Handoff count panel без peer strip → brand checkout dead-end',
    now: 'MfrEmptyCoPeerStrip handoff spine',
    testids: ['mfr-empty-co-peer-strip'],
    sourceFile: 'components/platform/empty-cells/MfrEmptyCoPeerStrip.tsx',
    sourceMustContain: ['mfr-empty-co-peer-strip', 'handoff'],
  },
  {
    id: 'brand-sc-mini-linesheet-golden-path',
    role: 'brand',
    pillar: 'sample_collection',
    was: 'ROUTES.brand.linesheet (/brand/merch/linesheet) — вне hub SC golden path',
    now: 'brandLinesheetsHrefForDemo → /brand/linesheets?collection=',
    testids: ['brand-sc-cabinet-error-linesheet-link'],
    sourceFile: 'components/platform/BrandSampleCollectionMini.tsx',
    sourceMustContain: ['brandLinesheetsHrefForDemo', 'brand-sc-cabinet-error-linesheet-link'],
    sourceMustNotContain: ['ROUTES.brand.linesheet'],
  },
  {
    id: 'mfr-empty-sc-linesheet-fallback',
    role: 'manufacturer',
    pillar: 'sample_collection',
    was: 'Fallback linesheet → merch/linesheet dead-end',
    now: 'brandLinesheetsHrefForDemo(demo) when status.linesheetHref absent',
    testids: ['mfr-empty-sc-brand-linesheet', 'mfr-empty-sc-brand-linesheet-link'],
    sourceFile: 'components/platform/empty-cells/manufacturer-sample-collection-status-panel.tsx',
    sourceMustContain: ['brandLinesheetsHrefForDemo(demo)', '-brand-linesheet'],
    sourceMustNotContain: ['ROUTES.brand.linesheet'],
  },
  {
    id: 'distributor-partners-marketplace-discover',
    was: 'LEGACY_ROUTES.shop.b2bDiscover legacy tail (/shop/b2b/discover)',
    now: 'ROUTES.shop.b2bPartnersDiscover — hub matrix SC canonical',
    testids: ['distributor-nav-partners-marketplace'],
    sourceFile: 'lib/data/distributor-navigation.ts',
    sourceMustContain: ["value: 'marketplace'", 'ROUTES.shop.b2bPartnersDiscover'],
    sourceMustNotContain: [
      "{ href: LEGACY_ROUTES.shop.b2bDiscover, label: 'Подбор брендов', value: 'marketplace' }",
    ],
  },
  {
    id: 'distributor-comms-b2b-calendar',
    was: 'ROUTES.shop.calendar — retail calendar в B2B distributor nav',
    now: 'ROUTES.shop.b2bCalendar — golden path comms',
    testids: ['distributor-nav-comms-calendar'],
    sourceFile: 'lib/data/distributor-navigation.ts',
    sourceMustContain: ['ROUTES.shop.b2bCalendar'],
    sourceMustNotContain: ['href: ROUTES.shop.calendar'],
  },
  {
    id: 'distributor-order-mode-matrix',
    was: 'LEGACY_ROUTES.shop.b2bOrderMode legacy redirect tail',
    now: 'ROUTES.shop.b2bMatrix — matrix golden path',
    testids: ['distributor-nav-order-mode'],
    sourceFile: 'lib/data/distributor-navigation.ts',
    sourceMustContain: ["value: 'order-mode'", 'ROUTES.shop.b2bMatrix'],
    sourceMustNotContain: ['LEGACY_ROUTES.shop.b2bOrderMode'],
  },
  {
    id: 'distributor-order-drafts-registry',
    was: 'LEGACY_ROUTES.shop.b2bOrderDrafts legacy redirect tail',
    now: 'ROUTES.shop.b2bOrders — orders registry golden path',
    testids: ['distributor-nav-order-drafts'],
    sourceFile: 'lib/data/distributor-navigation.ts',
    sourceMustContain: ["value: 'order-drafts'", 'ROUTES.shop.b2bOrders'],
    sourceMustNotContain: ['LEGACY_ROUTES.shop.b2bOrderDrafts'],
  },
] as const;

export const WAVE_ZD_LINKS_FIXED_COUNT = WAVE_ZD_DEAD_END_LINK_FIXES.length;

const CANONICAL_LINESHEET_PREFIX = '/brand/linesheets';

/** Wave YQ active workspace hrefs must not point at known dead-end path prefixes. */
export function scanWaveYqMatrixHrefDeadEnds(cells = WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS): string[] {
  const dead: string[] = [];
  const blocked = [
    '/404',
    '/brand/merch/linesheet',
    LEGACY_ROUTES.shop.b2bDiscover,
    LEGACY_ROUTES.shop.b2bOrderMode,
    LEGACY_ROUTES.shop.b2bOrderDrafts,
  ];
  for (const cell of cells) {
    const href = cell.workspaceHref.split('#')[0] ?? cell.workspaceHref;
    for (const prefix of blocked) {
      if (href === prefix || href.startsWith(`${prefix}?`)) {
        dead.push(`${cell.id}:workspace:${prefix}`);
      }
    }
    if (href.includes('undefined') || href.includes('null')) {
      dead.push(`${cell.id}:workspace:invalid-token`);
    }
  }
  return dead;
}

export function waveZdBrandLinesheetsHref(collectionId = WAVE_ZD_COLLECTION_ID): string {
  return brandLinesheetsHrefForDemo({ ...PLATFORM_CORE_DEMO, collectionId });
}

export function waveZdBrandLinesheetsHrefMatchesGolden(
  collectionId = WAVE_ZD_COLLECTION_ID
): boolean {
  const href = waveZdBrandLinesheetsHref(collectionId);
  return href.startsWith(CANONICAL_LINESHEET_PREFIX) && href.includes(`collection=${collectionId}`);
}

export function waveZdShopEmpty27MatrixSeedHref(): string {
  return shopEmpty27MatrixSeedHref({ buyerId: 'B2B-DEMO-SHOP1' });
}

export function waveZdCoreE2eSpecGlob(basename = WAVE_ZD_CORE_E2E_SPEC): string {
  return `**/${basename}`;
}

export function waveZdYqMatrixCellCount(): number {
  return WAVE_YQ_HUB_MATRIX_CELLS.length;
}
