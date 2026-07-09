import type { ComponentType } from 'react';

export type PlatformCoreSharedUiComponentId =
  | 'section_header'
  | 'data_table'
  | 'empty_state';

export type PlatformCoreSharedUiComponentManifestItem = {
  componentId: PlatformCoreSharedUiComponentId;
  componentName: string;
  importPath: string;
  replacesRu: readonly string[];
  requiredFor: readonly string[];
  migrationRuleRu: string;
};

/**
 * Canonical shared UI building blocks for Platform Core.
 *
 * Cursor must prefer these components when migrating visible Brand/Shop surfaces.
 * This avoids creating new local headers, table shells and empty states per screen.
 */
export const PLATFORM_CORE_SHARED_UI_MANIFEST: readonly PlatformCoreSharedUiComponentManifestItem[] = [
  {
    componentId: 'section_header',
    componentName: 'PlatformCoreSectionHeader',
    importPath: '@/components/platform/shared/PlatformCoreSectionHeader',
    replacesRu: ['локальные заголовки секций', 'hero header в рабочих кабинетах', 'дубли primary CTA'],
    requiredFor: ['visible section header', 'pillar workspace header', 'registry header'],
    migrationRuleRu:
      'Каждая видимая секция Platform Core должна иметь один compact header с одним primaryAction и вторичными действиями без конкуренции.',
  },
  {
    componentId: 'data_table',
    componentName: 'PlatformCoreDataTable',
    importPath: '@/components/platform/shared/PlatformCoreDataTable',
    replacesRu: ['локальные table shells', 'разные registry wrappers', 'несогласованные list containers'],
    requiredFor: ['order registry', 'article registry', 'tracking list', 'documents list'],
    migrationRuleRu:
      'Табличные списки и реестры должны использовать PlatformCoreDataTable как оболочку, сохраняя доменную разметку внутри children.',
  },
  {
    componentId: 'empty_state',
    componentName: 'PlatformCoreEmptyState',
    importPath: '@/components/platform/shared/PlatformCoreEmptyState',
    replacesRu: ['пустые блоки без объяснения', 'No data заглушки', 'декоративные coming soon cards'],
    requiredFor: ['empty registry', 'empty section', 'hidden pending workflow explanation'],
    migrationRuleRu:
      'Пустое состояние обязано объяснять причину пустоты и давать одно следующее действие по lifecycle.',
  },
] as const;

export function getPlatformCoreSharedUiManifestItem(componentId: PlatformCoreSharedUiComponentId) {
  return PLATFORM_CORE_SHARED_UI_MANIFEST.find((item) => item.componentId === componentId);
}

export function getPlatformCoreSharedUiComponentNames(): string[] {
  return PLATFORM_CORE_SHARED_UI_MANIFEST.map((item) => item.componentName);
}

/** Type-only helper for future compile-time component registry wiring. */
export type PlatformCoreSharedUiComponentRegistry = Partial<
  Record<PlatformCoreSharedUiComponentId, ComponentType<unknown>>
>;
