/**
 * POST /api/shop/b2b/cart/matrix — batch upsert matrix qty → B2B cart session (Wave 43).
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  getWorkshop2B2bCartSession,
  upsertWorkshop2B2bCartLine,
} from '@/lib/production/workshop2-b2b-wave23-parity';
import { persistWorkshop2B2bCartSessionToFile } from '@/lib/server/workshop2-b2b-cart-session-file-store';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

type MatrixUpdate = {
  colorCode: string;
  size: string;
  qty: number;
  moq?: number;
  wholesalePriceRub?: number;
};

function resolveSessionId(req: NextRequest, bodySessionId?: string): string {
  return (
    bodySessionId?.trim() ||
    req.cookies.get('b2b_cart_session')?.value?.trim() ||
    `b2b-cart-${Date.now()}`
  );
}

export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: {
    sessionId?: string;
    collectionId?: string;
    articleId?: string;
    updates?: MatrixUpdate[];
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }

  const collectionId = body.collectionId?.trim();
  const articleId = body.articleId?.trim();
  if (!collectionId || !articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и articleId обязательны.' },
      { status: 400 }
    );
  }

  const updates = Array.isArray(body.updates) ? body.updates : [];
  const sessionId = resolveSessionId(req, body.sessionId);
  const moqViolations: string[] = [];

  let session = getWorkshop2B2bCartSession(sessionId);
  for (const u of updates) {
    const moq = Math.max(1, u.moq ?? 1);
    if (u.qty > 0 && u.qty < moq) {
      moqViolations.push(`${u.colorCode}/${u.size}: MOQ ${moq} шт.`);
    }
    session = upsertWorkshop2B2bCartLine({
      sessionId,
      buyerId: checkoutAuth.buyerId,
      line: {
        collectionId,
        articleId,
        colorCode: u.colorCode,
        size: u.size,
        qty: u.qty,
        wholesalePriceRub: Math.round(u.wholesalePriceRub ?? 0),
      },
    });
  }

  if (session) {
    persistWorkshop2B2bCartSessionToFile(session);
  }

  if (!session) {
    return NextResponse.json(
      { ok: false, messageRu: 'Не удалось сохранить сессию корзины B2B.' },
      { status: 500 }
    );
  }

  const res = NextResponse.json({
    ok: true,
    sessionId,
    lineCount: session.lines.length,
    totalRub: session.lines.reduce((s, l) => s + l.qty * l.wholesalePriceRub, 0),
    moqViolations,
    messageRu:
      moqViolations.length > 0
        ? `Сохранено с предупреждением MOQ: ${moqViolations.length}`
        : `Матрица сохранена (${session.lines.length} строк).`,
  });
  res.cookies.set('b2b_cart_session', sessionId, { path: '/', sameSite: 'lax' });
  return res;
}
