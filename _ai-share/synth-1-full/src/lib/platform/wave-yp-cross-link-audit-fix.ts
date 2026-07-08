/**
 * Wave YP — broken/missing peer href audit + RU labels on peer strips (all roles × pillars).
 */
import {
  WAVE_YF_MARKETROOM_RU,
  WAVE_YF_MAT_CERTS_RU,
  WAVE_YF_MAT_ROLLUP_RU,
  WAVE_YF_PLATFORM_B2B_RU,
  WAVE_YF_RELEASE_GATE_RU,
} from '@/lib/platform/wave-yf-hub-compact-ru';

export {
  WAVE_YF_MARKETROOM_RU as WAVE_YP_MARKETROOM_RU,
  WAVE_YF_PLATFORM_B2B_RU as WAVE_YP_PLATFORM_B2B_RU,
  WAVE_YF_RELEASE_GATE_RU as WAVE_YP_RELEASE_GATE_RU,
  WAVE_YF_MAT_ROLLUP_RU as WAVE_YP_MAT_ROLLUP_RU,
  WAVE_YF_MAT_CERTS_RU as WAVE_YP_MAT_CERTS_RU,
};

export const WAVE_YP_PARTNERS_RU = 'Партнёры';
export const WAVE_YP_LINESHEETS_RU = 'Лайншиты';
export const WAVE_YP_LINESHEET_RU = 'Лайншит';
export const WAVE_YP_SHOP_SHOWROOM_RU = 'Витрина магазина';
export const WAVE_YP_ATTR_SCHEMA_RU = 'Схема атрибутов';
export const WAVE_YP_RELEASE_CHECKLIST_RU = 'Чеклист релиза';
export const WAVE_YP_SHOWROOM_PUBLISH_RU = 'Публикация витрины';
export const WAVE_YP_PLATFORM_HUB_RU = 'Хаб платформы';
export const WAVE_YP_BRAND_PUBLISH_RU = 'Публикация бренда';
export const WAVE_YP_MAT_PASSPORT_RU = 'Паспорт материала';
export const WAVE_YP_BRAND_RFQ_RU = 'RFQ бренда';
export const WAVE_YP_SUPPLIER_BOM_RU = 'BOM поставщика';
export const WAVE_YP_SHOP2_REGISTRY_RU = 'Реестр Shop2';
export const WAVE_YP_CRM_ASSIGN_RU = 'Назначение CRM';

export const WAVE_YP_SHOP_SC_SHOWROOM_B2B_PEER_STRIP_TESTID = 'shop-sc-showroom-b2b-peer-strip';
export const WAVE_YP_SHOP_SC_PARTNERS_B2B_PEER_STRIP_TESTID = 'shop-sc-partners-b2b-peer-strip';
export const WAVE_YP_SHOP_SC_MATRIX_ENTRY_CO_PEER_STRIP_TESTID =
  'shop-sc-matrix-entry-co-peer-strip';
export const WAVE_YP_SHOP_SC_SHOWROOM_MONETIZATION_PEER_STRIP_TESTID =
  'shop-sc-showroom-monetization-peer-strip';
export const WAVE_YP_BRAND_SC_SHOWROOM_RETAIL_PEER_STRIP_TESTID =
  'brand-sc-showroom-retail-peer-strip';
export const WAVE_YP_BRAND_SC_LINESHEETS_RETAIL_PEER_STRIP_TESTID =
  'brand-sc-linesheets-retail-peer-strip';
export const WAVE_YP_BRAND_SC_RELEASE_GATE_SCHEMA_PASSPORT_PEER_STRIP_TESTID =
  'brand-sc-release-gate-schema-passport-peer-strip';
export const WAVE_YP_BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID =
  'brand-dev-passport-release-gate-peer-strip';
export const WAVE_YP_BRAND_DEV_MERCH_CO_SPINE_PEER_STRIP_TESTID =
  'brand-attribute-schema-co-spine-peer-strip';
export const WAVE_YP_PLATFORM_B2B_MARKETROOM_CO_SPINE_PEER_STRIP_TESTID =
  'platform-b2b-marketroom-co-spine-peer-strip';
export const WAVE_YP_PLATFORM_B2B_HUB_CO_SPINE_PEER_STRIP_TESTID =
  'platform-b2b-hub-co-spine-peer-strip';
export const WAVE_YP_SUP_DEV_BOM_BRAND_DEV_PEER_STRIP_TESTID = 'sup-dev-bom-brand-dev-peer-strip';

/** Closed wave YP cross-link audit fixes (10). */
export const WAVE_YP_CROSS_LINK_AUDIT_FIXES = [
  {
    id: 'shop-sc-showroom-monetization-partners-href',
    role: 'shop' as const,
    pillar: 'sample_collection' as const,
    sectionId: 'shop-sc-showroom',
    was: 'Partners discover без ?collection=',
    testids: [
      WAVE_YP_SHOP_SC_SHOWROOM_MONETIZATION_PEER_STRIP_TESTID,
      'shop-sc-showroom-partners-link',
    ],
    sourceFile: 'components/platform/ShopScShowroomMonetizationPeerStrip.tsx',
    sourceMustContain: ['discoverPageHref', 'WAVE_YP_PARTNERS_RU', 'WAVE_YP_LINESHEET_RU'],
    sourceMustNotContain: ['ROUTES.shop.b2bPartnersDiscover}', 'Partners\n'],
  },
  {
    id: 'shop-sc-showroom-b2b-peer-ru',
    role: 'shop' as const,
    pillar: 'sample_collection' as const,
    sectionId: 'shop-sc-showroom',
    was: 'EN Platform B2B / Marketroom / Partners на peer strip',
    testids: [WAVE_YP_SHOP_SC_SHOWROOM_B2B_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/ShopScShowroomB2bPeerStrip.tsx',
    sourceMustContain: ['WAVE_YP_PLATFORM_B2B_RU', 'WAVE_YP_MARKETROOM_RU', 'WAVE_YP_PARTNERS_RU'],
    sourceMustNotContain: ['Platform B2B', 'Marketroom\n', '>Partners<'],
  },
  {
    id: 'shop-sc-partners-b2b-peer-ru',
    role: 'shop' as const,
    pillar: 'sample_collection' as const,
    sectionId: 'shop-sc-partners',
    was: 'EN Platform B2B / Marketroom на partners peer strip',
    testids: [WAVE_YP_SHOP_SC_PARTNERS_B2B_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/ShopScPartnersB2bPeerStrip.tsx',
    sourceMustContain: ['WAVE_YP_PLATFORM_B2B_RU', 'WAVE_YP_MARKETROOM_RU'],
    sourceMustNotContain: ['Platform B2B', 'Marketroom\n'],
  },
  {
    id: 'shop-sc-matrix-entry-co-peer-ru',
    role: 'shop' as const,
    pillar: 'collection_order' as const,
    sectionId: 'shop-sc-matrix-entry',
    was: 'EN Platform B2B на matrix entry peer strip',
    testids: [WAVE_YP_SHOP_SC_MATRIX_ENTRY_CO_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/ShopScMatrixEntryCoPeerStrip.tsx',
    sourceMustContain: ['WAVE_YP_PLATFORM_B2B_RU'],
    sourceMustNotContain: ['Platform B2B'],
  },
  {
    id: 'brand-sc-showroom-retail-peer-ru',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    sectionId: 'brand-sc-showroom',
    was: 'EN Linesheets / Release gate / Platform B2B',
    testids: [WAVE_YP_BRAND_SC_SHOWROOM_RETAIL_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/BrandScShowroomRetailPeerStrip.tsx',
    sourceMustContain: [
      'WAVE_YP_LINESHEETS_RU',
      'WAVE_YP_RELEASE_GATE_RU',
      'WAVE_YP_PLATFORM_B2B_RU',
    ],
    sourceMustNotContain: ['Linesheets\n', 'Release gate', 'Platform B2B'],
  },
  {
    id: 'brand-sc-linesheets-retail-peer-ru',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    sectionId: 'brand-sc-linesheets',
    was: 'EN Release gate на linesheets peer strip',
    testids: [WAVE_YP_BRAND_SC_LINESHEETS_RETAIL_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/BrandScLinesheetsRetailPeerStrip.tsx',
    sourceMustContain: ['WAVE_YP_RELEASE_GATE_RU'],
    sourceMustNotContain: ['Release gate'],
  },
  {
    id: 'brand-sc-release-gate-schema-passport-peer-ru',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    sectionId: 'brand-sc-publish',
    was: 'EN schema/passport peer labels',
    testids: [WAVE_YP_BRAND_SC_RELEASE_GATE_SCHEMA_PASSPORT_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/BrandScReleaseGateSchemaPassportPeerStrip.tsx',
    sourceMustContain: [
      'WAVE_YP_ATTR_SCHEMA_RU',
      'WAVE_YP_MAT_ROLLUP_RU',
      'WAVE_YP_MAT_CERTS_RU',
      'WAVE_YP_RELEASE_CHECKLIST_RU',
    ],
    sourceMustNotContain: [
      'Attribute schema',
      'Material rollup',
      'Material certs',
      'Release checklist',
    ],
  },
  {
    id: 'brand-dev-passport-release-gate-peer-ru',
    role: 'brand' as const,
    pillar: 'development' as const,
    sectionId: 'brand-dev-material-passport',
    was: 'EN Release checklist / Showroom publish',
    testids: [WAVE_YP_BRAND_DEV_PASSPORT_RELEASE_GATE_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/BrandDevPassportReleaseGatePeerStrip.tsx',
    sourceMustContain: ['WAVE_YP_RELEASE_CHECKLIST_RU', 'WAVE_YP_SHOWROOM_PUBLISH_RU'],
    sourceMustNotContain: ['Release checklist', 'Showroom publish'],
  },
  {
    id: 'brand-dev-merch-co-spine-peer-ru',
    role: 'brand' as const,
    pillar: 'development' as const,
    sectionId: 'brand-dev-cross',
    was: 'EN Linesheets / Shop showroom на merch CO spine',
    testids: [WAVE_YP_BRAND_DEV_MERCH_CO_SPINE_PEER_STRIP_TESTID],
    sourceFile: 'components/platform/BrandDevMerchCoSpinePeerStrip.tsx',
    sourceMustContain: ['WAVE_YP_LINESHEETS_RU', 'WAVE_YP_SHOP_SHOWROOM_RU'],
    sourceMustNotContain: ['Linesheets\n', 'Shop showroom'],
  },
  {
    id: 'sup-dev-bom-brand-dev-peer-ru',
    role: 'supplier' as const,
    pillar: 'development' as const,
    sectionId: 'sup-dev-bom',
    was: 'EN Material passport / Attribute schema / Brand RFQ / Supplier BOM',
    testids: [WAVE_YP_SUP_DEV_BOM_BRAND_DEV_PEER_STRIP_TESTID],
    sourceFile: 'components/factory/supplier/SupDevBomBrandDevPeerStrip.tsx',
    sourceMustContain: [
      'WAVE_YP_MAT_PASSPORT_RU',
      'WAVE_YP_ATTR_SCHEMA_RU',
      'WAVE_YP_BRAND_RFQ_RU',
      'WAVE_YP_SUPPLIER_BOM_RU',
    ],
    sourceMustNotContain: ['Material passport', 'Attribute schema', 'Brand RFQ', 'Supplier BOM'],
  },
] as const;

/** Scan readiness section good lines for peer strip testids missing from wave YP closures. */
export function scanReadinessPeerStripTestIdGaps(
  cells: ReadonlyArray<{
    roleId: string;
    pillarId: string;
    subItems: ReadonlyArray<{
      id: string;
      good: readonly string[];
      bad: readonly string[];
      fix: readonly string[];
    }>;
  }>
): string[] {
  const closed = new Set(
    WAVE_YP_CROSS_LINK_AUDIT_FIXES.flatMap((f) => f.testids).flatMap((tid) => [
      tid,
      tid.replace(/-peer-strip$/, ''),
    ])
  );
  const gaps: string[] = [];
  for (const cell of cells) {
    for (const sub of cell.subItems) {
      if ((sub.bad?.length ?? 0) > 0 || (sub.fix?.length ?? 0) > 0) {
        gaps.push(`${cell.roleId}/${cell.pillarId}/${sub.id}:bad-or-fix-open`);
      }
      for (const line of sub.good ?? []) {
        const m = line.match(/`([a-z0-9-]+(?:-peer-strip|-link))`/i);
        if (!m) continue;
        const tid = m[1];
        if (tid.includes('peer') && !closed.has(tid) && !line.includes('Wave YP')) {
          gaps.push(`${sub.id}:${tid}`);
        }
      }
    }
  }
  return gaps;
}
