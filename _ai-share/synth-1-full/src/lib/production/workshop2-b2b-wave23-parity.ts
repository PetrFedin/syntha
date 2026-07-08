/**
 * Wave 23: B2B full JOOR/NuOrder parity — cart, compare, qty breaks, invites,
 * prebook validation, development gate on submit, campaign chat context.
 */
import { evaluateWorkshop2BulkShowroomPublishForArticle } from '@/lib/production/workshop2-bulk-showroom-publish';
import {
  buildWorkshop2Erp1cCommerceMlFragment,
  buildWorkshop2Erp1cExportPayload,
} from '@/lib/production/workshop2-erp-1c-stub';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type {
  Workshop2B2bOrderLine,
  Workshop2B2bOrderRecord,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import type { Workshop2ShowroomLinesheetPayload } from '@/lib/production/workshop2-showroom-linesheet-payload';
import type { Workshop2ShowroomCampaign } from '@/lib/server/workshop2-showroom-repository';

export type Workshop2B2bQtyPriceBreak = {
  minQty: number;
  priceRub: number;
};

export type Workshop2B2bCartLine = Workshop2B2bOrderLine & {
  lineNote?: string;
  deliveryDate?: string;
  /** Wave 29: presign/vault hero для UI корзины. */
  heroImageUrl?: string;
  /** Wave 32: brand scope — checkout rejects mixed brands (409). */
  brandId?: string;
};

export type Workshop2B2bCartSession = {
  sessionId: string;
  buyerId?: string;
  /** Wave 32: единый brandId сессии (derived from first line). */
  brandId?: string;
  tier: 'standard' | 'vip' | 'prebook';
  lines: Workshop2B2bCartLine[];
  updatedAt: string;
};

const cartSessions = new Map<string, Workshop2B2bCartSession>();
const inviteTokens = new Map<
  string,
  { buyerEmail: string; tier: Workshop2B2bCartSession['tier']; createdAt: string; usedAt?: string }
>();

export function clearWorkshop2B2bCartMemoryForTests(): void {
  cartSessions.clear();
  inviteTokens.clear();
}

/** Wave 32: default brand для B2B cart (roadmap multi-brand split). */
export function resolveWorkshop2B2bDefaultBrandId(
  env: Record<string, string | undefined> = process.env
): string {
  return String(env.WORKSHOP2_DEFAULT_BRAND_ID ?? 'syntha-lab').trim() || 'syntha-lab';
}

export function resolveWorkshop2B2bCartLineBrandId(input: {
  line: Pick<Workshop2B2bCartLine, 'brandId' | 'collectionId'>;
  env?: Record<string, string | undefined>;
}): string {
  return input.line.brandId?.trim() || resolveWorkshop2B2bDefaultBrandId(input.env);
}

/** Wave 32: checkout gate — одна корзина = один brandId. */
export function evaluateWorkshop2B2bCartMixedBrandGate(input: {
  session: Workshop2B2bCartSession;
  env?: Record<string, string | undefined>;
}): { allowed: true; brandId: string } | { allowed: false; messageRu: string; brandIds: string[] } {
  const env = input.env ?? process.env;
  const brandIds = [
    ...new Set(
      input.session.lines.map((l) => resolveWorkshop2B2bCartLineBrandId({ line: l, env }))
    ),
  ];
  if (brandIds.length <= 1) {
    return { allowed: true, brandId: brandIds[0] ?? resolveWorkshop2B2bDefaultBrandId(env) };
  }
  return {
    allowed: false,
    brandIds,
    messageRu: `${brandIds.length} бренда — оформите отдельно (${brandIds.join(', ')}). Используйте «Разделить по брендам» на checkout или POST /api/shop/b2b/cart/split-by-brand.`,
  };
}

/** Wave 33: split mixed-brand cart into per-brand sessions for rep checkout. */
export function splitWorkshop2B2bCartByBrand(input: {
  session: Workshop2B2bCartSession;
  env?: Record<string, string | undefined>;
}): {
  sourceSessionId: string;
  sessions: Array<{ brandId: string; sessionId: string; lines: Workshop2B2bCartLine[] }>;
} {
  const env = input.env ?? process.env;
  const byBrand = new Map<string, Workshop2B2bCartLine[]>();
  for (const line of input.session.lines) {
    const brandId = resolveWorkshop2B2bCartLineBrandId({ line, env });
    const bucket = byBrand.get(brandId) ?? [];
    bucket.push({ ...line, brandId });
    byBrand.set(brandId, bucket);
  }
  const now = new Date().toISOString();
  const sessions = [...byBrand.entries()].map(([brandId, lines]) => {
    const sessionId = `${input.session.sessionId.trim()}::brand::${brandId}`;
    const child: Workshop2B2bCartSession = {
      sessionId,
      buyerId: input.session.buyerId,
      brandId,
      tier: input.session.tier,
      lines,
      updatedAt: now,
    };
    cartSessions.set(sessionId, child);
    return { brandId, sessionId, lines };
  });
  return { sourceSessionId: input.session.sessionId, sessions };
}

/** Wave 33: client-side mixed-brand summary from arbitrary cart lines (checkout UI). */
export function summarizeWorkshop2B2bMixedBrandCheckoutRu(input: {
  lines: Array<Pick<Workshop2B2bCartLine, 'brandId' | 'collectionId'>>;
  env?: Record<string, string | undefined>;
}): { mixed: boolean; brandCount: number; brandIds: string[]; headlineRu: string } {
  const env = input.env ?? process.env;
  const brandIds = [
    ...new Set(input.lines.map((l) => resolveWorkshop2B2bCartLineBrandId({ line: l, env }))),
  ];
  const mixed = brandIds.length > 1;
  const headlineRu = mixed
    ? `${brandIds.length} бренда — оформите отдельно`
    : 'Один бренд — можно оформить заказ';
  return { mixed, brandCount: brandIds.length, brandIds, headlineRu };
}

export function resolveWorkshop2B2bBestWholesalePriceRub(input: {
  totalQty: number;
  basePriceRub: number;
  qtyBreaks?: Workshop2B2bQtyPriceBreak[];
}): number {
  const qty = Math.max(0, Math.round(input.totalQty));
  const base = Math.max(0, Math.round(input.basePriceRub));
  const breaks = [...(input.qtyBreaks ?? [])].sort((a, b) => b.minQty - a.minQty);
  for (const tier of breaks) {
    if (qty >= tier.minQty && tier.priceRub > 0) return Math.round(tier.priceRub);
  }
  return base;
}

export function buildWorkshop2B2bLinesheetVersionLabel(input: {
  campaignName?: string;
  version?: number;
  supersedesId?: string;
}): string {
  const name = input.campaignName?.trim() || 'Кампания';
  const ver = input.version != null && input.version > 0 ? ` v${input.version}` : '';
  const superseded = input.supersedesId?.trim() ? ` (заменяет ${input.supersedesId})` : '';
  return `${name}${ver}${superseded}`;
}

export function parseWorkshop2B2bCompareArticleIds(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return [
    ...new Set(
      raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ].slice(0, 3);
}

export function validateWorkshop2B2bPrebookDeliveryDate(input: {
  deliveryDate: string;
  preorderWindow?: Workshop2ShowroomLinesheetPayload['preorderWindowRu'];
}): { ok: true } | { ok: false; messageRu: string } {
  const date = input.deliveryDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, messageRu: 'Дата поставки: формат YYYY-MM-DD.' };
  }
  const start = input.preorderWindow?.startDate?.trim();
  const end = input.preorderWindow?.endDate?.trim();
  if (start && date < start) {
    return {
      ok: false,
      messageRu: `Дата ${date} раньше окна предзаказа (с ${start}).`,
    };
  }
  if (end && date > end) {
    return {
      ok: false,
      messageRu: `Дата ${date} позже окна предзаказа (до ${end}).`,
    };
  }
  return { ok: true };
}

export function evaluateWorkshop2B2bCartSubmitDevelopmentGate(input: {
  dossier: Workshop2DossierPhase1;
  articleId: string;
  collectionId?: string;
}): { allowed: true } | { allowed: false; messageRu: string } {
  const gate = evaluateWorkshop2BulkShowroomPublishForArticle({
    articleId: input.articleId,
    collectionId: input.collectionId,
    dossier: input.dossier,
    publish: { published: true },
  });
  if (gate.passed) return { allowed: true };
  return {
    allowed: false,
    messageRu:
      gate.reasons[0] ??
      'Артикул не готов к шоуруму — завершите gate разработки W2 перед отправкой заказа.',
  };
}

export function collectWorkshop2B2bCartMoqViolations(
  session: Pick<Workshop2B2bCartSession, 'lines'>
): string[] {
  const violations: string[] = [];
  for (const line of session.lines) {
    if (line.qty <= 0) continue;
    const moq = Math.max(1, line.moq ?? 1);
    if (line.qty < moq) {
      violations.push(
        `${line.articleId} · ${line.colorCode}/${line.size}: MOQ ${moq} шт., указано ${line.qty}`
      );
    }
  }
  return violations;
}

export function collectWorkshop2B2bOrderLineMoqViolations(
  lines: Workshop2B2bOrderLine[]
): string[] {
  return collectWorkshop2B2bCartMoqViolations({ lines });
}

export function getWorkshop2B2bCartSession(sessionId: string): Workshop2B2bCartSession | null {
  return cartSessions.get(sessionId.trim()) ?? null;
}

/** Восстановление сессии из file-store (dev HMR / e2e). */
export function hydrateWorkshop2B2bCartSession(session: Workshop2B2bCartSession): void {
  const sid = session.sessionId?.trim();
  if (!sid) return;
  cartSessions.set(sid, session);
}

export function upsertWorkshop2B2bCartLine(input: {
  sessionId: string;
  line: Workshop2B2bCartLine;
  buyerId?: string;
  tier?: Workshop2B2bCartSession['tier'];
}): Workshop2B2bCartSession {
  const sid = input.sessionId.trim();
  const now = new Date().toISOString();
  const existing = cartSessions.get(sid);
  const session: Workshop2B2bCartSession = existing ?? {
    sessionId: sid,
    buyerId: input.buyerId,
    tier: input.tier ?? 'standard',
    lines: [],
    updatedAt: now,
  };
  if (input.buyerId) session.buyerId = input.buyerId;
  if (input.tier) session.tier = input.tier;

  const lineBrandId = resolveWorkshop2B2bCartLineBrandId({ line: input.line });
  const lineWithBrand: Workshop2B2bCartLine = {
    ...input.line,
    brandId: lineBrandId,
  };

  const key = `${input.line.collectionId}::${input.line.articleId}::${input.line.colorCode}::${input.line.size}`;
  const idx = session.lines.findIndex(
    (l) => `${l.collectionId}::${l.articleId}::${l.colorCode}::${l.size}` === key
  );
  if (lineWithBrand.qty <= 0) {
    if (idx >= 0) session.lines.splice(idx, 1);
  } else if (idx >= 0) {
    session.lines[idx] = { ...session.lines[idx], ...lineWithBrand };
  } else {
    session.lines.push(lineWithBrand);
  }
  session.brandId =
    session.lines.length === 1
      ? lineBrandId
      : evaluateWorkshop2B2bCartMixedBrandGate({ session }).allowed
        ? (session.brandId ?? lineBrandId)
        : undefined;
  session.updatedAt = now;
  cartSessions.set(sid, session);
  return session;
}

export function mergeWorkshop2B2bCartToOrder(input: {
  session: Workshop2B2bCartSession;
  orderId: string;
}): Workshop2B2bOrderRecord {
  const now = new Date().toISOString();
  const totalRub = input.session.lines.reduce(
    (s, l) => s + Math.round(l.qty * l.wholesalePriceRub),
    0
  );
  const articleIds = [...new Set(input.session.lines.map((l) => l.articleId))];
  const collectionIds = [...new Set(input.session.lines.map((l) => l.collectionId))];
  return {
    id: input.orderId,
    collectionId: collectionIds.length === 1 ? collectionIds[0] : undefined,
    articleId: articleIds.length === 1 ? articleIds[0] : undefined,
    buyerId: input.session.buyerId,
    brandId: input.session.brandId,
    status: 'draft',
    tier: input.session.tier,
    totalRub,
    lines: input.session.lines.map((l) => ({ ...l })),
    createdAt: now,
    updatedAt: now,
  };
}

export function createWorkshop2B2bBuyerInviteToken(input: {
  buyerEmail: string;
  tier?: Workshop2B2bCartSession['tier'];
}): { token: string; acceptPath: string } {
  const token = `b2b-inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  inviteTokens.set(token, {
    buyerEmail: input.buyerEmail.trim(),
    tier: input.tier ?? 'standard',
    createdAt: new Date().toISOString(),
  });
  return { token, acceptPath: `/shop/b2b/accept-invite?token=${encodeURIComponent(token)}` };
}

export function acceptWorkshop2B2bBuyerInviteToken(token: string):
  | {
      ok: true;
      buyerEmail: string;
      tier: Workshop2B2bCartSession['tier'];
      sessionId: string;
    }
  | { ok: false; messageRu: string } {
  const row = inviteTokens.get(token.trim());
  if (!row) return { ok: false, messageRu: 'Приглашение не найдено или просрочено.' };
  if (row.usedAt) return { ok: false, messageRu: 'Приглашение уже использовано.' };
  row.usedAt = new Date().toISOString();
  const sessionId = `b2b-partner-${row.buyerEmail.replace(/[^a-z0-9]/gi, '-').slice(0, 24)}`;
  cartSessions.set(sessionId, {
    sessionId,
    buyerId: row.buyerEmail,
    tier: row.tier,
    lines: [],
    updatedAt: new Date().toISOString(),
  });
  return { ok: true, buyerEmail: row.buyerEmail, tier: row.tier, sessionId };
}

export function summarizeWorkshop2B2bWorkspaceHeaderRu(input: {
  orderCount: number;
  totalRub: number;
}): string {
  const rub = Math.round(input.totalRub).toLocaleString('ru-RU');
  const n = input.orderCount;
  const ordersWord = n === 1 ? 'заказ' : n >= 2 && n <= 4 ? 'заказа' : 'заказов';
  return `B2B: ${n} ${ordersWord} · ₽${rub}`;
}

export function filterWorkshop2B2bOrdersByArticleId(
  orders: Workshop2B2bOrderRecord[],
  articleId: string
): Workshop2B2bOrderRecord[] {
  const aid = articleId.trim();
  return orders.filter((o) => o.articleId === aid || o.lines.some((l) => l.articleId === aid));
}

export function buildWorkshop2B2bOrderExport1cPayload(input: {
  order: Workshop2B2bOrderRecord;
  dossierByArticle: Map<string, Workshop2DossierPhase1>;
}): {
  format: 'workshop2-b2b-order-1c-v1';
  orderId: string;
  lines: Array<{ articleId: string; payload: ReturnType<typeof buildWorkshop2Erp1cExportPayload> }>;
  commerceMl?: string;
} {
  const lines: Array<{
    articleId: string;
    payload: ReturnType<typeof buildWorkshop2Erp1cExportPayload>;
  }> = [];
  const articleIds = [...new Set(input.order.lines.map((l) => l.articleId))];
  for (const articleId of articleIds) {
    const dossier = input.dossierByArticle.get(articleId);
    if (!dossier) continue;
    const collectionId =
      input.order.lines.find((l) => l.articleId === articleId)?.collectionId ?? 'SS27';
    lines.push({
      articleId,
      payload: buildWorkshop2Erp1cExportPayload({ dossier, collectionId, articleId }),
    });
  }
  const primary = lines[0]?.payload;
  const commerceMl = primary
    ? buildWorkshop2Erp1cCommerceMlFragment({ payload: primary })
    : undefined;
  return {
    format: 'workshop2-b2b-order-1c-v1',
    orderId: input.order.id,
    lines,
    commerceMl,
  };
}

export type Workshop2B2bAssortmentCard = {
  collectionId: string;
  articleId: string;
  campaignName: string;
  tier: Workshop2ShowroomCampaign['visibilityTier'];
  wholesalePrice?: number;
  moq?: number;
  heroImageUrl?: string;
  versionLabel: string;
};

export function buildWorkshop2B2bCompareRow(input: {
  collectionId: string;
  articleId: string;
  campaignName: string;
  wholesalePriceRub: number;
  moq: number;
  sizes: string[];
  heroImageUrl?: string;
  versionLabel?: string;
}): {
  articleId: string;
  campaignName: string;
  versionLabel?: string;
  heroImageUrl?: string;
  wholesalePriceRub: number;
  moq: number;
  sizes: string[];
} {
  return {
    articleId: input.articleId,
    campaignName: input.campaignName,
    versionLabel: input.versionLabel,
    heroImageUrl: input.heroImageUrl,
    wholesalePriceRub: input.wholesalePriceRub,
    moq: input.moq,
    sizes: input.sizes,
  };
}
