import { NextRequest, NextResponse } from 'next/server';

import { BRAND_SC_PUBLISH_AUDIT_EMPTY_RU } from '@/lib/production/brand-sc-publish-audit';
import {
  brandScPublishAuditStorageMode,
  listBrandScPublishAuditJournalForCollection,
} from '@/lib/server/brand-sc-publish-audit-repository';
import { guardWorkshop2Route, WORKSHOP2_READ_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string }> };

/** GET — журнал публикаций showroom (showroom.published) по коллекции. */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId: rawId } = await ctx.params;
  const collectionId = rawId?.trim();
  if (!collectionId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан collectionId.' }, { status: 400 });
  }

  const limitRaw = Number(req.nextUrl.searchParams.get('limit') ?? 20);
  const limit = Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 20;

  const journal = await listBrandScPublishAuditJournalForCollection(collectionId, limit);
  const events = journal.map((row) => ({
    id: row.id,
    type: row.eventType,
    collectionId: row.collectionId,
    articleId: row.articleId,
    payload: {
      ...row.payload,
      source: row.source,
      campaignName: row.campaignName ?? row.payload.campaignName,
    },
    createdAt: row.createdAt,
    organizationId: row.organizationId,
  }));

  return NextResponse.json({
    ok: true,
    collectionId,
    events,
    storageMode: brandScPublishAuditStorageMode(),
    messageRu:
      events.length > 0 ? `${events.length} записей публикации` : BRAND_SC_PUBLISH_AUDIT_EMPTY_RU,
  });
}
