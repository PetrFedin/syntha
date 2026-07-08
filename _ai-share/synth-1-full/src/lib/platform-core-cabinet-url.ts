/**
 * URL helpers для входа в core-кабинеты — отдельный модуль без цикла hub-matrix ↔ cabinet-workspace.
 */
import { getDefaultPillarForRole } from '@/lib/platform-core-hub-matrix';
import type { CoreChainRoleId } from '@/lib/platform-core-hub-matrix';
import {
  hasEmbeddedPlatformCoreWorkspace,
  PLATFORM_CORE_CABINET_DEFAULT_SECTION,
  roleCoreCabinetHref,
} from '@/lib/platform-core-cabinet-workspace';

export function roleCoreCabinetLandingHref(roleId: CoreChainRoleId): string {
  const pillarId = getDefaultPillarForRole(roleId);
  const sectionId = hasEmbeddedPlatformCoreWorkspace(roleId, pillarId)
    ? (PLATFORM_CORE_CABINET_DEFAULT_SECTION[roleId]?.[pillarId] ?? null)
    : null;
  return roleCoreCabinetHref({ roleId, pillarId, sectionId });
}
