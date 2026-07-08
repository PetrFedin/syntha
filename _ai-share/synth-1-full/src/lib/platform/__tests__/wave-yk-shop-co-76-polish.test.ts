import fs from 'node:fs';
import path from 'node:path';
import { getPlatformCoreReadinessMatrix } from '@/lib/platform-core-readiness-audit';
import {
  buildShopCoGoldenPathSession,
  SHOP_CO_GOLDEN_PATH_STEPS,
  WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID,
} from '@/lib/platform/wave-yk-shop-co-golden-path';

const SRC = path.join(__dirname, '..', '..', '..');
const PKG_ROOT = path.join(SRC, '..');
const CORE_E2E_SPEC = 'core-226-wave-yk-shop-co.spec.ts';

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

function readPkg(rel: string): string {
  return fs.readFileSync(path.join(PKG_ROOT, rel), 'utf8');
}

function countGoldenLinks(source: string): number {
  return (source.match(/data-testid="[^"]+-link"/g) ?? []).length;
}

/** Wave YK — shop CO 7.1→7.6 golden path consolidation + peer dedup (core-226). */
export const WAVE_YK_SHOP_CO_FIXES = [
  {
    id: 'golden-path-module',
    file: 'lib/platform/wave-yk-shop-co-golden-path.ts',
    mustContain: ['Wave YK', WAVE_YK_SHOP_CO_GOLDEN_PATH_STRIP_TESTID, 'Матрица', 'Пополнение'],
    mustNotContain: ['Checkout ·', 'Matrix →'],
  },
  {
    id: 'golden-path-strip-component',
    file: 'components/shop/b2b/ShopCoGoldenPathStrip.tsx',
    mustContain: ['ShopCoGoldenPathStrip', 'SHOP_CO_GOLDEN_PATH_STEPS', 'labelRu'],
    mustNotContain: [],
  },
  {
    id: 'matrix-golden-path-wired',
    file: 'components/b2b/CoreWholesaleMatrix.tsx',
    mustContain: ['ShopCoGoldenPathStrip', 'omitStep="matrix"'],
    mustNotContain: ['ShopScCabinetGoldenPathStrip'],
  },
  {
    id: 'checkout-golden-path-wired',
    file: 'app/shop/b2b/checkout/checkout-core.tsx',
    mustContain: [
      'ShopCoGoldenPathStrip',
      'SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.checkout.strip',
      'activeStep="checkout"',
    ],
    mustNotContain: ['shop-co-checkout-showroom-link'],
  },
  {
    id: 'checkout-monetization-dedup',
    file: 'components/platform/ShopCoCheckoutMonetizationPeerStrip.tsx',
    mustContain: ['shop-co-checkout-brand-crm-link', 'shop-co-checkout-collaborative-link'],
    mustNotContain: ['shop-co-checkout-registry-link', 'shop-co-checkout-tracking-link'],
  },
  {
    id: 'matrix-spine-peer-dedup',
    file: 'components/platform/ShopCoMatrixSpinePeerStrip.tsx',
    mustContain: ['shop-co-matrix-collaborative-link', 'shop-co-matrix-rules-link'],
    mustNotContain: ['shop-co-matrix-replenishment-link', 'shop-co-matrix-tracking-link'],
  },
  {
    id: 'registry-golden-path-wired',
    file: 'app/shop/b2b/orders/orders-core.tsx',
    mustContain: [
      'ShopCoGoldenPathStrip',
      'SHOP_CO_GOLDEN_PATH_LEGACY_BY_SURFACE.registry.strip',
      'omitStep="registry"',
    ],
    mustNotContain: ['shop-co-registry-active-order-link'],
  },
  {
    id: 'detail-golden-path-wired',
    file: 'components/shop/b2b/ShopCoDetailSpinePeerStrip.tsx',
    mustContain: [
      'ShopCoGoldenPathStrip',
      'shop-co-detail-peer-strip',
      'shop-co-detail-collaborative-link',
    ],
    mustNotContain: [],
  },
  {
    id: 'replenishment-golden-path-wired',
    file: 'app/shop/b2b/replenishment/page.tsx',
    mustContain: ['ShopCoGoldenPathStrip', 'activeStep="replenishment"'],
    mustNotContain: [],
  },
  {
    id: 'replenishment-peer-dedup',
    file: 'components/shop/b2b/ShopReplenishmentCoSpinePeerStrip.tsx',
    mustContain: ['shop-replenishment-working-order-link', 'shop-replenishment-collaborative-link'],
    mustNotContain: ['shop-replenishment-checkout-link'],
  },
  {
    id: 'cabinet-golden-path-wired',
    file: 'components/platform/CollectionOrderPillarCard.tsx',
    mustContain: ['ShopCoGoldenPathStrip', 'ShopCoCabinetCoSpinePeerStrip'],
    mustNotContain: ['shop-co-cabinet-matrix-link', 'shop-co-cabinet-checkout-link'],
  },
  {
    id: 'cabinet-spine-peer-dedup',
    file: 'components/shop/b2b/ShopCoCabinetCoSpinePeerStrip.tsx',
    mustContain: ['shop-co-cabinet-collaborative-link', 'shop-co-cabinet-brand-pricelist-link'],
    mustNotContain: ['shop-co-cabinet-replenishment-link'],
  },
] as const;

export const WAVE_YK_SHOP_CO_SECTION_IDS_76 = [
  'shop-co-matrix',
  'shop-co-checkout',
  'shop-co-registry',
  'shop-co-detail',
  'shop-co-buyer-tracking',
  'shop-co-cabinet',
] as const;

const PEER_STRIP_MIN_LINKS = 2;

describe('wave YK — shop CO golden path 7.6 polish', () => {
  it('documents 10+ shop CO golden path fix closures', () => {
    expect(WAVE_YK_SHOP_CO_FIXES.length).toBeGreaterThanOrEqual(10);
  });

  it('exports RU golden path steps (matrix→checkout→replenishment→tracking)', () => {
    expect(SHOP_CO_GOLDEN_PATH_STEPS.map((s) => s.labelRu)).toEqual([
      'Матрица',
      'Оформление',
      'Пополнение',
      'Реестр',
      'Трекинг',
    ]);
    const session = buildShopCoGoldenPathSession();
    expect(session.matrixHref).toContain('/shop/b2b/matrix');
    expect(session.checkoutHref).toContain('/shop/b2b/checkout');
    expect(session.replenishmentHref).toContain('stock-atp');
    expect(session.trackingHref).toContain('/shop/b2b/tracking');
  });

  it.each(WAVE_YK_SHOP_CO_FIXES)('$id — source wired / deduped', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });

  it.each(WAVE_YK_SHOP_CO_SECTION_IDS_76)('%s — section score ≥ 7.6', (sectionId) => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const hit = cells
      .flatMap((c) => c.subItems.map((s) => ({ ...s, roleId: c.roleId })))
      .find((s) => s.id === sectionId && s.roleId === 'shop');
    expect(hit).toBeDefined();
    expect(hit!.staticScore).toBeGreaterThanOrEqual(7.6);
    expect(hit!.liveScore).toBeGreaterThanOrEqual(7.6);
  });

  it('shop collection_order — CELL audit 7.6 + wave YK evidence', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const cell = cells.find((c) => c.roleId === 'shop' && c.pillarId === 'collection_order');
    expect(cell?.good.some((g) => g.includes('Wave YK'))).toBe(true);
    expect(cell?.summary).toMatch(/replenishment|golden path/i);
  });

  it('shop CO sections 1–6 — average static/live ≥ 7.6', () => {
    const cells = getPlatformCoreReadinessMatrix('SS27');
    const sections = cells
      .flatMap((c) => c.subItems.map((s) => ({ ...s, roleId: c.roleId })))
      .filter(
        (s) =>
          s.roleId === 'shop' &&
          WAVE_YK_SHOP_CO_SECTION_IDS_76.includes(
            s.id as (typeof WAVE_YK_SHOP_CO_SECTION_IDS_76)[number]
          )
      );
    const staticAvg =
      sections.reduce((acc, s) => acc + s.staticScore, 0) / Math.max(sections.length, 1);
    const liveAvg =
      sections.reduce((acc, s) => acc + s.liveScore, 0) / Math.max(sections.length, 1);
    expect(staticAvg).toBeGreaterThanOrEqual(7.6);
    expect(liveAvg).toBeGreaterThanOrEqual(7.6);
  });

  it('peer strips retain ≥2 cross-links after golden path dedup', () => {
    const peerFiles = [
      'components/platform/ShopCoCheckoutMonetizationPeerStrip.tsx',
      'components/platform/ShopCoMatrixSpinePeerStrip.tsx',
      'components/shop/b2b/ShopReplenishmentCoSpinePeerStrip.tsx',
      'components/shop/b2b/ShopCoCabinetCoSpinePeerStrip.tsx',
      'components/shop/b2b/ShopCoDetailSpinePeerStrip.tsx',
    ];
    for (const file of peerFiles) {
      const links = countGoldenLinks(read(file));
      expect(links).toBeGreaterThanOrEqual(PEER_STRIP_MIN_LINKS);
    }
  });

  it('core-226 e2e — file on disk + playwright.core.config.ts entry', () => {
    expect(fs.existsSync(path.join(PKG_ROOT, 'e2e', CORE_E2E_SPEC))).toBe(true);
    expect(readPkg('playwright.core.config.ts')).toContain(`**/${CORE_E2E_SPEC}`);
  });
});
