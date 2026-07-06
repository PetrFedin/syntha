import { NextRequest, NextResponse } from 'next/server';

import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU } from '@/lib/production/brand-linesheet-syndication';
import {
  brandLinesheetSyndicationStorageMode,
  listShopShowroomAutoIngestJournal,
} from '@/lib/server/brand-linesheet-syndication-repository';
import { runShopShowroomAutoIngestOnSyndicate } from '@/lib/server/brand-linesheet-syndication-server';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET — журнал auto-ingest витрины магазина после syndication бренда. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const collectionId =
    req.nextUrl.searchParams.get('collection')?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const journal = await listShopShowroomAutoIngestJournal({ buyerId, collectionId, limit: 12 });

  return NextResponse.json({
    ok: true,
    buyerId,
    collectionId,
    journal,
    storageMode: brandLinesheetSyndicationStorageMode(),
    messageRu: journal.length
      ? SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU
      : 'Auto-ingest journal пуст — дождитесь syndication от бренда.',
  });
}

/** POST — shop-side auto-ingest stub (обычно вызывается из brand syndicate). */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    String(body.buyerId ?? checkoutAuth.buyerId)
  );
  const collectionId =
    String(body.collectionId ?? '').trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleIds = Array.isArray(body.articleIds)
    ? body.articleIds.map((id) => String(id).trim()).filter(Boolean)
    : [];

  const ingest = await runShopShowroomAutoIngestOnSyndicate({
    buyerId,
    collectionId,
    articleIds,
    source: String(body.source ?? 'linesheet_syndicate_manual').trim(),
  });

  return NextResponse.json({
    ok: true,
    buyerId,
    collectionId,
    ingestedCount: ingest.ingestedCount,
    journalId: ingest.journalId,
    storageMode: brandLinesheetSyndicationStorageMode(),
    messageRu: SHOP_LINESHEET_AUTO_INGEST_NOTICE_RU,
  });
}
