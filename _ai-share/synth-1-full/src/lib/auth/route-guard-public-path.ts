import { isInvestorBriefPathname } from '@/lib/investors/investor-brief-route';

/**
 * Маршруты без RBAC-редиректа в RouteGuard (unauthenticated OK).
 * Согласовано с `shouldEagerAuthBootstrap` для login/auth; public shell шире.
 */
export function isRouteGuardPublicPath(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  return (
    pathname === '/' ||
    pathname === '/platform' ||
    pathname.startsWith('/platform/') ||
    isInvestorBriefPathname(pathname) ||
    pathname.startsWith('/b/') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/o/') ||
    pathname.startsWith('/s/')
  );
}
