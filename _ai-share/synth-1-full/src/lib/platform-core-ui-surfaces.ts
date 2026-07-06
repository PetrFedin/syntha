/**
 * Канон поверхностей Platform Core — один оптимальный набор данных на экран.
 * Агенты: не дублировать контекст, статус и CTA между chrome / кабинет / pillar card / cross-role.
 *
 * Цепочка: /platform → role/core (кабинет) → workspace → cross-role (связь ролей).
 */

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export type PlatformCoreUiSurface = 'hub' | 'cabinet' | 'workspace' | 'order-detail';

/** В core-режиме layout-кабинет не дублирует H1/SectionBar — только PlatformCoreContextBar. */
export function shouldSuppressCabinetHubLayoutChrome(): boolean {
  return isPlatformCoreMode();
}

/** Кабинет: только статус + один primary CTA + compact cross-role. */
export function isPlatformCoreCabinetCompact(surface: PlatformCoreUiSurface): boolean {
  return surface === 'cabinet';
}

/** Рабочий экран: breadcrumb + strip + контент + compact cross-role внизу. */
export function isPlatformCoreWorkspaceCompact(surface: PlatformCoreUiSurface): boolean {
  return surface === 'workspace' || surface === 'order-detail';
}

/** Единый набор слоёв на поверхность (что рендерить один раз). */
export const PLATFORM_CORE_SURFACE_LAYERS = {
  /** business: только role-entry-blocks; audit: + matrix оценок */
  hub: ['role-entry-blocks', 'matrix'],
  cabinet: ['context-bar', 'role-strip', 'pillar-nav-aside', 'insight-compact', 'primary-cta', 'cross-role-compact'],
  workspace: ['context-bar', 'pillar-strip', 'page-content', 'cross-role-compact'],
  'order-detail': ['context-bar', 'pillar-strip', 'order-facts', 'cross-role-compact'],
} as const satisfies Record<PlatformCoreUiSurface, readonly string[]>;

/** Запрещённые дубли — агенты проверяют grep перед PR. */
export const PLATFORM_CORE_UI_FORBIDDEN_DUPES = [
  'lead под context-bar на workspace',
  'RegistryPageHeader title/lead на core-path',
  'ShopB2bContentHeader lead на core-path',
  'CardHeader pillar title в compact insight',
  'full variant RolePillarCrossRoleLinks',
  'cross-role выше контента страницы',
  'повтор orderId/PO в facts и context-bar',
  'CabinetHubTitleRow / CabinetHubSectionBar при platform core',
  'BrandSectionHeaderBlock / StageContextBar при platform core',
  'BrandMessagesRuWorkspaceBanner при platform core comms',
  'PlatformCorePillarHandoffStrip (удалён — дубль cross-role)',
  'CardHeader коллекции/столпа на workspace при slim ListChrome',
  'CommsNotificationCenterStrip + OrderCommsWorkspaceNotificationBar на одном экране',
] as const;
