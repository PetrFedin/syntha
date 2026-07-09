import type { PlatformCoreSharedUiComponentId } from '@/lib/platform-core-shared-ui-manifest';
import type { PlatformCoreUiSurfaceStatus } from '@/lib/platform-core-ui-surface-manifest';
import { PLATFORM_CORE_UI_SURFACE_MANIFEST } from '@/lib/platform-core-ui-surface-manifest';

export type PlatformCoreWorkspaceMigrationStatus =
  | 'CANONICAL_READY'
  | 'NEEDS_SURFACE_LOCATOR'
  | 'NEEDS_SHARED_UI_MIGRATION'
  | 'BLOCKED_BY_PENDING_FLOW';

export type PlatformCoreWorkspaceMigrationItem = {
  sectionId: string;
  surfaceStatus: PlatformCoreUiSurfaceStatus;
  migrationStatus: PlatformCoreWorkspaceMigrationStatus;
  requiredSharedUi: readonly PlatformCoreSharedUiComponentId[];
  noteRu: string;
};

function inferMigrationStatus(surfaceStatus: PlatformCoreUiSurfaceStatus): PlatformCoreWorkspaceMigrationStatus {
  if (surfaceStatus === 'CORE_WORKING') return 'NEEDS_SURFACE_LOCATOR';
  if (surfaceStatus === 'CORE_PARTIAL') return 'NEEDS_SHARED_UI_MIGRATION';
  return 'BLOCKED_BY_PENDING_FLOW';
}

function inferRequiredSharedUi(sectionId: string): readonly PlatformCoreSharedUiComponentId[] {
  if (sectionId.includes('registry') || sectionId.includes('matrix') || sectionId.includes('tracking')) {
    return ['section_header', 'data_table', 'empty_state'];
  }
  if (sectionId.includes('chat') || sectionId.includes('calendar') || sectionId.includes('notes')) {
    return ['section_header', 'empty_state'];
  }
  return ['section_header', 'empty_state'];
}

export const PLATFORM_CORE_WORKSPACE_UI_MIGRATION: readonly PlatformCoreWorkspaceMigrationItem[] =
  PLATFORM_CORE_UI_SURFACE_MANIFEST.map((surface) => ({
    sectionId: surface.sectionId,
    surfaceStatus: surface.status,
    migrationStatus: inferMigrationStatus(surface.status),
    requiredSharedUi: inferRequiredSharedUi(surface.sectionId),
    noteRu:
      surface.status === 'CORE_WORKING'
        ? 'Найти фактический workspace/component и перевести header/empty/table shell без изменения бизнес-логики.'
        : 'Сначала закрыть functional gap, затем мигрировать на shared UI shells.',
  }));

export function getPlatformCoreWorkspaceMigrationBySectionId(sectionId: string) {
  return PLATFORM_CORE_WORKSPACE_UI_MIGRATION.find((item) => item.sectionId === sectionId);
}

export function getPlatformCoreWorkspaceMigrationBlockers(): readonly PlatformCoreWorkspaceMigrationItem[] {
  return PLATFORM_CORE_WORKSPACE_UI_MIGRATION.filter(
    (item) => item.migrationStatus !== 'CANONICAL_READY'
  );
}

export function getPlatformCoreWorkspaceMigrationCountByStatus(
  status: PlatformCoreWorkspaceMigrationStatus
): number {
  return PLATFORM_CORE_WORKSPACE_UI_MIGRATION.filter((item) => item.migrationStatus === status).length;
}
