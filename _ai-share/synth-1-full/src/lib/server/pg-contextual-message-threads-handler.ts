import { NextResponse } from 'next/server';
import { getWorkshop2MarketProfile } from '@/lib/production/workshop2-market-profile';
import { buildWorkshop2DossierLinkedPaths } from '@/lib/production/workshop2-dossier-linked-paths';
import {
  isWorkshop2ContextualChatPersistConfigured,
  listWorkshop2ContextualMessageThreads,
} from '@/lib/server/workshop2-contextual-messages-repository';
import { listWorkshop2ContextualReadStateForThreads } from '@/lib/server/workshop2-contextual-read-state-repository';
import { resolveWorkshop2OrganizationId } from '@/lib/server/workshop2-api-context';
import { isWorkshop2PgConnectionError } from '@/lib/server/workshop2-pg-pool';

export type PgContextualThreadsCabinet = 'brand' | 'shop' | 'factory';

const THREAD_LIMITS: Record<PgContextualThreadsCabinet, { contextType: string; limit: number }[]> =
  {
    brand: [
      { contextType: 'workshop2_article', limit: 20 },
      { contextType: 'b2b_order', limit: 15 },
    ],
    shop: [
      { contextType: 'b2b_order', limit: 30 },
      { contextType: 'workshop2_article', limit: 15 },
    ],
    factory: [
      { contextType: 'b2b_order', limit: 20 },
      { contextType: 'workshop2_article', limit: 15 },
    ],
  };

const HINT_RU: Record<PgContextualThreadsCabinet, string> = {
  brand:
    'Основной чат — contextual thread в workspace артикула; demo messages-data не используется.',
  shop: 'Чаты байера — contextual threads по B2B-заказам и артикулам витрины.',
  factory: 'Чаты цеха — contextual threads по заказам и артикулам производства.',
};

export async function buildPgContextualThreadsResponse(
  cabinet: PgContextualThreadsCabinet,
  req?: Request
) {
  const market = getWorkshop2MarketProfile();
  const configured = isWorkshop2ContextualChatPersistConfigured();
  const readerId = req
    ? new URL(req.url).searchParams.get('readerId')?.trim() ||
      req.headers.get('x-w2-actor-id')?.trim() ||
      undefined
    : undefined;
  const organizationId = req ? resolveWorkshop2OrganizationId(req) : undefined;
  let threadsRaw: Awaited<ReturnType<typeof listWorkshop2ContextualMessageThreads>> = [];
  let pgUnavailable = false;

  if (configured) {
    try {
      const specs = THREAD_LIMITS[cabinet];
      const batches = await Promise.all(
        specs.map((spec) =>
          listWorkshop2ContextualMessageThreads({
            contextType: spec.contextType,
            limit: spec.limit,
          })
        )
      );
      threadsRaw = batches
        .flat()
        .sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));
    } catch (err) {
      if (!isWorkshop2PgConnectionError(err)) throw err;
      pgUnavailable = true;
    }
  }

  let readStateByThread: Record<string, number> = {};
  if (readerId && configured && !pgUnavailable && threadsRaw.length > 0) {
    try {
      readStateByThread = await listWorkshop2ContextualReadStateForThreads({
        organizationId,
        actorId: readerId,
        threads: threadsRaw.map((t) => ({
          contextType: t.contextType,
          contextId: t.contextId,
        })),
      });
    } catch (err) {
      if (!isWorkshop2PgConnectionError(err)) throw err;
      pgUnavailable = true;
    }
  }

  const threads = threadsRaw.map((t) => {
    const collectionId = t.collectionId?.trim();
    const articleId = t.articleId?.trim();
    const workspaceHref =
      collectionId && articleId
        ? buildWorkshop2DossierLinkedPaths({ collectionId, articleId }).workspace
        : undefined;
    const readKey = `${t.contextType}::${t.contextId}`;
    const serverLastSeen = readStateByThread[readKey];
    return {
      ...t,
      workspaceHref,
      ...(serverLastSeen != null ? { lastSeenMessageCount: serverLastSeen } : {}),
    };
  });

  return NextResponse.json({
    ok: true,
    cabinet,
    market,
    pgUnavailable,
    source: pgUnavailable
      ? 'unavailable'
      : configured
        ? process.env.WORKSHOP2_DATABASE_URL
          ? 'postgres'
          : 'memory'
        : 'empty',
    threads,
    hintRu: pgUnavailable ? 'PostgreSQL недоступен — npm run db:core:up' : HINT_RU[cabinet],
  });
}
