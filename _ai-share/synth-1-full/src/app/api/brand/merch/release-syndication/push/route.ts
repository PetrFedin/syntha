import { NextRequest, NextResponse } from 'next/server';

import { buildBrandReleaseSyndicationRowsWithServerTechPack } from '@/lib/server/brand-release-syndication-techpack';
import { mapSyndicationReadyRowsToArticleIds } from '@/lib/fashion/brand-release-syndication-push';
import {
  appendBrandReleaseSyndicationPush,
  brandReleaseSyndicationPushStorageMode,
  listBrandReleaseSyndicationPushes,
} from '@/lib/server/brand-release-syndication-push-repository';
import { postBrandLinesheetSyndicate } from '@/lib/server/brand-linesheet-syndication-server';
import { products } from '@/lib/products';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

/** GET — journal of syndication pushes. */
export async function GET() {
  const pushes = listBrandReleaseSyndicationPushes(10);
  return NextResponse.json({
    ok: true,
    pushes,
    storageMode: brandReleaseSyndicationPushStorageMode(),
  });
}

/** POST — push ready SKUs to showroom bulk publish + journal. */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const collectionId =
    String(body.collectionId ?? '').trim() || PLATFORM_CORE_DEMO.collectionId;
  const rows = await buildBrandReleaseSyndicationRowsWithServerTechPack({
    products,
    collectionId,
  });
  const articleIds = mapSyndicationReadyRowsToArticleIds(rows, products);

  if (articleIds.length === 0) {
    return NextResponse.json({
      ok: false,
      messageRu: 'Нет SKU с release gate ready (launch + attrs + factory pack) для syndication push.',
    }, { status: 422 });
  }

  let publishMessageRu: string | undefined;
  try {
    const res = await fetch(
      `${req.nextUrl.origin}/api/workshop2/collections/${encodeURIComponent(collectionId)}/bulk-showroom-publish`,
      {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleIds, source: 'release-syndication' }),
      }
    );
    const json = (await res.json()) as { messageRu?: string; publishedCount?: number };
    publishMessageRu = json.messageRu;
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        messageRu: publishMessageRu ?? 'Showroom bulk publish не выполнен.',
      }, { status: res.status });
    }
  } catch {
    publishMessageRu = 'Журнал записан; showroom publish недоступен (offline).';
  }

  const result = appendBrandReleaseSyndicationPush({
    pushedAt: new Date().toISOString(),
    readyCount: articleIds.length,
    articleIds,
    channels: ['showroom', 'b2b_linesheet', 'wholesale_matrix'],
  });

  const syndicate = await postBrandLinesheetSyndicate({
    collectionId,
    articleIds,
    shopBuyerId: 'shop1',
    source: 'release_syndication',
    publishMessageRu,
  });

  return NextResponse.json({
    ok: true,
    result,
    syndicate,
    storageMode: brandReleaseSyndicationPushStorageMode(),
    messageRu:
      syndicate.messageRu ??
      publishMessageRu ??
      `Syndication push: ${result.readyCount} артикул(ов) → каналы.`,
  });
}
