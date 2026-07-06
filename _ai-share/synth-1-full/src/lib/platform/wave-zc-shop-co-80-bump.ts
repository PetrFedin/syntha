/**
 * Wave ZC — shop CO 7.6→8.0 audit §6 (S3): YK golden path + XT draft + WM collaborative + XL working-order.
 * SoT for core-244 e2e + unit contract tests.
 */
import {
  SHOP_CO_GOLDEN_PATH_STEPS,
  WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID,
} from '@/lib/platform/wave-yk-shop-co-golden-path';

export const WAVE_ZC_E2E_SPEC = 'core-244-wave-zc-shop-co-80.spec.ts' as const;

export const WAVE_ZC_SHOP_CO_CELL_ROLE = 'shop' as const;
export const WAVE_ZC_SHOP_CO_CELL_PILLAR = 'collection_order' as const;

/** Sections meeting YK / XT / WM / XL closure criteria — bumped to 8.0 static/live. */
export const WAVE_ZC_SHOP_CO_SECTION_IDS_80 = [
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

export const WAVE_ZC_SHOP_CO_CELL_SCORE_MIN = 8.0;

/** Wave ZC audit closures — golden path, chain mirror, cross-link peers (YK/XT/WM/XL). */
export const WAVE_ZC_SHOP_CO_AUDIT_CLOSURES = [
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
    id: 'yk-replenishment-peers',
    waves: ['YK'],
    sectionId: 'shop-co-replenishment',
    testids: ['shop-replenishment-co-spine-peer-strip', 'shop-co-golden-path-strip'],
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

export function waveZcShopCoGoldenPathLabelsRu(): string[] {
  return SHOP_CO_GOLDEN_PATH_STEPS.map((s) => s.labelRu);
}
