import { NextResponse } from 'next/server';

import type { ShopRepOfflineDraft } from '@/lib/shop/shop-rep-offline-drafts-store.types';
import { toBffPgStorageMode } from '@/lib/server/bff-pg-storage-mode';
import {
  appendShopRepOfflineDraftServer,
  getShopRepOfflineDraftsServer,
  shopRepOfflineDraftsStorageMode,
} from '@/lib/server/shop-rep-offline-drafts-repository';

function offlineDraftsMessageRu(
  storageMode: ReturnType<typeof shopRepOfflineDraftsStorageMode>,
  queueDepth: number,
  verb: 'read' | 'append'
): string {
  if (storageMode === 'pg') {
    return verb === 'read'
      ? `Очередь в PG · ${queueDepth} черновик(ов).`
      : `Черновик записан в PG · ${queueDepth} в очереди.`;
  }
  if (storageMode === 'unavailable') {
    return 'Очередь недоступна — нужен PostgreSQL (core fail-closed).';
  }
  return verb === 'read'
    ? `Очередь · ${storageMode} · ${queueDepth}.`
    : `Черновик сохранён (${storageMode}).`;
}

/** GET /api/shop/b2b/rep/offline-drafts — queued rep drafts (PG / file / memory). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const repId = url.searchParams.get('repId')?.trim() || 'rep-demo';
  const config = await getShopRepOfflineDraftsServer(repId);
  const storageMode = toBffPgStorageMode(shopRepOfflineDraftsStorageMode());
  return NextResponse.json({
    ok: true,
    config,
    storageMode,
    queueDepth: config.drafts.length,
    messageRu: offlineDraftsMessageRu(storageMode, config.drafts.length, 'read'),
  });
}

/** POST /api/shop/b2b/rep/offline-drafts — append draft for rep. */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    repId?: string;
    draft?: ShopRepOfflineDraft;
  };
  const repId = body.repId?.trim() || 'rep-demo';
  const draft = body.draft;
  if (!draft?.id || !draft.createdAt) {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный draft' }, { status: 400 });
  }
  const config = await appendShopRepOfflineDraftServer({
    repId,
    draft: { ...draft, repId: draft.repId?.trim() || repId },
  });
  const storageMode = toBffPgStorageMode(shopRepOfflineDraftsStorageMode());
  return NextResponse.json({
    ok: true,
    config,
    storageMode,
    queueDepth: config.drafts.length,
    messageRu: offlineDraftsMessageRu(storageMode, config.drafts.length, 'append'),
  });
}
