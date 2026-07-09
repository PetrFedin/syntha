import {
  PLATFORM_CORE_WORKSPACE_UI_MIGRATION,
  getPlatformCoreWorkspaceMigrationBlockers,
  getPlatformCoreWorkspaceMigrationBySectionId,
  getPlatformCoreWorkspaceMigrationCountByStatus,
} from '@/lib/platform-core-ui-workspace-migration';
import { PLATFORM_CORE_UI_SURFACE_MANIFEST } from '@/lib/platform-core-ui-surface-manifest';
import { getPlatformCoreSharedUiManifestItem } from '@/lib/platform-core-shared-ui-manifest';

describe('Platform Core workspace UI migration tracker', () => {
  it('has exactly one migration item for every visible UI surface', () => {
    const surfaceIds = PLATFORM_CORE_UI_SURFACE_MANIFEST.map((item) => item.sectionId).sort();
    const migrationIds = PLATFORM_CORE_WORKSPACE_UI_MIGRATION.map((item) => item.sectionId).sort();
    expect(migrationIds).toEqual(surfaceIds);
  });

  it('keeps every migration item linked to known shared UI components', () => {
    for (const item of PLATFORM_CORE_WORKSPACE_UI_MIGRATION) {
      expect(item.requiredSharedUi.length).toBeGreaterThanOrEqual(2);
      for (const componentId of item.requiredSharedUi) {
        expect(getPlatformCoreSharedUiManifestItem(componentId)).toBeTruthy();
      }
    }
  });

  it('marks registry, matrix and tracking surfaces as table migrations', () => {
    const tableSections = PLATFORM_CORE_WORKSPACE_UI_MIGRATION.filter((item) =>
      /registry|matrix|tracking/.test(item.sectionId)
    );
    expect(tableSections.length).toBeGreaterThan(0);
    for (const item of tableSections) {
      expect(item.requiredSharedUi).toEqual(
        expect.arrayContaining(['section_header', 'data_table', 'empty_state'])
      );
    }
  });

  it('keeps partial surfaces as shared UI migration work, not done', () => {
    const partialItems = PLATFORM_CORE_WORKSPACE_UI_MIGRATION.filter(
      (item) => item.surfaceStatus === 'CORE_PARTIAL'
    );
    expect(partialItems.length).toBeGreaterThan(0);
    expect(partialItems.every((item) => item.migrationStatus === 'NEEDS_SHARED_UI_MIGRATION')).toBe(
      true
    );
  });

  it('exposes lookup and blocker helpers for Cursor migration work', () => {
    expect(getPlatformCoreWorkspaceMigrationBySectionId('brand-sc-publish')?.migrationStatus).toBe(
      'NEEDS_SHARED_UI_MIGRATION'
    );
    expect(getPlatformCoreWorkspaceMigrationBlockers().length).toBe(
      PLATFORM_CORE_WORKSPACE_UI_MIGRATION.length
    );
    expect(getPlatformCoreWorkspaceMigrationCountByStatus('CANONICAL_READY')).toBe(0);
  });
});
