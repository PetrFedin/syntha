/**
 * Platform Core: контекст оптового покупателя (multi-tenant demo).
 * Приоритет: explicit param → cookie → localStorage → default shop1.
 */
import type { NextRequest } from 'next/server';

import { SHOP_CORE_DEMO_BUYER_ID } from '@/lib/order/shop-workshop2-b2b-order-ui';

export const SHOP_CORE_BUYER_COOKIE = 'shop_b2b_buyer_id';
export const SHOP_CORE_BUYER_LS_KEY = 'shop_b2b_buyer_id';
export const SHOP_CORE_BUYER_QUERY = 'buyer';
export const SHOP_B2B_CART_SESSION_COOKIE = 'b2b_cart_session';

/** Invite accept flow: partner email → W2 buyer preset (Wave XK). */
export const SHOP_CORE_PARTNER_EMAIL_TO_BUYER_ID: Readonly<Record<string, string>> = {
  'buyer@shop-demo.local': 'shop1',
  'buyer-demo@shop-demo.local': 'shop1',
  'buyer-demo-spb@shop-demo.local': 'shop2',
};

export type ShopCoreBuyerPreset = {
  id: string;
  labelRu: string;
  cityRu?: string;
};

/** Демо-магазины golden path (расширяемо без смены SoT заказов seed). */
export const SHOP_CORE_BUYER_PRESETS: readonly ShopCoreBuyerPreset[] = [
  { id: 'shop1', labelRu: 'Демо-магазин · Москва', cityRu: 'Москва' },
  { id: 'shop2', labelRu: 'Демо-магазин · Санкт-Петербург', cityRu: 'СПб' },
] as const;

const VALID_BUYER_IDS = new Set(SHOP_CORE_BUYER_PRESETS.map((p) => p.id));

/** Platform org / retail partner → W2 buyerId (golden path + onboarding presets). */
export const SHOP_CORE_ORG_TO_BUYER_ID: Readonly<Record<string, string>> = {
  shop1: 'shop1',
  shop2: 'shop2',
  'org-shop-001': 'shop1',
  'org-shop-002': 'shop2',
  'retail_msk_1': 'shop1',
  'retail_msk_2': 'shop2',
  'retail_spb_1': 'shop2',
  'retail_spb_2': 'shop2',
  'buyer-demo': 'shop1',
  'buyer-demo-spb': 'shop2',
};

/** Mock-auth / FastAPI profile uid → W2 buyer preset. */
export const SHOP_CORE_SESSION_UID_TO_BUYER_ID: Readonly<Record<string, string>> = {
  'shop-001': 'shop1',
  'shop-002': 'shop2',
  'shop-buyer': 'shop1',
};

export function resolveShopCoreBuyerIdFromPartnerEmail(
  buyerEmail?: string | null
): string | undefined {
  const email = buyerEmail?.trim().toLowerCase();
  if (!email) return undefined;

  const direct = SHOP_CORE_PARTNER_EMAIL_TO_BUYER_ID[email];
  if (direct && VALID_BUYER_IDS.has(direct)) return direct;

  const localPart = email.split('@')[0]?.trim();
  const fromLocal = localPart ? resolveShopCoreBuyerIdFromOrganization(localPart) : undefined;
  if (fromLocal) return fromLocal;

  if (email.includes('spb') || email.includes('peter') || email.includes('petersburg')) {
    return 'shop2';
  }
  if (email.includes('msk') || email.includes('shop-demo') || email.includes('buyer-demo')) {
    return 'shop1';
  }

  return undefined;
}

export function resolveShopCoreBuyerIdFromSessionUid(
  sessionUid?: string | null
): string | undefined {
  const uid = sessionUid?.trim();
  if (!uid) return undefined;
  const mapped = SHOP_CORE_SESSION_UID_TO_BUYER_ID[uid];
  if (mapped && VALID_BUYER_IDS.has(mapped)) return mapped;
  return undefined;
}

export function resolveShopCoreBuyerIdFromOrganization(
  activeOrganizationId?: string | null
): string | undefined {
  const org = activeOrganizationId?.trim();
  if (!org) return undefined;

  const mapped = SHOP_CORE_ORG_TO_BUYER_ID[org];
  if (mapped && VALID_BUYER_IDS.has(mapped)) return mapped;

  const lower = org.toLowerCase();
  if (
    lower.includes('spb') ||
    lower.includes('peter') ||
    lower.includes('petersburg') ||
    lower.endsWith('-002') ||
    lower.includes('shop2') ||
    lower.includes('shop-2')
  ) {
    return 'shop2';
  }
  if (
    lower.includes('shop') ||
    lower.includes('retail') ||
    lower.startsWith('org-shop') ||
    lower.includes('msk') ||
    lower.includes('shop1') ||
    lower.includes('shop-1')
  ) {
    return 'shop1';
  }

  return undefined;
}

export function isShopCoreBuyerId(value: string | null | undefined): value is string {
  const id = value?.trim();
  return Boolean(id && VALID_BUYER_IDS.has(id));
}

export function normalizeShopCoreBuyerId(
  value: string | null | undefined,
  fallback = SHOP_CORE_DEMO_BUYER_ID
): string {
  const id = value?.trim();
  if (id && VALID_BUYER_IDS.has(id)) return id;
  return fallback;
}

export function shopCoreBuyerLabelRu(buyerId: string): string {
  const preset = SHOP_CORE_BUYER_PRESETS.find((p) => p.id === buyerId);
  return preset?.labelRu ?? buyerId;
}

export function resolveShopCoreBuyerIdFromRequest(
  req: NextRequest,
  explicitBuyerId?: string | null
): string {
  const fromBody = explicitBuyerId?.trim();
  if (fromBody && VALID_BUYER_IDS.has(fromBody)) return fromBody;

  const fromQuery = req.nextUrl.searchParams.get(SHOP_CORE_BUYER_QUERY)?.trim();
  if (fromQuery && VALID_BUYER_IDS.has(fromQuery)) return fromQuery;

  const fromOrgHeader = req.headers.get('x-w2-organization-id')?.trim();
  const fromOrg = resolveShopCoreBuyerIdFromOrganization(fromOrgHeader);
  if (fromOrg) return fromOrg;

  const fromActorHeader = req.headers.get('x-w2-actor-id')?.trim();
  const fromSession = resolveShopCoreBuyerIdFromSessionUid(fromActorHeader);
  if (fromSession) return fromSession;

  const fromCookie = req.cookies.get(SHOP_CORE_BUYER_COOKIE)?.value?.trim();
  if (fromCookie && VALID_BUYER_IDS.has(fromCookie)) return fromCookie;

  return SHOP_CORE_DEMO_BUYER_ID;
}

export function resolveShopCoreBuyerIdFromClient(input?: {
  searchBuyer?: string | null;
  cookieBuyer?: string | null;
  storageBuyer?: string | null;
  activeOrganizationId?: string | null;
  sessionUid?: string | null;
}): string {
  const fromOrg = resolveShopCoreBuyerIdFromOrganization(input?.activeOrganizationId);
  const fromSession = resolveShopCoreBuyerIdFromSessionUid(input?.sessionUid);
  return normalizeShopCoreBuyerId(
    input?.searchBuyer ?? fromOrg ?? fromSession ?? input?.cookieBuyer ?? input?.storageBuyer ?? null
  );
}

export function readShopCoreBuyerIdFromDocumentCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${SHOP_CORE_BUYER_COOKIE}=([^;]+)`)
  );
  return match?.[1] ? decodeURIComponent(match[1]).trim() : undefined;
}

export function persistShopCoreBuyerIdClient(buyerId: string): void {
  const id = normalizeShopCoreBuyerId(buyerId);
  if (typeof document !== 'undefined') {
    document.cookie = `${SHOP_CORE_BUYER_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SHOP_CORE_BUYER_LS_KEY, id);
    } catch {
      /* ignore */
    }
  }
}

export function readShopCoreBuyerIdFromLocalStorage(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem(SHOP_CORE_BUYER_LS_KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
}
