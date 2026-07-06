/**
 * Platform Core strict route guard — page allowlist при STRICT=1.
 * API не блокируем (ports/workshop2 bridge); режем только legacy UI navigation.
 *
 * Не импортирует `platform-core-routes` (избегаем цикла с native-href).
 */

import {
  PLATFORM_CORE_B2B_BASE,
  isPlatformCoreB2bHubPath,
} from '@/lib/platform-core-mode-surfaces';

/** Канонические core-cabinet пути (дублируют subset platform-core-routes). */
export const PLATFORM_CORE_STRICT_CABINET_PATHS = {
  brandCore: '/brand/core',
  shopCore: '/shop/core',
  factoryProductionCore: '/factory/production/core',
  factorySupplierCore: '/factory/supplier/core',
  brandMessages: '/brand/messages',
  shopMessages: '/shop/messages',
  factoryProductionMessages: '/factory/production/messages',
  factorySupplierMessages: '/factory/supplier/messages',
} as const;

const CORE_PAGE_PREFIXES = [
  '/platform',
  PLATFORM_CORE_STRICT_CABINET_PATHS.brandCore,
  PLATFORM_CORE_STRICT_CABINET_PATHS.shopCore,
  PLATFORM_CORE_STRICT_CABINET_PATHS.factoryProductionCore,
  PLATFORM_CORE_STRICT_CABINET_PATHS.factorySupplierCore,
  '/factory/production/dossier/',
  '/factory/supplier/rfq-inbox',
  '/brand/b2b-orders/',
  '/shop/b2b/orders/',
  PLATFORM_CORE_STRICT_CABINET_PATHS.brandMessages,
  PLATFORM_CORE_STRICT_CABINET_PATHS.shopMessages,
  PLATFORM_CORE_STRICT_CABINET_PATHS.factoryProductionMessages,
  PLATFORM_CORE_STRICT_CABINET_PATHS.factorySupplierMessages,
  '/login',
  '/auth',
  '/client',
] as const;

function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';
  return p;
}

/** Страницы, разрешённые в strict daily dev (native + core split). */
export function isPlatformCoreStrictPageAllowed(pathname: string): boolean {
  const path = normalizePath(pathname);

  if (path === '/platform' || path.startsWith('/platform/')) return true;
  if (isPlatformCoreB2bHubPath(path)) return true;
  if (path === PLATFORM_CORE_B2B_BASE) return true;

  for (const prefix of CORE_PAGE_PREFIXES) {
    if (path === prefix || path.startsWith(prefix)) return true;
  }

  return false;
}

export function buildPlatformCoreStrictRedirectUrl(fromPath: string): string {
  const sp = new URLSearchParams({ archived: '1', from: fromPath });
  return `/platform?${sp.toString()}`;
}
