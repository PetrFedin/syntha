import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_WZ_BRAND_SC_GOLDEN_PATH_RELEASE_GATE_RU,
  WAVE_WZ_BRAND_SC_RETAIL_PLATFORM_RU,
  WAVE_WZ_BRAND_SC_RETAIL_SYNDICATION_RU,
  WAVE_WZ_BRAND_DEV_CO_LINESHEETS_RU,
  WAVE_WZ_BRAND_DEV_CO_SHOWROOM_RU,
  WAVE_WZ_CO_SPINE_CONFIRM_SLA_RU,
  WAVE_WZ_COMMS_CHAIN_PUSH_COMPACT_RU,
  WAVE_WZ_COMMS_CHAIN_PUSH_FULL_RU,
  WAVE_WZ_OP_MFR_SUBTITLE_RU,
  WAVE_WZ_OP_NO_ORDER_RU,
  WAVE_WZ_SHOP_ETA_HANDOFF_HINT_RU,
  WAVE_WZ_SHOP_OP_WIP_BADGE_PREFIX_RU,
  WAVE_WZ_SUP_EMPTY_CO_CHECKOUT_RU,
  formatPlatformCoreSampleStatusLabelRu,
} from '@/lib/platform/wave-wz-ru-noise-dedup-final';
import { buildBrandCrmSegmentationSession } from '@/lib/b2b/brand-crm-segmentation';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave WZ — hub pillar RU noise trim + dedup closures. */
export const WAVE_WZ_HUB_PILLAR_FIXES = [
  {
    id: 'op-mfr-subtitle-ru',
    file: 'components/platform/OrderProductionPillarCard.tsx',
    mustContain: ['WAVE_WZ_OP_MFR_SUBTITLE_RU', 'WAVE_WZ_OP_NO_ORDER_RU'],
    mustNotContain: ['wholesale-заказа', 'confirm/handoff'],
  },
  {
    id: 'co-spine-confirm-sla-ru',
    file: 'components/platform/CollectionOrderPillarCard.tsx',
    mustContain: ['WAVE_WZ_CO_SPINE_CONFIRM_SLA_RU'],
    mustNotContain: ['ожидает confirm'],
  },
  {
    id: 'brand-sc-golden-release-gate-ru',
    file: 'components/brand/sample/BrandScCabinetGoldenPathStrip.tsx',
    mustContain: ['WAVE_WZ_BRAND_SC_GOLDEN_PATH_RELEASE_GATE_RU'],
    mustNotContain: ["label: 'Release gate'"],
  },
  {
    id: 'brand-sc-retail-peer-ru-dedup',
    file: 'components/platform/BrandScCabinetRetailPeerStrip.tsx',
    mustContain: [
      'WAVE_WZ_BRAND_SC_RETAIL_SYNDICATION_RU',
      'WAVE_WZ_BRAND_SC_RETAIL_PLATFORM_RU',
      'omitBuyPath',
      'Оформление ·',
    ],
    mustNotContain: ['Syndication', 'Platform B2B', 'Checkout ·'],
  },
  {
    id: 'brand-dev-co-peer-ru-dedup',
    file: 'components/platform/BrandDevCabinetCoPeerStrip.tsx',
    mustContain: [
      'WAVE_WZ_BRAND_DEV_CO_LINESHEETS_RU',
      'WAVE_WZ_BRAND_DEV_CO_SHOWROOM_RU',
      'Сегменты CRM',
    ],
    mustNotContain: ['Sample lifecycle', 'Shop showroom', 'shop-checkout-link'],
  },
  {
    id: 'comms-prefs-chain-push-ru',
    file: 'components/platform/PlatformCoreShopCommsNotificationPrefsStrip.tsx',
    mustContain: ['WAVE_WZ_COMMS_CHAIN_PUSH_COMPACT_RU', 'WAVE_WZ_COMMS_CHAIN_PUSH_FULL_RU'],
    mustNotContain: ['Chain push', 'chain-status'],
  },
  {
    id: 'dev-sample-status-ru',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: ['formatPlatformCoreSampleStatusLabelRu', 'sampleStatusRu'],
    mustNotContain: ['Образец · {sampleStatus}'],
  },
  {
    id: 'shop-op-wip-badge-ru',
    file: 'components/platform/ShopOrderProductionPillarCard.tsx',
    mustContain: ['WAVE_WZ_SHOP_OP_WIP_BADGE_PREFIX_RU'],
    mustNotContain: ['WIP · {trackingPreview'],
  },
  {
    id: 'shop-co-spine-pricelist-cross-link',
    file: 'components/shop/b2b/ShopCoCabinetCoSpinePeerStrip.tsx',
    mustContain: ['shopMarginPricelistHref', 'shop-co-cabinet-brand-pricelist-link'],
    mustNotContain: ["brandCrmSegmentationFeatureHref('pricelist'"],
  },
  {
    id: 'shop-co-cta-dedup-spine',
    file: 'components/platform/CollectionOrderPillarCard.tsx',
    mustContain: ['ShopCoCabinetCoSpinePeerStrip'],
    mustNotContain: ['shop-co-cabinet-tracking-link', 'shop-co-cabinet-calendar-link'],
  },
  {
    id: 'brand-sc-mini-retail-dedup',
    file: 'components/platform/BrandSampleCollectionMini.tsx',
    mustContain: ['omitBuyPath'],
  },
] as const;

describe('wave WZ — hub pillar RU noise + dedup final', () => {
  it('documents 10+ hub pillar fix closures', () => {
    expect(WAVE_WZ_HUB_PILLAR_FIXES.length).toBeGreaterThanOrEqual(10);
  });

  it('exports RU label constants (smoke)', () => {
    expect(WAVE_WZ_OP_MFR_SUBTITLE_RU).toContain('оптовому');
    expect(WAVE_WZ_CO_SPINE_CONFIRM_SLA_RU).toContain('подтверждения');
    expect(WAVE_WZ_BRAND_SC_GOLDEN_PATH_RELEASE_GATE_RU).toBe('Проверка релиза');
    expect(WAVE_WZ_BRAND_SC_RETAIL_SYNDICATION_RU).toBe('Синдикация');
    expect(WAVE_WZ_BRAND_DEV_CO_LINESHEETS_RU).toBe('Лайншиты');
  });

  it.each(WAVE_WZ_HUB_PILLAR_FIXES)('$id — source RU/dedup wired', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });

  it('sample status mapper — RU for hub badges', () => {
    expect(formatPlatformCoreSampleStatusLabelRu('sent')).toBe('Отправлен');
    expect(formatPlatformCoreSampleStatusLabelRu('in_progress')).toBe('В работе');
    expect(formatPlatformCoreSampleStatusLabelRu('draft')).toBe('Черновик');
  });

  it('shop pricelist cross-link uses shop margin href (not brand cabinet)', () => {
    const href = buildBrandCrmSegmentationSession({ collectionId: 'SS27' }).shopMarginPricelistHref;
    expect(href).toContain('/shop/');
    expect(href).toContain('pricelist');
    expect(WAVE_WZ_SHOP_ETA_HANDOFF_HINT_RU).toContain('передачи');
    expect(WAVE_WZ_SUP_EMPTY_CO_CHECKOUT_RU).toContain('оформления');
  });
});
