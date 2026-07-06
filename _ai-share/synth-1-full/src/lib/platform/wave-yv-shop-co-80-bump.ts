/**
 * Wave YV — shop CO 7.6→8.0 final audit: YK golden path + XT draft + WM collaborative + XL working-order + WG replenishment.
 * SoT for core-237 e2e + unit contract tests.
 */
import {
  SHOP_CO_GOLDEN_PATH_STEPS,
  WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID,
} from '@/lib/platform/wave-yk-shop-co-golden-path';

export const WAVE_YV_E2E_SPEC = 'core-237-wave-yv-shop-co-80.spec.ts' as const;

export const WAVE_YV_SHOP_CO_CELL_ROLE = 'shop' as const;
export const WAVE_YV_SHOP_CO_CELL_PILLAR = 'collection_order' as const;

/** Sections meeting YK / XT / WM / XL / WG closure criteria — bumped to 8.0 static/live. */
export const WAVE_YV_SHOP_CO_SECTION_IDS_80 = [
  'shop-co-matrix',
  'shop-co-checkout',
  'shop-co-registry',
  'shop-co-detail',
  'shop-co-buyer-tracking',
  'shop-co-cabinet',
  'shop-co-replenishment',
  'shop-co-collaborative-order',
  'shop-co-working-order',
] as const;

export const WAVE_YV_SHOP_CO_CELL_SCORE_MIN = 8.0;

/** Wave YV golden-path dedup — CO spine strip + feature-local strips without matrix/checkout dup. */
export const WAVE_YV_SHOP_CO_GOLDEN_PATH_DEDUP = [
  {
    id: 'replenishment-co-spine-only',
    file: 'app/shop/b2b/replenishment/page.tsx',
    mustContain: ['ShopCoGoldenPathStrip', 'ShopReplenishmentGoldenPathStrip'],
    mustNotContain: ['ShopWholesaleMatrixGoldenPathStrip'],
  },
  {
    id: 'replenishment-feature-strip-trimmed',
    file: 'components/shop/b2b/ShopReplenishmentGoldenPathStrip.tsx',
    mustContain: ['shop-replenishment-golden-path-strip', 'stock-atp', 'supplier-forecast'],
    mustNotContain: ["{ id: 'matrix', label: 'Матрица' }", "{ id: 'checkout', label: 'Оформление' }"],
  },
  {
    id: 'collaborative-co-spine',
    file: 'app/shop/b2b/collaborative-order/page.tsx',
    mustContain: ['ShopCoGoldenPathStrip', 'ShopCollaborativeOrderGoldenPathStrip'],
  },
  {
    id: 'collaborative-feature-strip-trimmed',
    file: 'components/shop/b2b/ShopCollaborativeOrderGoldenPathStrip.tsx',
    mustContain: ['session', 'approvals', 'comms'],
    mustNotContain: ["{ id: 'matrix', label: 'Матрица' }", "{ id: 'tracking', label: 'Трекинг' }"],
  },
  {
    id: 'working-order-co-spine',
    file: 'app/shop/b2b/working-order/working-order-core.tsx',
    mustContain: ['ShopCoGoldenPathStrip', 'ShopWorkingOrderGoldenPathStrip'],
  },
  {
    id: 'working-order-feature-strip-trimmed',
    file: 'components/shop/b2b/ShopWorkingOrderGoldenPathStrip.tsx',
    mustContain: ['versions', 'bulk', 'handoff'],
    mustNotContain: ["{ id: 'matrix', label: 'Матрица' }", "{ id: 'checkout', label: 'Оформление' }"],
  },
] as const;

/** Wave YV audit closures — golden path, chain mirror, cross-link peers (YK/XT/WM/XL/WG). */
export const WAVE_YV_SHOP_CO_AUDIT_CLOSURES = [
  {
    id: 'yk-golden-path-matrix',
    waves: ['YK'],
    sectionId: 'shop-co-matrix',
    testids: [WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID, 'shop-co-matrix-spine-peer-strip'],
    sourceFile: 'components/b2b/CoreWholesaleMatrix.tsx',
    sourceMustContain: ['ShopCoGoldenPathStrip', 'ShopCoMatrixSpinePeerStrip'],
  },
  {
    id: 'xt-draft-autosave-checkout',
    waves: ['XT'],
    sectionId: 'shop-co-checkout',
    testids: [
      'shop-co-checkout-draft-autosave-fail-hint',
      'shop-co-checkout-draft-autosave-matrix-link',
    ],
    sourceFile: 'app/shop/b2b/checkout/checkout-core.tsx',
    sourceMustContain: ['ShopCoGoldenPathStrip', 'shop-matrix-draft-autosave-wave-xt'],
  },
  {
    id: 'yk-registry-context',
    waves: ['YK'],
    sectionId: 'shop-co-registry',
    testids: ['shop-co-registry-context-strip', 'shop-co-registry-panel'],
    sourceFile: 'app/shop/b2b/orders/orders-core.tsx',
    sourceMustContain: ['ShopCoGoldenPathStrip'],
  },
  {
    id: 'yk-detail-cross-links',
    waves: ['YK'],
    sectionId: 'shop-co-detail',
    testids: ['shop-co-detail-context-strip', 'shop-co-detail-collaborative-link'],
    sourceFile: 'components/shop/b2b/ShopCoDetailSpinePeerStrip.tsx',
    sourceMustContain: ['ShopCoGoldenPathStrip', 'shop-co-detail-peer-strip'],
  },
  {
    id: 'yk-tracking-chain',
    waves: ['YK'],
    sectionId: 'shop-co-buyer-tracking',
    testids: ['shop-co-golden-path-tracking-link', 'shop-co-chain-peer-po-synced'],
    sourceFile: 'lib/platform/wave-yk-shop-co-golden-path.ts',
    sourceMustContain: [WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID, 'Трекинг'],
  },
  {
    id: 'yk-cabinet-embed',
    waves: ['YK', 'XY'],
    sectionId: 'shop-co-cabinet',
    testids: ['shop-co-cabinet-co-spine-peer-strip', 'shop-co-cabinet-tracking-embed'],
    sourceFile: 'components/platform/CollectionOrderPillarCard.tsx',
    sourceMustContain: ['ShopCoGoldenPathStrip', 'ShopCoCabinetCoSpinePeerStrip'],
  },
  {
    id: 'wg-replenishment-wms-atp',
    waves: ['WG', 'YK'],
    sectionId: 'shop-co-replenishment',
    testids: [
      'shop-replenishment-co-spine-peer-strip',
      WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID,
      'shop-replenishment-wms-atp-badge',
    ],
    sourceFile: 'components/shop/b2b/ShopReplenishmentCoSpinePeerStrip.tsx',
    sourceMustContain: ['shop-replenishment-working-order-link'],
  },
  {
    id: 'wm-collaborative-session',
    waves: ['WM'],
    sectionId: 'shop-co-collaborative-order',
    testids: [
      'shop-collaborative-session-cross-links',
      'shop-collaborative-matrix-peer-link',
      'shop-collaborative-working-order-link',
    ],
    sourceFile: 'components/shop/b2b/ShopCollaborativeOrderPanels.tsx',
    sourceMustContain: ['shop-collaborative-session-cross-links'],
  },
  {
    id: 'xl-working-order-diff',
    waves: ['XL'],
    sectionId: 'shop-co-working-order',
    testids: [
      'shop-working-order-version-diff-summary',
      'shop-co-golden-path-matrix-link',
      'shop-working-order-merge-to-matrix-btn',
    ],
    sourceFile: 'lib/b2b/shop-working-order-version-diff.ts',
    sourceMustContain: ['Wave XL'],
  },
] as const;

export function waveYvShopCoGoldenPathLabelsRu(): string[] {
  return SHOP_CO_GOLDEN_PATH_STEPS.map((s) => s.labelRu);
}
