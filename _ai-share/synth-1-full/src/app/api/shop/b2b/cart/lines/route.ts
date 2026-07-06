/**
 * POST/GET /api/shop/b2b/cart/lines — multi-style cart session + checkout → order.
 */
import { NextRequest, NextResponse } from 'next/server';

import { buildWorkshop2B2bDeliveryCalendarEventFromOrder } from '@/lib/production/workshop2-b2b-wave22-parity';
import {
  evaluateWorkshop2B2bCartMixedBrandGate,
  evaluateWorkshop2B2bCartSubmitDevelopmentGate,
  collectWorkshop2B2bCartMoqViolations,
  getWorkshop2B2bCartSession,
  hydrateWorkshop2B2bCartSession,
  mergeWorkshop2B2bCartToOrder,
  summarizeWorkshop2B2bMixedBrandCheckoutRu,
  upsertWorkshop2B2bCartLine,
  validateWorkshop2B2bPrebookDeliveryDate,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import {
  persistWorkshop2B2bCartSessionToFile,
  readWorkshop2B2bCartSessionFromFile,
} from '@/lib/server/workshop2-b2b-cart-session-file-store';
import {
  buildWorkshop2B2bCatalogMatrix,
  buildWorkshop2B2bCampaign,
} from '@/lib/production/workshop2-b2b-campaign-hub';
import { buildWorkshop2SchetOffertaPayload } from '@/lib/production/workshop2-schet-offerta';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { getWorkshop2ShowroomCampaign } from '@/lib/server/workshop2-showroom-repository';
import {
  listWorkshop2B2bOrdersForArticle,
  putWorkshop2B2bOrder,
} from '@/lib/server/workshop2-b2b-orders-repository';
import { summarizeWorkshop2B2bWorkspaceHeaderRu } from '@/lib/production/workshop2-b2b-wave23-parity';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  summarizeWorkshop2B2bOrderStatusChangeRu,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { resolveShopCoreBuyerIdFromRequestAsync } from '@/lib/server/shop-core-buyer-partner-session';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { evaluateShopB2bCartCheckoutPreflight } from '@/lib/server/shop-b2b-cart-preflight-server';

function resolveSessionId(req: NextRequest, bodySessionId?: string): string {
  return (
    bodySessionId?.trim() ||
    req.cookies.get('b2b_cart_session')?.value?.trim() ||
    `b2b-cart-${Date.now()}`
  );
}

function resolveWorkshop2B2bCartSession(sessionId: string) {
  const sid = sessionId.trim();
  const inMemory = getWorkshop2B2bCartSession(sid);
  if (inMemory) return inMemory;
  const fromFile = readWorkshop2B2bCartSessionFromFile(sid);
  if (fromFile) {
    hydrateWorkshop2B2bCartSession(fromFile);
    return fromFile;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const articleId = req.nextUrl.searchParams.get('articleId')?.trim();
  if (articleId) {
    const orders = await listWorkshop2B2bOrdersForArticle({ articleId });
    const totalRub = orders.reduce((s, o) => s + o.totalRub, 0);
    return NextResponse.json({
      ok: true,
      articleId,
      orderCount: orders.length,
      totalRub,
      labelRu: summarizeWorkshop2B2bWorkspaceHeaderRu({ orderCount: orders.length, totalRub }),
      orders: orders.slice(0, 10),
    });
  }

  const sessionId = resolveSessionId(req, req.nextUrl.searchParams.get('sessionId') ?? undefined);
  const session = resolveWorkshop2B2bCartSession(sessionId);
  const emptySession = {
    sessionId,
    tier: 'standard' as const,
    lines: [],
    updatedAt: new Date().toISOString(),
  };
  const resolved = session ?? emptySession;
  const multiBrand =
    resolved.lines.length > 0
      ? summarizeWorkshop2B2bMixedBrandCheckoutRu({ lines: resolved.lines })
      : null;
  const includePreflight = req.nextUrl.searchParams.get('preflight') === '1';
  const preflight = includePreflight
    ? await evaluateShopB2bCartCheckoutPreflight(session)
    : undefined;
  return NextResponse.json({
    ok: true,
    session: resolved,
    multiBrand,
    preflight,
    messageRu: session?.lines.length
      ? multiBrand?.mixed
        ? multiBrand.headlineRu
        : `Корзина: ${session.lines.length} строк · ${session.lines.length} артикул(ов).`
      : 'Корзина пуста.',
  });
}

export async function POST(req: NextRequest) {
  let body: {
    action?: 'upsert' | 'checkout';
    sessionId?: string;
    buyerId?: string;
    tier?: 'standard' | 'vip' | 'prebook';
    line?: {
      collectionId: string;
      articleId: string;
      brandId?: string;
      colorCode: string;
      size: string;
      qty: number;
      wholesalePriceRub?: number;
      moq?: number;
      lineNote?: string;
      deliveryDate?: string;
    };
    orderId?: string;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }

  const sessionId = resolveSessionId(req, body.sessionId);
  const action = body.action ?? 'upsert';

  if (action === 'checkout') {
    const checkoutAuth = await guardShopB2bCheckoutRoute(req, body.buyerId);
    if (checkoutAuth instanceof NextResponse) return checkoutAuth;
    const resolvedBuyerId = await resolveShopCoreBuyerIdFromRequestAsync(req, body.buyerId);
    const session = resolveWorkshop2B2bCartSession(sessionId);
    if (!session?.lines.length) {
      return NextResponse.json({ ok: false, messageRu: 'Корзина пуста.' }, { status: 400 });
    }

    const brandGate = evaluateWorkshop2B2bCartMixedBrandGate({ session });
    if (!brandGate.allowed) {
      return NextResponse.json(
        { ok: false, messageRu: brandGate.messageRu, brandIds: brandGate.brandIds },
        { status: 409 }
      );
    }

    const moqViolations = collectWorkshop2B2bCartMoqViolations(session);
    if (moqViolations.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          code: 'moq_violation',
          moqViolations,
          messageRu: `Оформление заблокирован: MOQ — ${moqViolations[0]}`,
        },
        { status: 400 }
      );
    }

    const checkoutPreflight = await evaluateShopB2bCartCheckoutPreflight(session);
    if (checkoutPreflight.packViolations.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          code: 'pack_rule_violation',
          packViolations: checkoutPreflight.packViolations,
          messageRu: checkoutPreflight.messageRu,
        },
        { status: 400 }
      );
    }

    const articleIds = [...new Set(session.lines.map((l) => l.articleId))];
    for (const articleId of articleIds) {
      const line0 = session.lines.find((l) => l.articleId === articleId)!;
      const record = await getWorkshop2ServerDossierRecord(line0.collectionId, articleId);
      if (!record?.dossier) {
        return NextResponse.json(
          { ok: false, messageRu: `Досье ${articleId} не найдено — синхронизируйте W2.` },
          { status: 404 }
        );
      }
      const gate = evaluateWorkshop2B2bCartSubmitDevelopmentGate({
        dossier: record.dossier,
        articleId,
        collectionId: line0.collectionId,
      });
      if (!gate.allowed) {
        return NextResponse.json({ ok: false, messageRu: gate.messageRu }, { status: 409 });
      }
    }

    const orderId = body.orderId?.trim() || `B2B-${Date.now()}`;
    if (session.buyerId !== resolvedBuyerId) {
      session.buyerId = resolvedBuyerId;
    }
    const order = mergeWorkshop2B2bCartToOrder({ session, orderId });
    order.buyerId = resolvedBuyerId;
    order.status = 'submitted';
    await putWorkshop2B2bOrder(order);

    const calendarEvent = buildWorkshop2B2bDeliveryCalendarEventFromOrder(order);
    const statusMessage = summarizeWorkshop2B2bOrderStatusChangeRu({
      orderId: order.id,
      from: 'draft',
      to: 'submitted',
    });
    void enqueueWorkshop2DomainEvent({
      type: 'b2b.order.status_changed',
      collectionId: order.collectionId ?? session.lines[0]?.collectionId,
      articleId: order.articleId ?? session.lines[0]?.articleId,
      payload: {
        orderId: order.id,
        from: 'draft',
        to: 'submitted',
        previousStatus: 'draft',
        status: 'submitted',
        source: 'b2b_cart_checkout',
        totalRub: order.totalRub,
        lineCount: order.lines.length,
        messageRu: statusMessage,
      },
      dispatchNow: true,
    }).catch(() => {
      /* best-effort */
    });
    void appendWorkshop2ContextualSystemMessage({
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      contextId: workshop2B2bOrderContextId(order.id),
      message: statusMessage,
    }).catch(() => {
      /* best-effort */
    });

    const schetPayload = buildWorkshop2SchetOffertaPayload({
      orderId,
      lines: order.lines.map((l) => ({
        name: `${l.articleId} · ${l.colorCode} · ${l.size}${l.lineNote ? ` — ${l.lineNote}` : ''}`,
        qty: l.qty,
        priceRub: l.wholesalePriceRub,
      })),
    });

    const res = NextResponse.json({
      ok: true,
      order,
      schetPayload,
      calendarEvent,
      domainEventType: 'b2b.order.status_changed',
      messageRu: `Заказ ${orderId} создан из ${order.lines.length} строк (${articleIds.length} артикулов).`,
    });
    res.cookies.set('b2b_cart_session', sessionId, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    res.cookies.set('shop_b2b_buyer_id', resolvedBuyerId, { path: '/', maxAge: 60 * 60 * 24 * 30 });
    if (checkoutAuth.mode === 'jwt') {
      res.headers.set('X-Shop-B2b-Checkout-Auth', 'jwt');
    }
    return res;
  }

  const resolvedBuyerId = await resolveShopCoreBuyerIdFromRequestAsync(req, body.buyerId);

  const line = body.line;
  if (!line?.collectionId?.trim() || !line.articleId?.trim()) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите collectionId, articleId, colorCode, size, qty.' },
      { status: 400 }
    );
  }

  const record = await getWorkshop2ServerDossierRecord(
    line.collectionId.trim(),
    line.articleId.trim()
  );
  if (!record?.dossier) {
    return NextResponse.json(
      { ok: false, messageRu: 'Досье артикула не найдено.' },
      { status: 404 }
    );
  }

  const campaign = await getWorkshop2ShowroomCampaign({
    collectionId: line.collectionId.trim(),
    articleId: line.articleId.trim(),
  });
  const matrix = buildWorkshop2B2bCatalogMatrix({
    collectionId: line.collectionId.trim(),
    articleId: line.articleId.trim(),
    dossier: record.dossier,
    campaign,
  });
  const b2bCampaign = buildWorkshop2B2bCampaign({
    collectionId: line.collectionId.trim(),
    articleId: line.articleId.trim(),
    dossier: record.dossier,
    campaign,
  });
  const heroImageUrl = b2bCampaign.heroImageUrl;

  if (line.deliveryDate?.trim()) {
    const prebook = validateWorkshop2B2bPrebookDeliveryDate({
      deliveryDate: line.deliveryDate.trim(),
      preorderWindow: matrix.preorderWindowRu,
    });
    if (!prebook.ok) {
      return NextResponse.json({ ok: false, messageRu: prebook.messageRu }, { status: 400 });
    }
  }

  const cell = matrix.cells.find((c) => c.colorCode === line.colorCode && c.size === line.size);
  const wholesalePriceRub =
    line.wholesalePriceRub ??
    cell?.bestPriceRub ??
    cell?.wholesalePriceRub ??
    Math.round(matrix.cells[0]?.wholesalePriceRub ?? 0);

  const session = upsertWorkshop2B2bCartLine({
    sessionId,
    buyerId: resolvedBuyerId,
    tier: body.tier,
    line: {
      collectionId: line.collectionId.trim(),
      articleId: line.articleId.trim(),
      colorCode: line.colorCode,
      size: line.size,
      qty: Math.max(0, Math.round(line.qty)),
      wholesalePriceRub,
      moq: line.moq ?? cell?.moq,
      lineNote: line.lineNote?.trim() || undefined,
      deliveryDate: line.deliveryDate?.trim() || undefined,
      heroImageUrl,
      brandId: line.brandId?.trim() || undefined,
    },
  });
  persistWorkshop2B2bCartSessionToFile(session);

  const res = NextResponse.json({
    ok: true,
    session,
    bestPriceRub: cell?.bestPriceRub,
    messageRu: `Строка добавлена · опт ₽${wholesalePriceRub.toLocaleString('ru-RU')}.`,
  });
  res.cookies.set('b2b_cart_session', sessionId, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  res.cookies.set('shop_b2b_buyer_id', resolvedBuyerId, { path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
