import { NextRequest, NextResponse } from 'next/server';

import { validateShopMatrixSizeRunServer } from '@/lib/server/shop-matrix-size-run-validate-server';
import { validateShopMatrixCartSizeRunsServer } from '@/lib/server/shop-matrix-size-run-cart-validate-server';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { resolveWorkshop2B2bCartSession } from '@/lib/production/workshop2-b2b-wave23-parity';

function parseQtyBySizeFromSearchParams(params: URLSearchParams): Record<string, number> {
  const raw = params.get('qtyBySize')?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const out: Record<string, number> = {};
      for (const [size, qty] of Object.entries(parsed)) {
        const n = Number(qty);
        if (Number.isFinite(n) && n > 0) out[size] = Math.round(n);
      }
      return out;
    } catch {
      return {};
    }
  }
  const out: Record<string, number> = {};
  for (const [key, value] of params.entries()) {
    if (!key.startsWith('size_')) continue;
    const size = key.slice('size_'.length).trim();
    const n = Number(value);
    if (size && Number.isFinite(n) && n > 0) out[size] = Math.round(n);
  }
  return out;
}

async function runValidate(input: {
  collectionId: string;
  articleId: string;
  qtyBySize: Record<string, number>;
}) {
  const validated = await validateShopMatrixSizeRunServer(input);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, messageRu: validated.messageRu }, { status: validated.status });
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

/** GET — validate matrix qty distribution vs W2 size curve + MOQ (query params). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const params = req.nextUrl.searchParams;
  const collectionId = params.get('collectionId')?.trim() ?? '';
  const articleId = params.get('articleId')?.trim() ?? '';
  const qtyBySize = parseQtyBySizeFromSearchParams(params);

  if (!collectionId || !articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и articleId обязательны.' },
      { status: 400 }
    );
  }

  return runValidate({ collectionId, articleId, qtyBySize });
}

/** POST — validate matrix qty distribution vs W2 size curve + MOQ. */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: {
    collectionId?: string;
    articleId?: string;
    qtyBySize?: Record<string, number>;
    sessionId?: string;
    articles?: Array<{ articleId: string; qtyBySize: Record<string, number> }>;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное тело.' }, { status: 400 });
  }

  const collectionId = body.collectionId?.trim() ?? '';
  if (!collectionId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId обязателен.' },
      { status: 400 }
    );
  }

  const sessionId = body.sessionId?.trim();
  if (sessionId) {
    const session = resolveWorkshop2B2bCartSession(sessionId);
    const batch = await validateShopMatrixCartSizeRunsServer({
      collectionId,
      lines: (session?.lines ?? []).map((l) => ({
        articleId: l.articleId,
        size: l.size,
        qty: l.qty,
      })),
    });
    return NextResponse.json({
      ok: batch.ok,
      results: batch.results,
      messageRu: batch.messageRu,
      firstFailedArticleId: batch.firstFailedArticleId,
    });
  }

  const articles = body.articles?.filter((a) => a.articleId?.trim());
  if (articles && articles.length > 0) {
    const batch = await validateShopMatrixCartSizeRunsServer({
      collectionId,
      lines: articles.flatMap((a) =>
        Object.entries(a.qtyBySize ?? {}).map(([size, qty]) => ({
          articleId: a.articleId.trim(),
          size,
          qty: Math.max(0, Math.round(Number(qty) || 0)),
        }))
      ),
    });
    return NextResponse.json({
      ok: batch.ok,
      results: batch.results,
      messageRu: batch.messageRu,
      firstFailedArticleId: batch.firstFailedArticleId,
    });
  }

  const articleId = body.articleId?.trim() ?? '';
  const qtyBySize = body.qtyBySize ?? {};
  if (!articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'articleId обязателен (или sessionId / articles).' },
      { status: 400 }
    );
  }

  return runValidate({ collectionId, articleId, qtyBySize });
}
