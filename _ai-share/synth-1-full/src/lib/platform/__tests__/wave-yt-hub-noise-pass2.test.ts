import fs from 'node:fs';
import path from 'node:path';
import {
  WAVE_YT_E2E_SPEC,
  WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID,
  WAVE_YT_HUB_READPATH_OWNER_TESTID,
  WAVE_YT_MFR_DEV_PG_MIRROR_BADGE_RU,
  WAVE_YT_PUBLISHED_COUNT_OUT_OF_SYNC_RU,
  platformCoreHubAuditLegacyAttrs,
  shouldShowHubCabinetInvestorReadinessStrip,
  shouldShowHubCabinetOperatorPillarInsightCard,
  shouldShowHubCabinetPgSyncDiagnostics,
  shouldShowHubCabinetPillarDiagnostics,
  shouldShowHubCabinetPublishedCountSyncBadge,
  shouldShowHubCabinetReadPathBadge,
  shouldShowPlatformCoreHubAuditLegacyAttrs,
  shouldSuppressHubCabinetChainStatusBadge,
} from '@/lib/platform/wave-yt-hub-noise-pass2';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave YT — hub noise pass 2: audit-legacy gating + badge dedup closures. */
export const WAVE_YT_HUB_PILLAR_FIXES = [
  {
    id: 'hub-audit-legacy-hook',
    file: 'hooks/use-platform-core-hub-audit-legacy-attrs.ts',
    mustContain: ['platformCoreHubAuditLegacyAttrs', 'usePlatformCoreAuditUi'],
    mustNotContain: [],
  },
  {
    id: 'brand-sc-mini-audit-legacy-gated',
    file: 'components/platform/BrandSampleCollectionMini.tsx',
    mustContain: [
      'usePlatformCoreHubAuditLegacyAttrs',
      'shouldShowHubCabinetPublishedCountSyncBadge',
      "auditLegacy('brand-sample-collection-mini')",
    ],
    mustNotContain: ['data-audit-legacy="brand-sample-collection-mini"'],
  },
  {
    id: 'shop-sc-mini-audit-legacy-gated',
    file: 'components/platform/ShopShowroomMini.tsx',
    mustContain: [
      'usePlatformCoreHubAuditLegacyAttrs',
      'shouldShowHubCabinetPublishedCountSyncBadge',
      "auditLegacy('shop-showroom-mini')",
    ],
    mustNotContain: ['data-audit-legacy="shop-showroom-mini"'],
  },
  {
    id: 'dev-compact-chain-badge-suppress',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: ['shouldSuppressHubCabinetChainStatusBadge', 'suppressChainBadge'],
    mustNotContain: [],
  },
  {
    id: 'dev-mfr-pg-mirror-diagnostics-gated',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: ['shouldShowHubCabinetPgSyncDiagnostics', 'showDiagnostics='],
    mustNotContain: [],
  },
  {
    id: 'comms-compact-chain-badge-suppress',
    file: 'components/platform/CommsPillarCard.tsx',
    mustContain: ['shouldSuppressHubCabinetChainStatusBadge', 'suppressChainBadge'],
    mustNotContain: [],
  },
  {
    id: 'shop-op-compact-chain-badge-suppress',
    file: 'components/platform/ShopOrderProductionPillarCard.tsx',
    mustContain: ['shouldSuppressHubCabinetChainStatusBadge', 'suppressChainBadge'],
    mustNotContain: [],
  },
  {
    id: 'pillar-section-list-chain-owner-testid',
    file: 'components/platform/PillarSectionList.tsx',
    mustContain: ['WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID'],
    mustNotContain: [],
  },
  {
    id: 'hub-section-list-chain-owner',
    file: 'components/platform/RoleCoreCabinetHub.tsx',
    mustContain: [
      'PillarSectionList',
      'shouldSuppressHubCabinetChainStatusBadge',
      'shouldShowHubCabinetPillarDiagnostics',
      'shouldShowHubCabinetInvestorReadinessStrip',
      'shouldShowHubCabinetOperatorPillarInsightCard',
    ],
    mustNotContain: ['minimalChrome={false}'],
  },
  {
    id: 'comms-thread-preview-lg',
    file: 'components/platform/CommsPillarCard.tsx',
    mustContain: [
      'CommsCabinetThreadPreview',
      'CommsCabinetSplitProvider',
      'threadPreview',
    ],
    mustNotContain: [],
  },
  {
    id: 'comms-thread-select-lg',
    file: 'components/platform/CommsPillarThreadStrip.tsx',
    mustContain: ['useMinLg', 'useCommsCabinetSplitSelectionOptional', 'selectOnLg'],
    mustNotContain: [],
  },
  {
    id: 'mini-matrix-readpath-owner',
    file: 'components/platform/BrandScCabinetMiniMatrixStrip.tsx',
    mustContain: [
      'WAVE_YT_HUB_READPATH_OWNER_TESTID',
      'PlatformCorePublishedArticlesReadPathBadge',
    ],
    mustNotContain: ['shouldShowHubCabinetReadPathBadge'],
  },
  {
    id: 'op-pillar-audit-legacy-gated',
    file: 'components/platform/OrderProductionPillarCard.tsx',
    mustContain: ['usePlatformCoreHubAuditLegacyAttrs', "auditLegacy('order-production-pillar-card')"],
    mustNotContain: ['data-audit-legacy="order-production-pillar-card"'],
  },
  {
    id: 'co-pillar-audit-legacy-gated',
    file: 'components/platform/CollectionOrderPillarCard.tsx',
    mustContain: ['usePlatformCoreHubAuditLegacyAttrs', 'auditLegacy('],
    mustNotContain: ['data-audit-legacy="collection-order-pillar-card"'],
  },
  {
    id: 'sup-op-pillar-audit-legacy-gated',
    file: 'components/platform/SupplierProcurementPillarCard.tsx',
    mustContain: [
      'usePlatformCoreHubAuditLegacyAttrs',
      "auditLegacy('supplier-procurement-pillar-card')",
    ],
    mustNotContain: ['data-audit-legacy="supplier-procurement-pillar-card"'],
  },
  {
    id: 'published-count-sync-ru-drift',
    file: 'components/platform/PlatformCorePublishedCountSyncBadge.tsx',
    mustContain: ['WAVE_YT_PUBLISHED_COUNT_OUT_OF_SYNC_RU'],
    mustNotContain: ['live ${liveCount} / ${ref}'],
  },
  {
    id: 'workspace-strips-gate',
    file: 'components/platform/PlatformCoreWorkspaceStripsGate.tsx',
    mustContain: ['shouldShowPlatformCoreWorkspaceGoldenPathStrips', 'usePlatformCoreAuditUi'],
    mustNotContain: [],
  },
  {
    id: 'brand-messages-core-workspace-quiet',
    file: 'app/brand/messages/messages-core.tsx',
    mustContain: ['PlatformCoreWorkspaceStripsGate'],
    mustNotContain: [],
  },
  {
    id: 'mfr-dev-pg-mirror-ru-label',
    file: 'components/factory/MfrDevDevelopmentStatusMirrorStrip.tsx',
    mustContain: ['WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU', 'showDiagnostics'],
    mustNotContain: [],
  },
] as const;

describe('wave YT — hub noise pass 2', () => {
  it('documents 10+ hub noise fix closures', () => {
    expect(WAVE_YT_HUB_PILLAR_FIXES.length).toBeGreaterThanOrEqual(10);
  });

  it('exports owner testids + RU drift label (smoke)', () => {
    expect(WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID).toBe('pillar-cabinet-section-list');
    expect(WAVE_YT_HUB_READPATH_OWNER_TESTID).toBe('brand-sample-collection-mini-matrix');
    expect(WAVE_YT_MFR_DEV_PG_MIRROR_BADGE_RU).toBe('Статус разработки');
    expect(WAVE_YT_PUBLISHED_COUNT_OUT_OF_SYNC_RU(3, 5)).toBe('расхождение · 3 / 5');
  });

  it('gates audit-legacy + compact badge dedup helpers', () => {
    expect(shouldShowPlatformCoreHubAuditLegacyAttrs(false)).toBe(false);
    expect(platformCoreHubAuditLegacyAttrs('x', false)).toEqual({});
    expect(platformCoreHubAuditLegacyAttrs('x', true)).toEqual({ 'data-audit-legacy': 'x' });

    expect(shouldSuppressHubCabinetChainStatusBadge({ compact: true, auditUi: false })).toBe(true);
    expect(shouldSuppressHubCabinetChainStatusBadge({ compact: false, auditUi: false })).toBe(
      false
    );

    expect(shouldShowHubCabinetReadPathBadge(false)).toBe(false);
    expect(shouldShowHubCabinetPgSyncDiagnostics(false)).toBe(false);
    expect(shouldShowHubCabinetPillarDiagnostics(false)).toBe(false);
    expect(shouldShowHubCabinetInvestorReadinessStrip(false)).toBe(false);
    expect(shouldShowHubCabinetInvestorReadinessStrip(true)).toBe(true);
    expect(
      shouldShowHubCabinetOperatorPillarInsightCard({ auditUi: false, pillarId: 'comms' })
    ).toBe(true);
    expect(
      shouldShowHubCabinetOperatorPillarInsightCard({
        auditUi: false,
        pillarId: 'collection_order',
      })
    ).toBe(false);

    expect(shouldShowHubCabinetPublishedCountSyncBadge(false, true)).toBe(false);
    expect(shouldShowHubCabinetPublishedCountSyncBadge(false, false)).toBe(true);
    expect(shouldShowHubCabinetPublishedCountSyncBadge(true, true)).toBe(true);
  });

  it.each(WAVE_YT_HUB_PILLAR_FIXES)('$id — source wired', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });

  it('readpath owner testid matches mini-matrix strip constant', () => {
    const strip = read('components/platform/BrandScCabinetMiniMatrixStrip.tsx');
    expect(strip).toContain('WAVE_YT_HUB_READPATH_OWNER_TESTID');
  });

  it('core-235 e2e spec — file on disk + playwright.core.config.ts entry', () => {
    const pkgRoot = path.join(SRC, '..');
    expect(fs.existsSync(path.join(pkgRoot, 'e2e', WAVE_YT_E2E_SPEC))).toBe(true);
    const config = fs.readFileSync(path.join(pkgRoot, 'playwright.core.config.ts'), 'utf8');
    expect(config).toContain(`**/${WAVE_YT_E2E_SPEC}`);
  });
});
