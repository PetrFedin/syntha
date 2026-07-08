import { NextRequest, NextResponse } from 'next/server';

import {
  getShopB2bMatrixDraftServer,
  putShopB2bMatrixDraftServer,
  shopB2bMatrixDraftStorageMode,
  type ShopB2bMatrixDraftDoc,
} from '@/lib/server/shop-b2b-matrix-draft-repository';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { validateShopMatrixDraftDocRu } from '@/lib/b2b/shop-matrix-draft-validate';
import {
  SHOP_MATRIX_DRAFT_CONFLICT_HINT_RU,
  mergeShopMatrixDraftValidationHintsRu,
} from '@/lib/b2b/shop-matrix-draft-autosave-wave-xt';
import { validateShopMatrixCartSizeRunsServer } from '@/lib/server/shop-matrix-size-run-cart-validate-server';

function resolveSessionId(req: NextRequest, explicit?: string): string {
  return (
    explicit?.trim() ||
    req.nextUrl.searchParams.get('sessionId')?.trim() ||
    req.cookies.get('b2b_cart_session')?.value?.trim() ||
    ''
  );
}

/** GET — autosaved matrix draft (PG SoT in core). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const sessionId = resolveSessionId(req);
  if (!sessionId) {
    return NextResponse.json({ ok: false, messageRu: 'sessionId обязателен.' }, { status: 400 });
  }

  const { draft, storageMode, updatedAt } = await getShopB2bMatrixDraftServer({ sessionId });
  return NextResponse.json({
    ok: true,
    draft,
    updatedAt: updatedAt ?? draft?.updatedAt ?? null,
    storageMode,
    messageRu: draft ? 'Черновик матрицы загружен.' : 'Черновик матрицы пуст.',
  });
}

/** PUT — debounced matrix draft autosave. */
export async function PUT(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: {
    sessionId?: string;
    buyerId?: string;
    collectionId?: string;
    expectedUpdatedAt?: string;
    draft?: ShopB2bMatrixDraftDoc;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное тело.' }, { status: 400 });
  }

  const sessionId = resolveSessionId(req, body.sessionId);
  const collectionId = body.collectionId?.trim();
  const draft = body.draft;
  if (!sessionId || !collectionId || !draft || draft.v !== 1) {
    return NextResponse.json(
      { ok: false, messageRu: 'sessionId, collectionId и draft обязательны.' },
      { status: 400 }
    );
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(req, body.buyerId ?? checkoutAuth.buyerId);
  const result = await putShopB2bMatrixDraftServer({
    sessionId,
    buyerId,
    collectionId,
    draft,
    expectedUpdatedAt: body.expectedUpdatedAt,
  });

  if (result.conflict) {
    return NextResponse.json(
      {
        ok: false,
        conflict: true,
        storageMode: result.storageMode,
        serverUpdatedAt: result.serverUpdatedAt,
        serverDraft: result.serverDraft ?? null,
        messageRu: SHOP_MATRIX_DRAFT_CONFLICT_HINT_RU,
      },
      { status: 409 }
    );
  }

  const sizeRunValidated = await validateShopMatrixCartSizeRunsServer({
    collectionId,
    lines: draft.lines.map((line) => ({
      articleId: line.articleId,
      size: line.size,
      qty: line.qty,
    })),
  });

  const validation = validateShopMatrixDraftDocRu(draft, { collectionId });

  const validationHintsRu = mergeShopMatrixDraftValidationHintsRu(
    validation.hintsRu,
    sizeRunValidated.ok ? null : sizeRunValidated.messageRu
  );
  const validationOk = validation.ok && sizeRunValidated.ok;

  return NextResponse.json({
    ok: result.ok,
    storageMode:
      result.storageMode === 'pg_only_blocked'
        ? shopB2bMatrixDraftStorageMode()
        : result.storageMode,
    validationOk,
    validationHintsRu,
    sizeRunOk: sizeRunValidated.ok,
    sizeRunMessageRu: sizeRunValidated.messageRu,
    updatedAt: draft.updatedAt,
    messageRu: result.ok
      ? validationOk
        ? validation.messageRu
        : validationHintsRu.slice(0, 3).join(' · ')
      : 'Не удалось сохранить черновик.',
  });
}
