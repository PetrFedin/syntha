/**
 * Wave 29: tier байера из invite token (cookie → localStorage).
 */
import type { Workshop2B2bBuyerTier } from '@/lib/production/workshop2-b2b-campaign-hub';
import { isWorkshop2B2bBuyerTier } from '@/lib/production/workshop2-b2b-campaign-hub';
import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';

export const B2B_PARTNER_TIER_COOKIE = 'b2b_partner_tier';
export const B2B_PARTNER_TIER_STORAGE_KEY = 'b2b_partner_tier';
export const B2B_PARTNER_SESSION_STORAGE_KEY = 'b2b_partner_session';

function readCookieTier(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${B2B_PARTNER_TIER_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Client-only: tier из invite flow, fallback standard. */
export function resolveB2bBuyerTierFromSession(
  fallback: Workshop2B2bBuyerTier = 'standard'
): Workshop2B2bBuyerTier {
  if (typeof window === 'undefined') return fallback;
  const fromCookie = readCookieTier();
  const fromStorage = shouldUseLocalStorageClientFallbackInCore()
    ? localStorage.getItem(B2B_PARTNER_TIER_STORAGE_KEY)
    : null;
  const raw = (fromCookie ?? fromStorage ?? '').trim();
  return isWorkshop2B2bBuyerTier(raw) ? raw : fallback;
}
