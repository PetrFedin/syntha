/**
 * GET list orders by article · POST submit with delivery date + payment terms (Wave 22).
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  isWorkshop2B2bPaymentTermsRu,
  resolveWorkshop2B2bPaymentTermsDays,
} from '@/lib/production/workshop2-b2b-wave22-parity';
import {
  collectWorkshop2B2bOrderLineMoqViolations,
  evaluateWorkshop2B2bCartSubmitDevelopmentGate,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import type { Workshop2B2bOrderLine } from '@/lib/production/workshop2-b2b-order-lifecycle';
import {
  listWorkshop2B2bOrdersForArticle,
  patchWorkshop2B2bOrderCheckoutFields,
  putWorkshop2B2bOrder,
} from '@/lib/server/workshop2-b2b-orders-repository';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const articleId = req.nextUrl.searchParams.get('articleId')?.trim();
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim();
  if (!articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'Параметр articleId обязателен.' },
      { status: 400 }
    );
  }
  const orders = await listWorkshop2B2bOrdersForArticle({ articleId, collectionId });
  return NextResponse.json({
    ok: true,
    count: orders.length,
    orders,
    messageRu: `B2B заказы по артикулу: ${orders.length}.`,
  });
}

export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const orderId = String(body.orderId ?? `B2B-${Date.now()}`).trim();
  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const lines = Array.isArray(body.lines) ? (body.lines as Workshop2B2bOrderLine[]) : [];
  const totalRub = typeof body.totalRub === 'number' ? body.totalRub : 0;
  const requestedDeliveryDate =
    typeof body.requestedDeliveryDate === 'string' ? body.requestedDeliveryDate : undefined;
  const paymentTermsRaw = String(body.paymentTermsRu ?? 'prepay_100');
  const paymentTermsRu = isWorkshop2B2bPaymentTermsRu(paymentTermsRaw)
    ? paymentTermsRaw
    : 'prepay_100';
  const paymentTermsDays =
    typeof body.paymentTermsDays === 'number'
      ? body.paymentTermsDays
      : resolveWorkshop2B2bPaymentTermsDays(paymentTermsRu);

  const explicitBuyer = String(body.buyerId ?? '').trim();
  const resolvedBuyerId =
    checkoutAuth.mode === 'jwt'
      ? checkoutAuth.buyerId
      : explicitBuyer || checkoutAuth.buyerId;

  const moqViolations = collectWorkshop2B2bOrderLineMoqViolations(lines);
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

  if (articleId && collectionId) {
    const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
    if (!record?.dossier) {
      return NextResponse.json(
        { ok: false, messageRu: `Досье ${articleId} не найдено — синхронизируйте W2.` },
        { status: 404 }
      );
    }
    const gate = evaluateWorkshop2B2bCartSubmitDevelopmentGate({
      dossier: record.dossier,
      articleId,
      collectionId,
    });
    if (!gate.allowed) {
      return NextResponse.json({ ok: false, messageRu: gate.messageRu }, { status: 409 });
    }
  }

  const now = new Date().toISOString();
  await putWorkshop2B2bOrder({
    id: orderId,
    collectionId: collectionId || undefined,
    articleId: articleId || undefined,
    buyerId: resolvedBuyerId,
    repId: body.repId != null ? String(body.repId) : undefined,
    status: 'submitted',
    tier: 'standard',
    totalRub,
    lines,
    requestedDeliveryDate,
    paymentTermsRu,
    paymentTermsDays,
    createdAt: now,
    updatedAt: now,
  });

  const patched = await patchWorkshop2B2bOrderCheckoutFields({
    orderId,
    requestedDeliveryDate,
    paymentTermsRu,
    paymentTermsDays,
  });

  return NextResponse.json({
    ok: true,
    order: patched.ok ? patched.order : null,
    buyerId: resolvedBuyerId,
    messageRu: 'Заказ отправлен · дата отгрузки и условия оплаты сохранены.',
  });
}
