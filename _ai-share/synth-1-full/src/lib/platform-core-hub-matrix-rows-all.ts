/**
 * Platform Core · комбинированный список hub-строк (baseline + extended).
 *
 * baseline (brand + shop) — всегда; extended (manufacturer + supplier) —
 * склеиваются здесь для внутренних резолверов (find по id, счётчики, тесты).
 * UI-фильтрация по флагу `NEXT_PUBLIC_PC_EXTENDED_ROLES` — в `getPlatformCoreHubRowsForUi()`
 * / `filterPlatformCoreHubRowsForBaseline()`.
 */
import type { CoreHubRoleRow } from '@/lib/platform-core-hub-matrix.types';
import { PLATFORM_CORE_BASELINE_ROWS } from '@/lib/platform-core-hub-matrix-rows';
import { PLATFORM_CORE_EXTENDED_ROWS } from '@/lib/platform-core-hub-matrix-rows-extended';

export { PLATFORM_CORE_BASELINE_ROWS } from '@/lib/platform-core-hub-matrix-rows';
export { PLATFORM_CORE_EXTENDED_ROWS } from '@/lib/platform-core-hub-matrix-rows-extended';

/** Все строки hub (4 роли). Для UI используйте `getPlatformCoreHubRowsForUi()`. */
export const PLATFORM_CORE_HUB_ROWS: readonly CoreHubRoleRow[] = [
  ...PLATFORM_CORE_BASELINE_ROWS,
  ...PLATFORM_CORE_EXTENDED_ROWS,
];
