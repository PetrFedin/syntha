import { NextRequest, NextResponse } from 'next/server';

import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import type { BrandLinesheetSyndicateSource } from '@/lib/production/brand-linesheet-syndication';
import {
  brandLinesheetSyndicationStorageMode,
  listBrandLinesheetSyndicationJournal,
} from '@/lib/server/brand-linesheet-syndication-repository';
import { postBrandLinesheetSyndicate } from '@/lib/server/brand-linesheet-syndication-server';
import { evaluateBrandMaterialPassportReleaseGateForCollection } from '@/lib/server/brand-material-passport-release-gate-server';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

/** GET — журнал syndication push по коллекции. */
export async function GET(req: NextRequest) {
  const collectionId =
    req.nextUrl.searchParams.get('collection')?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const journal = await listBrandLinesheetSyndicationJournal(collectionId, 12);

  return NextResponse.json({
    ok: true,
    collectionId,
    journal,
    storageMode: brandLinesheetSyndicationStorageMode(),
  });
}

/** POST — syndication publish → shop auto-ingest + PG notification (Wave TF stub). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const collectionId =
    String(body.collectionId ?? req.nextUrl.searchParams.get('collection') ?? '').trim() ||
    PLATFORM_CORE_DEMO.collectionId;
  const articleIds = Array.isArray(body.articleIds)
    ? body.articleIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  const shopBuyerId = String(body.shopBuyerId ?? 'shop1').trim();
  const source = String(body.source ?? 'syndicate_publish').trim() as BrandLinesheetSyndicateSource;
  const runPublish = body.publish !== false;

  if (runPublish && articleIds.length > 0) {
    const releaseGate = await evaluateBrandMaterialPassportReleaseGateForCollection({ collectionId });
    if (releaseGate.blocked) {
      return NextResponse.json(
        {
          ok: false,
          error: 'material_passport_release_gate',
          code: 'material_passport_release_gate',
          messageRu: releaseGate.messageRu,
          summary: releaseGate.summary,
          storageMode: releaseGate.storageMode,
        },
        { status: 409, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  let publishMessageRu: string | undefined;
  if (runPublish && articleIds.length > 0) {
    try {
      const res = await fetch(
        `${req.nextUrl.origin}/api/workshop2/collections/${encodeURIComponent(collectionId)}/bulk-showroom-publish`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleIds, source: 'linesheet_syndicate' }),
        }
      );
      const json = (await res.json()) as { messageRu?: string };
      publishMessageRu = json.messageRu;
    } catch {
      publishMessageRu = 'Showroom publish offline — syndication journal + shop ingest stub.';
    }
  }

  const outcome = await postBrandLinesheetSyndicate({
    collectionId,
    articleIds,
    shopBuyerId,
    source,
    publishMessageRu,
  });

  if (!outcome.ok) {
    return NextResponse.json(outcome, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    ...outcome,
    storageMode: brandLinesheetSyndicationStorageMode(),
  });
}
