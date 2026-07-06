import 'server-only';

import { randomUUID } from 'node:crypto';

import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type PlatformCoreNotificationRole = 'shop' | 'brand' | 'manufacturer' | 'supplier';

export type PlatformCoreNotificationKind =
  | 'chain_status'
  | 'materials_supplied'
  | 'inventory_reserved'
  | 'order_status'
  | 'chat'
  | 'calendar';

export type PlatformCoreNotificationEvent = {
  id: string;
  role: PlatformCoreNotificationRole;
  scopeKey: string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  kind: PlatformCoreNotificationKind;
  titleRu: string;
  bodyRu?: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

const memory: PlatformCoreNotificationEvent[] = [];
const MAX_EVENTS = 64;

function trimMemory(): void {
  if (memory.length > MAX_EVENTS) memory.splice(0, memory.length - MAX_EVENTS);
}

function rowToEvent(row: {
  id: string;
  role: string;
  scope_key: string;
  order_id: string | null;
  collection_id: string | null;
  article_id: string | null;
  kind: string;
  title_ru: string;
  body_ru: string | null;
  href: string | null;
  read: boolean;
  created_at: Date;
}): PlatformCoreNotificationEvent {
  return {
    id: row.id,
    role: row.role as PlatformCoreNotificationRole,
    scopeKey: row.scope_key,
    orderId: row.order_id ?? undefined,
    collectionId: row.collection_id ?? undefined,
    articleId: row.article_id ?? undefined,
    kind: row.kind as PlatformCoreNotificationKind,
    titleRu: row.title_ru,
    bodyRu: row.body_ru ?? undefined,
    href: row.href ?? undefined,
    read: row.read,
    createdAt: row.created_at.toISOString(),
  };
}

export async function countUnreadPlatformCoreNotificationEventsByOrder(input: {
  role: PlatformCoreNotificationRole;
  scopeKey?: string;
  orderIds: readonly string[];
}): Promise<{ byOrder: Record<string, number>; storageMode: 'postgres' | 'memory' }> {
  const role = input.role;
  const scopeKey = input.scopeKey?.trim() ?? '';
  const orderIds = [...new Set(input.orderIds.map((id) => id.trim()).filter(Boolean))];
  const empty = { byOrder: {} as Record<string, number>, storageMode: 'memory' as const };
  if (orderIds.length === 0) return empty;

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const conditions = ['role = $1', 'NOT read', 'order_id = ANY($2::text[])'];
    const params: unknown[] = [role, orderIds];
    if (scopeKey) {
      params.push(scopeKey);
      conditions.push(`scope_key = $${params.length}`);
    }
    const res = await getWorkshop2PgPool().query(
      `SELECT order_id, COUNT(*)::int AS unread_count
       FROM platform_core_notification_events
       WHERE ${conditions.join(' AND ')}
       GROUP BY order_id`,
      params
    );
    const byOrder: Record<string, number> = {};
    for (const row of res.rows as Array<{ order_id: string; unread_count: number }>) {
      const oid = row.order_id?.trim();
      if (oid) byOrder[oid] = row.unread_count;
    }
    return { byOrder, storageMode: 'postgres' };
  }

  const byOrder: Record<string, number> = {};
  const orderIdSet = new Set(orderIds);
  for (const e of memory) {
    if (e.role !== role) continue;
    if (scopeKey && e.scopeKey !== scopeKey) continue;
    const oid = e.orderId?.trim();
    if (!oid || !orderIdSet.has(oid) || e.read) continue;
    byOrder[oid] = (byOrder[oid] ?? 0) + 1;
  }
  return { byOrder, storageMode: 'memory' };
}

export async function listPlatformCoreNotificationEvents(input: {
  role: PlatformCoreNotificationRole;
  scopeKey?: string;
  orderId?: string;
  limit?: number;
}): Promise<{ events: PlatformCoreNotificationEvent[]; storageMode: 'postgres' | 'memory' }> {
  const role = input.role;
  const scopeKey = input.scopeKey?.trim() ?? '';
  const orderId = input.orderId?.trim();
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 24);

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    const conditions = ['role = $1'];
    const params: unknown[] = [role];
    if (scopeKey) {
      params.push(scopeKey);
      conditions.push(`scope_key = $${params.length}`);
    }
    if (orderId) {
      params.push(orderId);
      conditions.push(`order_id = $${params.length}`);
    }
    params.push(limit);
    const res = await getWorkshop2PgPool().query(
      `SELECT id, role, scope_key, order_id, collection_id, article_id, kind, title_ru, body_ru, href, read, created_at
       FROM platform_core_notification_events
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
      params
    );
    return {
      events: res.rows.map(rowToEvent),
      storageMode: 'postgres',
    };
  }

  const filtered = memory
    .filter((e) => e.role === role)
    .filter((e) => !scopeKey || e.scopeKey === scopeKey)
    .filter((e) => !orderId || e.orderId === orderId)
    .slice(-limit)
    .reverse();
  return { events: filtered, storageMode: 'memory' };
}

export async function appendPlatformCoreNotificationEvent(input: {
  role: PlatformCoreNotificationRole;
  scopeKey?: string;
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  kind: PlatformCoreNotificationKind;
  titleRu: string;
  bodyRu?: string;
  href?: string;
}): Promise<PlatformCoreNotificationEvent> {
  const event: PlatformCoreNotificationEvent = {
    id: `ntf-${randomUUID().slice(0, 12)}`,
    role: input.role,
    scopeKey: input.scopeKey?.trim() || 'platform-core',
    orderId: input.orderId?.trim() || undefined,
    collectionId: input.collectionId?.trim() || undefined,
    articleId: input.articleId?.trim() || undefined,
    kind: input.kind,
    titleRu: input.titleRu.trim(),
    bodyRu: input.bodyRu?.trim(),
    href: input.href?.trim(),
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureWorkshop2PgSchema();
    await getWorkshop2PgPool().query(
      `INSERT INTO platform_core_notification_events
         (id, role, scope_key, order_id, collection_id, article_id, kind, title_ru, body_ru, href, read, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::timestamptz)`,
      [
        event.id,
        event.role,
        event.scopeKey,
        event.orderId ?? null,
        event.collectionId ?? null,
        event.articleId ?? null,
        event.kind,
        event.titleRu,
        event.bodyRu ?? null,
        event.href ?? null,
        event.read,
        event.createdAt,
      ]
    );
    return event;
  }

  memory.push(event);
  trimMemory();
  return event;
}

/** Запись push-события по смене chain-status (S4) + слот в PG-календаре (Wave SN). */
export async function recordPlatformCoreChainNotificationEvents(input: {
  orderId: string;
  collectionId?: string;
  kind: 'inventory_reserved' | 'materials_supplied' | 'chain_status';
  titleRu: string;
  bodyRu?: string;
}): Promise<void> {
  const orderId = input.orderId.trim();
  if (!orderId) return;
  const collectionId = input.collectionId?.trim() || 'SS27';
  const hrefShop = `/shop/b2b/tracking?order=${encodeURIComponent(orderId)}`;
  const hrefBrand = `/brand/b2b-orders/${encodeURIComponent(orderId)}`;
  const roles: PlatformCoreNotificationRole[] = ['shop', 'brand', 'manufacturer', 'supplier'];
  await Promise.all(
    roles.map((role) =>
      appendPlatformCoreNotificationEvent({
        role,
        scopeKey: role === 'shop' ? 'shop1' : 'org-brand-001',
        orderId,
        collectionId,
        kind: input.kind,
        titleRu: input.titleRu,
        bodyRu: input.bodyRu,
        href:
          role === 'shop' ? hrefShop : role === 'brand' ? hrefBrand : undefined,
      })
    )
  );

  const { hookPlatformCoreChainCalendarOnBump } =
    await import('@/lib/server/platform-core-chain-calendar-hook');
  void hookPlatformCoreChainCalendarOnBump({
    orderIds: [orderId],
    collectionId,
    kind: input.kind,
    titleRu: input.titleRu,
    bodyRu: input.bodyRu,
  }).catch(() => undefined);
}
