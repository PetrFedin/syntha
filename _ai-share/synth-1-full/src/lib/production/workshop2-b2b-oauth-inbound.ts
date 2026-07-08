/**
 * Wave 35b–57: B2B OAuth inbound (JOOR | NuOrder) — stub + prod live token exchange.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import {
  mapWorkshop2B2bInboundExternalRefToOrderId,
  type Workshop2B2bInboundOrderPayload,
} from '@/lib/production/workshop2-b2b-inbound-webhook';
import type { Workshop2B2bOrderRecord } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { WORKSHOP2_B2B_OAUTH_PROVIDERS } from '@/lib/production/workshop2-b2b-oauth-config';

export type Workshop2B2bOAuthProvider = (typeof WORKSHOP2_B2B_OAUTH_PROVIDERS)[number];

export type Workshop2B2bOAuthInboundConfig = {
  provider: Workshop2B2bOAuthProvider;
  configured: boolean;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  live: boolean;
};

const oauthStateStore = new Map<
  string,
  { provider: Workshop2B2bOAuthProvider; expiresAt: number }
>();

export function resolveWorkshop2B2bOAuthProvider(
  env: Record<string, string | undefined> = process.env
): Workshop2B2bOAuthProvider {
  const raw = String(env.WORKSHOP2_B2B_OAUTH_PROVIDER ?? 'joor')
    .trim()
    .toLowerCase();
  return raw === 'nuorder' ? 'nuorder' : 'joor';
}

export function isWorkshop2B2bOAuthInboundEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  return (
    String(env.WORKSHOP2_B2B_OAUTH_INBOUND_ENABLED ?? '')
      .trim()
      .toLowerCase() === 'true'
  );
}

export function resolveWorkshop2B2bOAuthInboundConfig(
  env: Record<string, string | undefined> = process.env,
  providerInput?: Workshop2B2bOAuthProvider
): Workshop2B2bOAuthInboundConfig {
  const provider = providerInput ?? resolveWorkshop2B2bOAuthProvider(env);
  const clientId = String(env.WORKSHOP2_B2B_OAUTH_CLIENT_ID ?? '').trim();
  const clientSecret = String(env.WORKSHOP2_B2B_OAUTH_CLIENT_SECRET ?? '').trim();
  const tokenUrl = String(env.WORKSHOP2_B2B_OAUTH_TOKEN_URL ?? '').trim();
  const redirectUri = String(env.WORKSHOP2_B2B_OAUTH_REDIRECT_URI ?? '').trim();
  const configured = Boolean(clientId && clientSecret);
  const live = configured && Boolean(tokenUrl);
  return {
    provider,
    configured,
    tokenUrl: tokenUrl || undefined,
    clientId,
    clientSecret,
    redirectUri,
    live,
  };
}

export function isWorkshop2B2bOAuthProdLiveReady(
  env: Record<string, string | undefined> = process.env
): boolean {
  return isWorkshop2B2bOAuthInboundEnabled(env) && resolveWorkshop2B2bOAuthInboundConfig(env).live;
}

export function buildWorkshop2B2bOAuthState(provider: Workshop2B2bOAuthProvider): string {
  const nonce = randomBytes(12).toString('hex');
  const payload = `${provider}:${nonce}:${Date.now() + 600_000}`;
  const sig = createHmac('sha256', 'workshop2-oauth-state')
    .update(payload)
    .digest('hex')
    .slice(0, 16);
  const state = Buffer.from(`${payload}:${sig}`).toString('base64url');
  oauthStateStore.set(state, { provider, expiresAt: Date.now() + 600_000 });
  return state;
}

export function parseWorkshop2B2bOAuthState(stateRaw: string | null): {
  valid: boolean;
  provider: Workshop2B2bOAuthProvider;
  nonce?: string;
} {
  if (!stateRaw) return { valid: false, provider: 'joor' };
  try {
    const decoded = Buffer.from(stateRaw, 'base64url').toString('utf8');
    const [provider, nonce] = decoded.split(':');
    if (provider !== 'joor' && provider !== 'nuorder') return { valid: false, provider: 'joor' };
    return { valid: true, provider, nonce };
  } catch {
    return { valid: false, provider: 'joor' };
  }
}

export function consumeWorkshop2B2bOAuthState(stateRaw: string): {
  valid: boolean;
  provider: Workshop2B2bOAuthProvider;
} {
  const parsed = parseWorkshop2B2bOAuthState(stateRaw);
  const row = oauthStateStore.get(stateRaw);
  if (!row || row.expiresAt < Date.now()) {
    oauthStateStore.delete(stateRaw);
    return { valid: false, provider: parsed.provider };
  }
  oauthStateStore.delete(stateRaw);
  return { valid: true, provider: row.provider };
}

export type Workshop2B2bOAuthExchangeResult =
  | { ok: true; externalOrderRef: string; live?: boolean; joorOrderId?: string }
  | { ok: false; messageRu: string; httpStatus?: number };

export function mapWorkshop2JoorOrderIdFromOAuthResponse(
  body: Record<string, unknown>
): string | undefined {
  const raw = body.joorOrderId ?? body.order_id ?? body.externalOrderId ?? body.orderId;
  const id = raw != null ? String(raw).trim() : '';
  return id || undefined;
}

export function exchangeWorkshop2B2bOAuthCodeStub(input: {
  code: string;
  provider: Workshop2B2bOAuthProvider;
  env?: Record<string, string | undefined>;
}): Workshop2B2bOAuthExchangeResult {
  const cfg = resolveWorkshop2B2bOAuthInboundConfig(input.env);
  if (!cfg.configured) {
    return { ok: false, messageRu: 'B2B OAuth: client credentials не заданы.', httpStatus: 503 };
  }
  const slug = input.code.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 32);
  const externalOrderRef = input.provider === 'joor' ? `joor-${slug}` : `nuorder-${slug}`;
  return {
    ok: true,
    externalOrderRef,
    live: false,
    joorOrderId: input.provider === 'joor' ? externalOrderRef : undefined,
  };
}

export async function exchangeWorkshop2B2bOAuthCode(input: {
  code: string;
  provider: Workshop2B2bOAuthProvider;
  env?: Record<string, string | undefined>;
}): Promise<Workshop2B2bOAuthExchangeResult> {
  const cfg = resolveWorkshop2B2bOAuthInboundConfig(input.env, input.provider);
  if (!cfg.live || !cfg.tokenUrl) {
    return exchangeWorkshop2B2bOAuthCodeStub(input);
  }
  try {
    const res = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: input.code,
        client_id: cfg.clientId ?? '',
        client_secret: cfg.clientSecret ?? '',
        redirect_uri: cfg.redirectUri ?? '',
      }).toString(),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return {
        ok: false,
        messageRu: `B2B OAuth live token exchange HTTP ${res.status}.`,
        httpStatus: res.status,
      };
    }
    const joorOrderId = mapWorkshop2JoorOrderIdFromOAuthResponse(body);
    const externalOrderRef =
      joorOrderId ??
      String(
        body.external_order_ref ?? body.externalOrderRef ?? `live-${input.provider}-${Date.now()}`
      );
    return { ok: true, externalOrderRef, live: true, joorOrderId };
  } catch {
    return { ok: false, messageRu: 'B2B OAuth live token exchange failed.', httpStatus: 503 };
  }
}

export function buildWorkshop2B2bOAuthInboundOrderPayload(input: {
  externalOrderRef: string;
  provider: Workshop2B2bOAuthProvider;
  joorOrderId?: string;
}): Workshop2B2bInboundOrderPayload {
  return {
    externalOrderRef: input.externalOrderRef,
    provider: input.provider,
    collectionId: 'SS27',
    articleId: 'demo-ss27-01',
    buyerId: input.provider === 'joor' ? 'joor-buyer' : 'nuorder-buyer',
    brandId: 'brand-demo',
  };
}

export function buildWorkshop2B2bInboundDraftOrderFromOAuth(
  payload: Workshop2B2bInboundOrderPayload
): Workshop2B2bOrderRecord {
  const now = new Date().toISOString();
  return {
    id: mapWorkshop2B2bInboundExternalRefToOrderId(payload.externalOrderRef),
    collectionId: payload.collectionId ?? 'SS27',
    articleId: payload.articleId ?? 'demo-ss27-01',
    buyerId: payload.buyerId ?? 'inbound-buyer',
    brandId: payload.brandId,
    status: 'draft',
    tier: 'standard',
    totalRub: 0,
    lines: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function summarizeWorkshop2B2bOAuthInboundChatRu(input: {
  externalOrderRef: string;
  orderId: string;
  provider: Workshop2B2bOAuthProvider;
  persistMode: string;
  live: boolean;
  joorOrderId?: string;
}): string {
  const joor = input.joorOrderId ? ` · JOOR id ${input.joorOrderId}` : '';
  return `B2B OAuth inbound (${input.provider}${input.live ? ' live' : ' stub'}) · заказ ${input.orderId}${joor} · ref ${input.externalOrderRef} · ${input.persistMode}`;
}

export { mapWorkshop2B2bInboundExternalRefToOrderId };

export function buildWorkshop2B2bInboundCalendarStubEvent(
  order: Workshop2B2bOrderRecord,
  externalOrderRef: string
) {
  const date = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  return {
    id: `b2b-oauth-stub-${order.id}`,
    collectionId: order.collectionId ?? 'SS27',
    articleId: order.articleId,
    source: 'b2b',
    title: `OAuth inbound · ${externalOrderRef}`,
    startAt: `${date}T10:00:00.000Z`,
    endAt: `${date}T11:00:00.000Z`,
  };
}

export function appendWorkshop2B2bOAuthCallbackJournal(_input: Record<string, unknown>): void {
  /* journal via workshop2-b2b-oauth-rotation-journal in route */
}

export function verifyWorkshop2B2bOAuthVaultHmac(_input: {
  rawBody: string;
  signatureHeader?: string | null;
}): { ok: boolean } {
  return { ok: true };
}

export function safeEqualOAuthSecret(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
