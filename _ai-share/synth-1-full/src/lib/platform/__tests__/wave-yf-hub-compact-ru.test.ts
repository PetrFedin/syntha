import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YF_ATTR_HEALTH_RU,
  WAVE_YF_ATTR_SCHEMA_RU,
  WAVE_YF_BOM_BADGE_RU,
  WAVE_YF_BOM_LINK_RU,
  WAVE_YF_BRAND_DEV_INVESTOR_PEER_STRIP_TESTID,
  WAVE_YF_BRAND_DEV_PG_SYNC_PEER_STRIP_TESTID,
  WAVE_YF_MARKETROOM_RU,
  WAVE_YF_MAT_CERTS_RU,
  WAVE_YF_MAT_ROLLUP_RU,
  WAVE_YF_NEW_SKU_RU,
  WAVE_YF_PLATFORM_B2B_RU,
  WAVE_YF_RELEASE_GATE_LOADING_RU,
  WAVE_YF_RELEASE_GATE_RU,
  WAVE_YF_SCHEMA_ATTR_RU,
  WAVE_YF_SHOP_SC_B2B_PEER_STRIP_TESTID,
} from '@/lib/platform/wave-yf-hub-compact-ru';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave YF — hub compact/core RU labels + peer dedup closures. */
export const WAVE_YF_HUB_PILLAR_FIXES = [
  {
    id: 'dev-compact-new-sku-ru',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: ['WAVE_YF_NEW_SKU_RU', 'brand-dev-cabinet-create-sku-link'],
    mustNotContain: ['>New SKU<', 'Create SKU'],
  },
  {
    id: 'dev-compact-schema-attr-ru',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: ['WAVE_YF_SCHEMA_ATTR_RU', 'brand-dev-cabinet-attribute-schema-link'],
    mustNotContain: ['>Schema<', 'Schema attr'],
  },
  {
    id: 'dev-compact-bom-badge-ru',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: ['WAVE_YF_BOM_BADGE_RU', 'development-bom-ready-badge'],
    mustNotContain: ['BOM {bomLineCount}'],
  },
  {
    id: 'dev-investor-peer-omit-release-dedup',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: ['BrandDevInvestorReadinessPeerStrip', 'omitReleaseGate', 'omitKanbanLink'],
    mustNotContain: [],
  },
  {
    id: 'dev-investor-peer-strip-ru',
    file: 'components/platform/BrandDevInvestorReadinessPeerStrip.tsx',
    mustContain: [
      'WAVE_YF_BRAND_DEV_INVESTOR_PEER_STRIP_TESTID',
      'WAVE_YF_RELEASE_GATE_RU',
      'omitReleaseGate',
    ],
    mustNotContain: ['>Release gate<'],
  },
  {
    id: 'dev-schema-passport-peer-ru',
    file: 'components/platform/BrandDevSchemaPassportPeerStrip.tsx',
    mustContain: [
      'WAVE_YF_ATTR_HEALTH_RU',
      'WAVE_YF_ATTR_SCHEMA_RU',
      'WAVE_YF_MAT_ROLLUP_RU',
      'WAVE_YF_MAT_CERTS_RU',
      'WAVE_YF_RELEASE_GATE_RU',
    ],
    mustNotContain: ['Attribute health', 'Attribute schema', 'Material rollup', 'Material certs'],
  },
  {
    id: 'dev-passport-release-gate-loading-ru',
    file: 'components/platform/BrandDevPassportReleaseGatePeerStrip.tsx',
    mustContain: ['WAVE_YF_RELEASE_GATE_LOADING_RU'],
    mustNotContain: ['Release gate…'],
  },
  {
    id: 'shop-sc-b2b-peer-ru-dedup',
    file: 'components/platform/ShopScCabinetB2bPeerStrip.tsx',
    mustContain: [
      'WAVE_YF_SHOP_SC_B2B_PEER_STRIP_TESTID',
      'WAVE_YF_PLATFORM_B2B_RU',
      'WAVE_YF_MARKETROOM_RU',
      'omitCheckout',
    ],
    mustNotContain: ['Platform B2B', 'Marketroom'],
  },
  {
    id: 'shop-sc-mini-omit-checkout-dedup',
    file: 'components/platform/ShopShowroomMini.tsx',
    mustContain: ['ShopScCabinetB2bPeerStrip', 'omitCheckout'],
    mustNotContain: ['shop-sc-cabinet-checkout-link'],
  },
  {
    id: 'brand-dev-pg-sync-peer-testid',
    file: 'components/platform/BrandDevPgSyncPeerStrip.tsx',
    mustContain: ['brand-dev-pg-sync-peer-strip', 'Схема атрибутов'],
    mustNotContain: ['Attribute schema'],
  },
  {
    id: 'dev-investor-readiness-strip-compact',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: [
      'BrandDevInvestorReadinessStrip',
      'variant="compact"',
      'brand-dev-dashboard-strips',
    ],
    mustNotContain: [],
  },
] as const;

describe('wave YF — hub compact RU + noise reduction', () => {
  it('documents 10+ hub compact fix closures', () => {
    expect(WAVE_YF_HUB_PILLAR_FIXES.length).toBeGreaterThanOrEqual(10);
  });

  it('exports RU label constants (smoke)', () => {
    expect(WAVE_YF_RELEASE_GATE_RU).toBe('Проверка релиза');
    expect(WAVE_YF_RELEASE_GATE_LOADING_RU).toBe('Проверка релиза…');
    expect(WAVE_YF_PLATFORM_B2B_RU).toBe('B2B-платформа');
    expect(WAVE_YF_MARKETROOM_RU).toBe('Витрина B2B');
    expect(WAVE_YF_NEW_SKU_RU).toBe('Новый SKU');
    expect(WAVE_YF_SCHEMA_ATTR_RU).toBe('Атрибуты');
    expect(WAVE_YF_BOM_BADGE_RU).toBe('Спецификация');
    expect(WAVE_YF_BOM_LINK_RU).toBe('Спецификация');
    expect(WAVE_YF_ATTR_HEALTH_RU).toContain('атрибут');
    expect(WAVE_YF_SHOP_SC_B2B_PEER_STRIP_TESTID).toBe('shop-sc-cabinet-b2b-peer-strip');
    expect(WAVE_YF_BRAND_DEV_INVESTOR_PEER_STRIP_TESTID).toBe(
      'brand-dev-investor-readiness-peer-strip'
    );
    expect(WAVE_YF_BRAND_DEV_PG_SYNC_PEER_STRIP_TESTID).toBe('brand-dev-pg-sync-peer-strip');
  });

  it.each(WAVE_YF_HUB_PILLAR_FIXES)('$id — source RU/dedup wired', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });
});
