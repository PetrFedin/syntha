import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
/**
 * Wave YX — hub dead-end + broken href audit fix (all roles × hub matrix + peer workspaces).
 * SoT for core-239-wave-yx-dead-ends.spec.ts + unit contract tests.
 */
import { ROUTES } from '@/lib/routes';
import {
  brandLinesheetsHrefForDemo,
  PLATFORM_CORE_DEMO,
  type CoreChainRoleId,
  type CoreHubPillarId,
} from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreReadinessMatrix } from '@/lib/platform-core-readiness-audit';
import {
  WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS,
  WAVE_YQ_HUB_MATRIX_CELLS,
} from '@/lib/platform/wave-yq-hub-matrix-5x4';
import {
  SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID,
  shopEmpty27MatrixSeedHref,
} from '@/lib/b2b/shop-sc-empty27-buyer-profile-wave-ym';
import {
  WAVE_ZD_COLLECTION_ID,
  WAVE_ZD_DEAD_END_LINK_FIXES,
  scanWaveYqMatrixHrefDeadEnds,
  waveZdBrandLinesheetsHref,
  waveZdBrandLinesheetsHrefMatchesGolden,
} from '@/lib/platform/wave-zd-dead-end-link-fix';

export const WAVE_YX_COLLECTION_ID = WAVE_ZD_COLLECTION_ID;
export const WAVE_YX_CORE_E2E_SPEC = 'core-239-wave-yx-dead-ends.spec.ts' as const;

/** RU tooltip suffix for inactive peer workspaces (cabinet insight, not golden workspace). */
export const WAVE_YX_READ_ONLY_PEER_SUFFIX_RU = 'read-only · кабинет peer-роли' as const;

export type WaveYxHubDeadEndFix = (typeof WAVE_YX_HUB_DEAD_END_FIXES)[number];

/** Closed hub dead-end href fixes — wave ZD batch + YX peer tooltip wiring. */
export const WAVE_YX_HUB_DEAD_END_FIXES = [
  ...WAVE_ZD_DEAD_END_LINK_FIXES,
  {
    id: 'cross-role-readonly-peer-tooltip',
    role: 'all',
    pillar: 'all',
    was: 'Inactive peer cross-role links без RU read-only tooltip',
    now: 'waveYxCrossRoleLinkTitleRu — title на cabinet peer links',
    testids: ['role-pillar-cross-role-development', 'cross-role-cabinet-shop-development'],
    sourceFile: 'components/platform/RolePillarCrossRoleLinks.tsx',
    sourceMustContain: ['waveYxCrossRoleLinkTitleRu', 'cross-role-cabinet-'],
  },
  {
    id: 'sup-dev-materials-href-tostring',
    role: 'supplier',
    pillar: 'development',
    was: 'params.toString без () — href содержал function body (invalid-token)',
    now: 'params.toString() в sup-dev-materials resolveHref',
    testids: ['sup-dev-materials-price-journal-honest-strip'],
    sourceFile: 'lib/platform-core-readiness-sections/supplier-audit.ts',
    sourceMustContain: ['params.toString()', "id: 'sup-dev-materials'"],
    sourceMustNotContain: ['params.toString}'],
  },
] as const;

export const WAVE_YX_HUB_DEAD_END_FIX_COUNT = WAVE_YX_HUB_DEAD_END_FIXES.length;

const BLOCKED_HREF_PREFIXES = [
  '/404',
  '/brand/merch/linesheet',
  LEGACY_ROUTES.shop.b2bDiscover,
  LEGACY_ROUTES.shop.b2bOrderMode,
  LEGACY_ROUTES.shop.b2bOrderDrafts,
] as const;

function isBlockedHref(href: string): string | null {
  const base = href.split('#')[0] ?? href;
  for (const prefix of BLOCKED_HREF_PREFIXES) {
    if (base === prefix || base.startsWith(`${prefix}?`)) return prefix;
  }
  if (base.includes('undefined') || base.includes('null')) return 'invalid-token';
  return null;
}

/** Active hub matrix workspace hrefs — no known dead-end prefixes. */
export function scanWaveYxHubMatrixHrefDeadEnds(cells = WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS): string[] {
  return scanWaveYqMatrixHrefDeadEnds(cells);
}

/** Readiness section audit hrefs (hub matrix drill-down) — no dead-ends or alias to /404. */
export function scanWaveYxReadinessSectionHrefDeadEnds(
  collectionId = WAVE_YX_COLLECTION_ID
): string[] {
  const dead: string[] = [];
  const matrix = getPlatformCoreReadinessMatrix(collectionId);
  for (const cell of matrix) {
    for (const sub of cell.subItems) {
      const blocked = isBlockedHref(sub.href);
      if (blocked) {
        dead.push(`${cell.roleId}/${cell.pillarId}/${sub.id}:${blocked}`);
      }
    }
    const wsBlocked = isBlockedHref(cell.workspaceHref);
    if (wsBlocked) {
      dead.push(`${cell.roleId}/${cell.pillarId}:workspace:${wsBlocked}`);
    }
  }
  return dead;
}

/** Detect active cells whose workspace href collapsed to cabinet-only (alias loop). */
export function scanWaveYxHubAliasLoops(cells = WAVE_YQ_HUB_MATRIX_ACTIVE_CELLS): string[] {
  const loops: string[] = [];
  for (const cell of cells) {
    const href = cell.workspaceHref;
    const isCabinetOnly =
      /\/core\?pillar=/.test(href) &&
      !/\/b2b\//.test(href) &&
      !/\/messages/.test(href) &&
      !/\/production\//.test(href) &&
      !/w2col=/.test(href) &&
      !/\/linesheets/.test(href) &&
      !/\/calendar/.test(href);
    if (isCabinetOnly) loops.push(`${cell.id}:cabinet-alias-loop`);
  }
  return loops;
}

export function waveYxCrossRoleLinkTitleRu(peerLabel: string, inactiveReason: string): string {
  const reason = inactiveReason.trim();
  return reason
    ? `${peerLabel} · ${reason} (${WAVE_YX_READ_ONLY_PEER_SUFFIX_RU})`
    : `${peerLabel} (${WAVE_YX_READ_ONLY_PEER_SUFFIX_RU})`;
}

export function waveYxReadOnlyPeerWorkspaceTooltipRu(
  peerRoleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  reasonRu: string
): string {
  const labels: Record<CoreChainRoleId, string> = {
    brand: 'Бренд',
    shop: 'Магазин',
    manufacturer: 'Производство',
    supplier: 'Поставщик',
  };
  return waveYxCrossRoleLinkTitleRu(labels[peerRoleId], reasonRu);
}

export function waveYxBrandLinesheetsHref(collectionId = WAVE_YX_COLLECTION_ID): string {
  return waveZdBrandLinesheetsHref(collectionId);
}

export function waveYxBrandLinesheetsHrefMatchesGolden(
  collectionId = WAVE_YX_COLLECTION_ID
): boolean {
  return waveZdBrandLinesheetsHrefMatchesGolden(collectionId);
}

export function waveYxShopEmpty27MatrixSeedHref(): string {
  return shopEmpty27MatrixSeedHref({ buyerId: 'B2B-DEMO-SHOP1' });
}

export function waveYxCoreE2eSpecGlob(basename = WAVE_YX_CORE_E2E_SPEC): string {
  return `**/${basename}`;
}

export function waveYxHubMatrixCellCount(): number {
  return WAVE_YQ_HUB_MATRIX_CELLS.length;
}

export {
  brandLinesheetsHrefForDemo,
  PLATFORM_CORE_DEMO,
  SHOP_EMPTY27_ONBOARDING_MATRIX_LINK_TESTID,
};
