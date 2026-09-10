const HTTP_PROTOCOLS = new Set(['http:', 'https:']);
const CONTACT_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function normalizeUrl(
  raw: string | null | undefined,
  allowedProtocols: Set<string>,
  stripTracking: boolean
): string | null {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!allowedProtocols.has(url.protocol)) return null;
    if (stripTracking) {
      url.search = '';
      url.hash = '';
    }
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Lightweight public presentation route used for QR / investor / partner access.
 * `/platform` remains the live Platform Core hub and must not be replaced by this route.
 */
export function isInvestorBriefPathname(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/\/$/, '') || '/';
  return normalized === '/investors' || normalized.startsWith('/investors/');
}

/**
 * Canonical URL encoded into the permanent QR.
 * A configured branded URL wins over runtime hosting; query/hash never become
 * part of QR identity so UTM campaigns may change without reprinting the code.
 */
export function resolveCanonicalInvestorUrl(
  configured?: string | null,
  runtimeOrigin?: string | null
): string | null {
  const configuredUrl = normalizeUrl(configured, HTTP_PROTOCOLS, true);
  if (configuredUrl) return configuredUrl;

  const originValue = runtimeOrigin?.trim();
  if (!originValue) return null;

  try {
    const origin = new URL(originValue);
    if (!HTTP_PROTOCOLS.has(origin.protocol)) return null;
    return new URL('/investors', origin).toString();
  } catch {
    return null;
  }
}

export function resolveInvestorContactUrl(configured?: string | null): string | null {
  return normalizeUrl(configured, CONTACT_PROTOCOLS, false);
}
