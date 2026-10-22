import { NextRequest, NextResponse } from 'next/server';

import { validateShopMatrixSizeRunServer } from '@/lib/server/shop-matrix-size-run-validate-server';
import { validateShopMatrixCartSizeRunsServer } from '@/lib/server/shop-matrix-size-run-cart-validate-server';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { resolveWorkshop2B2bCartSession } from '@/lib/production/workshop2-b2b-wave23-parity';
import {
  parseShopMatrixQtyBySize,
  parseShopMatrixQtyBySizeQuery,
} from '@/lib/b2b/shop-matrix-size-run-quantity-input';

type RawBody = {
  collectionId?: unknown;
  articleId?: unknown;
  qtyBySize?: unknown;
  sessionId?: unknown;
  articles?: unknown;
};

const badRequest = (messageRu: string) =>
  NextResponse.json({ ok: false, messageRu }, { status: 400 });

async function runValidate(input: {
  collectionId: string;
  articleId: string;
  qtyBySize: Record<string, number>;
}) {
  const validated = await validateShopMatrixSizeRunServer(input);
  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, messageRu: validated.messageRu },
      { status: validated.status }
    );
  }
  const { result } = validated;
  return NextResponse.json({
    ok: result.ok,
    violations: result.violations,
    messageRu: result.messageRu,
    curveSource: result.curveSource,
    moqPerCell: result.moqPerCell,
  });
}

/** GET — read-only validation; invalid quantities must not be silently rounded away. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const params = req.nextUrl.searchParams;
  const collectionId = params.get('collectionId')?.trim() ?? '';
  const articleId = params.get('articleId')?.trim() ?? '';
  if (!collectionId || !articleId) {
    return badRequest('collectionId и articleId обязательны.');
  }

  const parsed = parseShopMatrixQtyBySizeQuery(params);
  if (!parsed.ok) return badRequest(parsed.messageRu);

  return runValidate({ collectionId, articleId, qtyBySize: parsed.qtyBySize });
}

/** POST — validation for an article, a group of articles, or a persisted cart session. */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: RawBody;
  try {
    const input: unknown = await req.json();
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return badRequest('Тело запроса должно быть объектом.');
    }
    body = input as RawBody;
  } catch {
    return badRequest('Некорректное тело.');
  }

  const collectionId = typeof body.collectionId === 'string' ? body.collectionId.trim() : '';
  if (!collectionId) return badRequest('collectionId обязателен.');

  if (body.sessionId !== undefined && typeof body.sessionId !== 'string') {
    return badRequest('sessionId должен быть строкой.');
  }
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';

  if (sessionId) {
    const session = resolveWorkshop2B2bCartSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { ok: false, messageRu: 'Сессия корзины не найдена.' },
        { status: 404 }
      );
    }
    // Session identifiers are not credentials: deny cross-buyer reads in JWT mode.
    if (
      checkoutAuth.mode === 'jwt' &&
      (!session.buyerId || session.buyerId !== checkoutAuth.buyerId)
    ) {
      return NextResponse.json(
        { ok: false, messageRu: 'Сессия корзины принадлежит другому байеру.' },
        { status: 403 }
      );
    }
    if (session.lines.some((line) => line.collectionId !== collectionId)) {
      return NextResponse.json(
        { ok: false, messageRu: 'Корзина содержит товары другой коллекции.' },
        { status: 409 }
      );
    }
    for (const line of session.lines) {
      if (!line.articleId?.trim()) return badRequest('В корзине не указан артикул.');
      const parsed = parseShopMatrixQtyBySize({ [line.size]: line.qty });
      if (!parsed.ok) return badRequest(parsed.messageRu);
    }
    const batch = await validateShopMatrixCartSizeRunsServer({
      collectionId,
      lines: session.lines.map((line) => ({
        articleId: line.articleId,
        size: line.size,
        qty: line.qty,
      })),
    });
    return NextResponse.json({
      ok: batch.ok,
      results: batch.results,
      messageRu: batch.messageRu,
      firstFailedArticleId: batch.firstFailedArticleId,
    });
  }

  if (body.articles !== undefined) {
    if (!Array.isArray(body.articles) || body.articles.length > 128) {
      return badRequest('articles должен быть массивом не более 128 позиций.');
    }
    const seen = new Set<string>();
    const lines: Array<{ articleId: string; size: string; qty: number }> = [];
    for (const entry of body.articles) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return badRequest('Некорректная позиция в articles.');
      }
      const item = entry as { articleId?: unknown; qtyBySize?: unknown };
      const articleId = typeof item.articleId === 'string' ? item.articleId.trim() : '';
      if (!articleId) return badRequest('Каждая позиция должна содержать articleId.');
      if (seen.has(articleId)) {
        return badRequest(`Артикул «${articleId}» указан повторно.`);
      }
      seen.add(articleId);
      const parsed = parseShopMatrixQtyBySize(item.qtyBySize);
      if (!parsed.ok) return badRequest(`${articleId}: ${parsed.messageRu}`);
      for (const [size, qty] of Object.entries(parsed.qtyBySize)) {
        lines.push({ articleId, size, qty });
      }
    }
    if (lines.length === 0) {
      return badRequest('Необходимо передать хотя бы одну позицию с размером.');
    }
    const batch = await validateShopMatrixCartSizeRunsServer({ collectionId, lines });
    return NextResponse.json({
      ok: batch.ok,
      results: batch.results,
      messageRu: batch.messageRu,
      firstFailedArticleId: batch.firstFailedArticleId,
    });
  }

  const articleId = typeof body.articleId === 'string' ? body.articleId.trim() : '';
  if (!articleId) {
    return badRequest('articleId обязателен (или sessionId / articles).');
  }
  const parsed = parseShopMatrixQtyBySize(body.qtyBySize ?? {});
  if (!parsed.ok) return badRequest(parsed.messageRu);

  return runValidate({ collectionId, articleId, qtyBySize: parsed.qtyBySize });
}
