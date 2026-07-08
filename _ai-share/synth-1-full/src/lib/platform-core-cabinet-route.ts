import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export const PLATFORM_CORE_CABINET_PATHS = [
  '/brand/core',
  '/shop/core',
  '/factory/production/core',
  '/factory/supplier/core',
] as const;

export function isPlatformCoreCabinetPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return PLATFORM_CORE_CABINET_PATHS.some((p) => pathname === p);
}

/** В core-демо хаб поставщика доступен любой роли цепочки (инвестор walkthrough). */
export function isPlatformCoreSupplierWalkthroughPath(
  pathname: string | null | undefined
): boolean {
  if (!pathname) return false;
  return pathname === '/factory/supplier';
}

/** Досье цеха в core-демо — walkthrough столпа 4 для любой роли цепочки. */
export function isPlatformCoreDossierWalkthroughPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/factory/production/dossier/');
}

/** В core-демо кабинеты столпов и walkthrough-маршруты доступны любой роли цепочки. */
export function shouldBypassHubRbacForCoreCabinet(pathname: string | null | undefined): boolean {
  if (!isPlatformCoreMode() || !pathname) return false;
  return (
    isPlatformCoreCabinetPath(pathname) ||
    isPlatformCoreSupplierWalkthroughPath(pathname) ||
    isPlatformCoreDossierWalkthroughPath(pathname) ||
    pathname.startsWith('/factory/production/materials') ||
    pathname === '/factory/messages' ||
    pathname === '/factory/production/messages' ||
    pathname === '/factory/supplier/messages' ||
    pathname === '/factory/calendar' ||
    pathname === '/factory/production/calendar'
  );
}

/** Golden path маршруты Platform Core — без dev session banner и recovery chrome. */
export function isPlatformCoreGoldenPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === '/platform') return true;
  if (
    isPlatformCoreCabinetPath(pathname) ||
    isPlatformCoreSupplierWalkthroughPath(pathname) ||
    isPlatformCoreDossierWalkthroughPath(pathname)
  ) {
    return true;
  }
  if (!isPlatformCoreMode()) return false;

  const prefixes = [
    '/brand/linesheets',
    '/brand/showroom',
    '/brand/b2b-orders',
    '/brand/messages',
    '/brand/calendar',
    '/brand/tasks',
    '/brand/range-planner',
    '/brand/production/workshop2',
    '/shop/b2b',
    '/factory/production',
    '/factory/supplier',
    '/factory/messages',
    '/factory/calendar',
  ];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
