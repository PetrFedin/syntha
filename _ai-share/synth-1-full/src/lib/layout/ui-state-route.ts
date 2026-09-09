import { isCabinetPathname } from '@/lib/layout/cabinet-route-match';
import { isInvestorBriefPathname } from '@/lib/investors/investor-brief-route';

/**
 * Хабы, где useUIState нужен только на страницах настроек (pulseMode).
 */
const UI_STATE_SETTINGS_ONLY_PREFIXES = ['/factory', '/distributor', '/admin', '/shop'] as const;

/** Client: UI state только на me / wishlist / outfits — не на весь кабинет. */
const CLIENT_UI_STATE_PREFIXES = ['/client/me', '/client/wishlist', '/client/my-outfits'] as const;

/** Кабинеты без useUIState в дереве страниц. */
const UI_STATE_SKIP_CABINET_PREFIXES = ['/academy', '/wallet'] as const;

function isSettingsPathname(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return (
    normalized.endsWith('/settings') ||
    normalized.includes('/settings/') ||
    normalized === '/settings'
  );
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  const root = prefix.replace(/\/$/, '') || '/';
  return pathname === root || pathname.startsWith(`${root}/`);
}

/**
 * Нужен ли `UIStateProvider` (~690 строк + products + cart repos).
 * Brand — всегда; factory/distributor/admin/shop — только settings;
 * client — me/wishlist/outfits; academy/wallet и investor brief — нет.
 */
export function shouldMountUIStateProvider(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  if (isInvestorBriefPathname(pathname)) return false;
  if (!isCabinetPathname(pathname)) return true;

  const normalized = pathname.replace(/\/$/, '') || '/';

  if (normalized.startsWith('/brand')) return true;

  /** Calendar pages (StyleCalendar → useUserInsights) on light cabinets. */
  if (normalized.endsWith('/calendar') || normalized.includes('/calendar/')) {
    return true;
  }

  if (UI_STATE_SKIP_CABINET_PREFIXES.some((p) => matchesPrefix(normalized, p))) {
    return false;
  }

  if (normalized.startsWith('/client')) {
    return CLIENT_UI_STATE_PREFIXES.some((p) => matchesPrefix(normalized, p));
  }

  /** Shop B2B pages используют b2b/showroom компоненты с useUIState. */
  if (normalized.startsWith('/shop/b2b')) return true;

  const isSettingsOnlyHub = UI_STATE_SETTINGS_ONLY_PREFIXES.some((prefix) =>
    matchesPrefix(normalized, prefix)
  );

  if (!isSettingsOnlyHub) return true;
  return isSettingsPathname(normalized);
}
