/**
 * Wave YT — hub noise pass 2: hide audit-legacy attrs, dedupe pg-sync/readPath/chain-status in compact/core.
 * E2E: core-235-wave-yt-noise.spec.ts
 */

export const WAVE_YT_E2E_SPEC = 'core-235-wave-yt-noise.spec.ts';

export const WAVE_YT_HUB_CHAIN_STATUS_OWNER_TESTID = 'pillar-cabinet-section-list';
export const WAVE_YT_HUB_READPATH_OWNER_TESTID = 'brand-sample-collection-mini-matrix';

import { WAVE_ZE_MFR_DEV_MIRROR_BADGE_RU } from '@/lib/platform/wave-ze-hub-diagnostics-ru';

export const WAVE_YT_MFR_DEV_PG_MIRROR_BADGE_RU = WAVE_ZE_MFR_DEV_MIRROR_BADGE_RU;
export const WAVE_YT_PUBLISHED_COUNT_OUT_OF_SYNC_RU = (live: number, ref: number) =>
  `расхождение · ${live} / ${ref}`;

/** Legacy audit attrs only when hub «Аудит» ON. */
export function shouldShowPlatformCoreHubAuditLegacyAttrs(auditUi: boolean): boolean {
  return auditUi;
}

export function platformCoreHubAuditLegacyAttrs(
  legacy: string | undefined,
  auditUi: boolean
): Record<string, string> {
  if (!legacy || !shouldShowPlatformCoreHubAuditLegacyAttrs(auditUi)) return {};
  return { 'data-audit-legacy': legacy };
}

/** Operator cabinet: PillarSectionList owns chain-status live dot — suppress card duplicates. */
export function shouldSuppressHubCabinetChainStatusBadge(input: {
  compact?: boolean;
  auditUi: boolean;
}): boolean {
  return Boolean(input.compact) && !input.auditUi;
}

/** Duplicate readPath badges outside mini-matrix owner — audit mode only. */
export function shouldShowHubCabinetReadPathBadge(auditUi: boolean): boolean {
  return auditUi;
}

/** Operator cabinet: hide pg-sync / development-status mirror diagnostics. */
export function shouldShowHubCabinetPgSyncDiagnostics(auditUi: boolean): boolean {
  return auditUi;
}

/** Operator cabinet: collapse pillar diagnostics `<details>` wrapper. */
export function shouldShowHubCabinetPillarDiagnostics(auditUi: boolean): boolean {
  return auditUi;
}

/** Investor readiness cell strip — audit / investor mode only. */
export function shouldShowHubCabinetInvestorReadinessStrip(auditUi: boolean): boolean {
  return auditUi;
}

/** Operator cabinet: pillar insight cards — comms split always; остальные только в audit diagnostics. */
export function shouldShowHubCabinetOperatorPillarInsightCard(input: {
  auditUi: boolean;
  pillarId: import('@/lib/platform-core-hub-matrix').CoreHubPillarId;
}): boolean {
  if (input.auditUi) return true;
  return input.pillarId === 'comms';
}

/** Operator cabinet: hide in-sync published-count mirror — show only drift or audit. */
export function shouldShowHubCabinetPublishedCountSyncBadge(
  auditUi: boolean,
  inSync: boolean
): boolean {
  return auditUi || !inSync;
}

/** Workspace operator: golden-path / peer strips — audit mode only (sidebar replaces nav). */
export function shouldShowPlatformCoreWorkspaceGoldenPathStrips(auditUi: boolean): boolean {
  return auditUi;
}
