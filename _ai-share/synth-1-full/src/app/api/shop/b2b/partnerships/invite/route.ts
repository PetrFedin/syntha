/**
 * POST /api/shop/b2b/partnerships/invite — PG partnership invite + journal (Wave UW).
 * GET — recent invite journal rows for UAT / audit.
 */
import { NextRequest, NextResponse } from 'next/server';

import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import {
  connectShopB2bPartnershipDemo,
  requestShopB2bPartnershipAccess,
} from '@/lib/server/shop-b2b-partnerships';
import {
  appendShopPartnershipInviteJournal,
  listShopPartnershipInviteJournal,
  shopPartnershipInviteJournalStorageMode,
} from '@/lib/server/shop-partnership-invite-journal-repository';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

/** GET — invite journal tail for buyer (+ optional brandId). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId =
    req.nextUrl.searchParams.get('buyerId')?.trim() ||
    checkoutAuth.buyerId ||
    resolveShopCoreBuyerIdFromRequest(req);
  const brandId = req.nextUrl.searchParams.get('brandId')?.trim();
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '10');

  const journal = await listShopPartnershipInviteJournal({ buyerId, brandId, limit });

  return NextResponse.json({
    ok: true,
    buyerId,
    journal,
    storageMode: shopPartnershipInviteJournalStorageMode(),
    messageRu: journal.length
      ? `${journal.length} запис(ей) invite в журнале.`
      : 'Журнал invite пуст.',
  });
}

/** POST — shop-side invite with PG upsert + journal append. */
export async function POST(req: NextRequest) {
  let body: {
    action?: 'request' | 'connect';
    brandId?: string;
    buyerId?: string;
    collectionId?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const brandId = body.brandId?.trim();
  if (!brandId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите brandId.' }, { status: 400 });
  }

  const checkoutAuth = await guardShopB2bCheckoutRoute(req, body.buyerId);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId =
    body.buyerId?.trim() || checkoutAuth.buyerId || resolveShopCoreBuyerIdFromRequest(req);
  const collectionId = body.collectionId?.trim();
  const action = body.action === 'connect' ? 'connect' : 'request';

  const result =
    action === 'connect'
      ? await connectShopB2bPartnershipDemo({ buyerId, brandId, collectionId })
      : await requestShopB2bPartnershipAccess({ buyerId, brandId, collectionId });

  if (!result.ok) {
    return NextResponse.json(result, { status: isWorkshop2PostgresEnabled() ? 400 : 503 });
  }

  const journalRow = await appendShopPartnershipInviteJournal({
    buyerId,
    brandId,
    collectionId,
    action,
    status: result.partnership.status,
  });

  return NextResponse.json({
    ok: true,
    action,
    partnership: {
      brandId: result.partnership.brandId,
      name: result.partnership.name,
      status: result.partnership.status,
    },
    journalId: journalRow.id,
    storageMode: shopPartnershipInviteJournalStorageMode(),
    messageRu:
      action === 'connect'
        ? `Приглашение принято: ${result.partnership.name} подключён в PostgreSQL.`
        : `Заявка на партнёрство с ${result.partnership.name} сохранена в PostgreSQL.`,
  });
}
