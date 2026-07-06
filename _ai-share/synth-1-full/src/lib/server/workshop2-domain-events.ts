import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  isWorkshop2DomainEventType,
  WORKSHOP2_ARTICLE_CONTEXT_TYPE,
  workshop2ArticleContextId,
  type Workshop2DomainEventEnvelope,
  type Workshop2DomainEventType,
} from '@/lib/production/workshop2-domain-event-types';
import { appendBrandScPublishAuditJournal } from '@/lib/server/brand-sc-publish-audit-repository';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';

export type Workshop2DomainEventOutboxStatus = 'pending' | 'dispatched' | 'failed';

export type Workshop2DomainEventOutboxRow = {
  id: string;
  eventType: Workshop2DomainEventType;
  collectionId: string;
  articleId: string;
  payload: Record<string, unknown>;
  status: Workshop2DomainEventOutboxStatus;
  createdAt: string;
  dispatchedAt?: string;
  lastError?: string;
  organizationId?: string;
};

const memoryOutbox: Workshop2DomainEventOutboxRow[] = [];
const OUTBOX_FILE = path.join(process.cwd(), 'data', 'workshop2-domain-event-outbox.json');
let fileHydrated = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileOutboxIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(OUTBOX_FILE)) return;
    const raw = fs.readFileSync(OUTBOX_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Workshop2DomainEventOutboxRow[];
    if (Array.isArray(parsed)) memoryOutbox.push(...parsed);
  } catch {
    /* best-effort */
  }
}

function flushFileOutbox(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(OUTBOX_FILE), { recursive: true });
    fs.writeFileSync(OUTBOX_FILE, JSON.stringify(memoryOutbox, null, 2), 'utf8');
  } catch {
    /* best-effort */
  }
}

function newEventId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `w2evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mirrorShowroomPublishedToBrandScAuditJournal(input: {
  collectionId: string;
  articleId: string;
  payload: Record<string, unknown>;
  organizationId?: string;
}): void {
  void appendBrandScPublishAuditJournal({
    collectionId: input.collectionId,
    articleId: input.articleId,
    source: String(input.payload.source ?? 'showroom_publish'),
    campaignName: String(input.payload.campaignName ?? ''),
    payload: input.payload,
    organizationId: input.organizationId,
  }).catch(() => {
    /* best-effort */
  });
}

async function postDomainEventWebhook(row: Workshop2DomainEventOutboxRow): Promise<boolean> {
  const url = process.env.WORKSHOP2_DOMAIN_EVENTS_WEBHOOK_URL?.trim();
  if (!url) return false;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.WORKSHOP2_DOMAIN_EVENTS_WEBHOOK_SECRET
        ? { 'X-Workshop2-Secret': process.env.WORKSHOP2_DOMAIN_EVENTS_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify({
      id: row.id,
      type: row.eventType,
      collectionId: row.collectionId,
      articleId: row.articleId,
      payload: row.payload,
      createdAt: row.createdAt,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`webhook_http_${res.status}`);
  return true;
}

/** Wave 3 P2: Slack mirror when WORKSHOP2_SLACK_WEBHOOK_URL set (honest outbound, no fake ACK). */
async function postDomainEventSlackMirror(row: Workshop2DomainEventOutboxRow): Promise<boolean> {
  const url = process.env.WORKSHOP2_SLACK_WEBHOOK_URL?.trim();
  if (!url) return false;
  const text = formatDomainEventChatMessageRu(row);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`slack_webhook_http_${res.status}`);
  return true;
}

/** Wave 7 P1: Microsoft Teams Adaptive Card (minimal) when WORKSHOP2_TEAMS_WEBHOOK_URL set. */
async function postDomainEventTeamsMirror(row: Workshop2DomainEventOutboxRow): Promise<boolean> {
  const url = process.env.WORKSHOP2_TEAMS_WEBHOOK_URL?.trim();
  if (!url) return false;
  const text = formatDomainEventChatMessageRu(row);
  const card = {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              text,
              wrap: true,
            },
            {
              type: 'TextBlock',
              text: `${row.eventType} · ${row.collectionId}/${row.articleId}`,
              size: 'Small',
              isSubtle: true,
            },
          ],
        },
      },
    ],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`teams_webhook_http_${res.status}`);
  return true;
}

function formatDomainEventChatMessageRu(row: Workshop2DomainEventOutboxRow): string {
  const gate = String(row.payload.gateScope ?? row.payload.gate ?? 'gate');
  const reason = String(row.payload.reason ?? '');
  switch (row.eventType) {
    case 'dossier.gate_blocked':
      if (reason === 'lab_dip_pending') {
        return `[Система] Gate заблокирован: lab dip не одобрен — ${String(row.payload.messageRu ?? 'согласуйте colorway')}`;
      }
      return `[Система] Gate заблокирован (${gate}): ${String(row.payload.messageRu ?? 'проверьте readiness')}`;
    case 'dossier.gate_passed':
      return `[Система] Gate пройден (${gate})`;
    case 'showroom.published':
      return `[Система] Шоурум опубликован в PG · кампания ${String(row.payload.campaignName ?? row.articleId)}`;
    case 'change_request.approved':
      return `[Система] CR одобрен: ${String(row.payload.changeRequestId ?? '').slice(0, 8)}`;
    case 'sample_order.status_changed': {
      const src = String(row.payload.source ?? '');
      if (src.includes('mes') || row.payload.mesStatus) {
        return `[Система] MES → образец ${String(row.payload.orderId ?? '').slice(0, 8)}: ${String(row.payload.previousStatus ?? '?')} → ${String(row.payload.status ?? 'unknown')}`;
      }
      if (src === 'inspector_offline_replay') {
        return `[Система] Inspector offline sync: отчёт ${String(row.payload.orderId ?? '').slice(0, 8)} записан в PG`;
      }
      return `[Система] Образец ${String(row.payload.orderId ?? '').slice(0, 8)} → ${String(row.payload.status ?? 'unknown')}`;
    }
    case 'supply.cut_ticket.created':
      return `[Система] Cut ticket ${String(row.payload.ticketNo ?? row.payload.ticketId ?? '')} создан`;
    case 'supply.fabric_roll.created':
      return `[Система] Fabric roll ${String(row.payload.rollLot ?? row.payload.rollId ?? '')} добавлен`;
    case 'supply.garment_dye.created':
      return `[Система] Garment dye ${String(row.payload.colorwayLabel ?? row.payload.opId ?? '')} зарегистрирован`;
    case 'qc.mes_defect.ingested':
      return String(
        row.payload.messageRu ?? `[Система] MES QC: ${String(row.payload.defectCode ?? 'defect')}`
      );
    case 'b2b.marketplace_order.received':
      return `[Система] B2B marketplace: заказ ${String(row.payload.externalOrderId ?? '')} (${String(row.payload.provider ?? 'joor')})`;
    case 'b2b.inbound_order.received':
      return String(
        row.payload.messageRu ??
          `[Система] B2B inbound: ${String(row.payload.externalOrderRef ?? row.payload.orderId ?? '')}`
      );
    case 'b2b.oauth_inbound.received':
      return String(
        row.payload.messageRu ??
          `[Система] B2B OAuth inbound: ${String(row.payload.externalOrderRef ?? row.payload.orderId ?? '')} (${String(row.payload.provider ?? 'oauth')})`
      );
    case 'b2b.order.status_changed':
      return String(
        row.payload.messageRu ??
          `[Система] B2B заказ ${String(row.payload.orderId ?? '')}: ${String(row.payload.from ?? '?')} → ${String(row.payload.to ?? '?')}`
      );
    case 'fit.comment.added':
      return `[Система] Fit comment: ${String(row.payload.text ?? '').slice(0, 120)} — ${String(row.payload.author ?? 'author')}`;
    case 'supply.vendor_bid.received':
      return `[Система] Vendor bid ${String(row.payload.vendorName ?? '')}: ${String(row.payload.cmtPrice ?? '?')} ${String(row.payload.currency ?? 'RUB')}`;
    default:
      return `[Система] ${row.eventType}`;
  }
}

async function dispatchRowSubscribers(row: Workshop2DomainEventOutboxRow): Promise<void> {
  const chatMessage = formatDomainEventChatMessageRu(row);
  if (row.eventType === 'b2b.order.status_changed') {
    const orderId = String(row.payload.orderId ?? '').trim();
    if (orderId) {
      const { WORKSHOP2_B2B_ORDER_CONTEXT_TYPE, workshop2B2bOrderContextId } =
        await import('@/lib/production/workshop2-b2b-order-lifecycle');
      await appendWorkshop2ContextualSystemMessage({
        contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
        contextId: workshop2B2bOrderContextId(orderId),
        message: chatMessage,
        organizationId: row.organizationId,
      });
      const { bumpPlatformCoreChainStatus } =
        await import('@/lib/server/platform-core-chain-status-hub');
      bumpPlatformCoreChainStatus([orderId]);
    }
    const { bumpPlatformCoreB2bRegistry } =
      await import('@/lib/server/platform-core-b2b-registry-hub');
    bumpPlatformCoreB2bRegistry(row.eventType);
  }
  await appendWorkshop2ContextualSystemMessage({
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId: workshop2ArticleContextId(row.collectionId, row.articleId),
    message: chatMessage,
    organizationId: row.organizationId,
  });
  if (
    row.eventType === 'dossier.gate_passed' &&
    String(row.payload.gateScope ?? '') === 'showroom_publish'
  ) {
    try {
      const { getWorkshop2ServerDossierRecord } =
        await import('@/lib/server/workshop2-phase1-dossier-server-store');
      const { runWorkshop2AutoShowroomPublishIfEnabled } =
        await import('@/lib/server/workshop2-auto-showroom-publish-server');
      const { enqueueWorkshop2DomainEvent: enqueueFollowUp } =
        await import('@/lib/server/workshop2-domain-events');
      const record = await getWorkshop2ServerDossierRecord(row.collectionId, row.articleId);
      if (record) {
        const auto = await runWorkshop2AutoShowroomPublishIfEnabled({
          collectionId: row.collectionId,
          articleId: row.articleId,
          dossier: record.dossier,
        });
        if (auto.published && auto.campaign) {
          void enqueueFollowUp({
            type: 'showroom.published',
            collectionId: row.collectionId,
            articleId: row.articleId,
            payload: {
              campaignName: auto.campaign.campaignName,
              autoPublish: true,
              source: 'showroom_publish_gate',
            },
            organizationId: row.organizationId,
            dispatchNow: false,
          }).catch(() => {
            /* dedupe chain best-effort */
          });
        }
      }
    } catch {
      /* auto publish best-effort */
    }
  }
  await postDomainEventWebhook(row);
  await postDomainEventSlackMirror(row);
  await postDomainEventTeamsMirror(row);

  if (
    row.eventType === 'sample_order.status_changed' ||
    row.eventType === 'showroom.published' ||
    row.eventType === 'dossier.gate_passed'
  ) {
    const { bumpPlatformCoreDevelopmentStatus } =
      await import('@/lib/server/platform-core-development-status-hub');
    bumpPlatformCoreDevelopmentStatus([row.collectionId]);
  }

  if (row.eventType === 'sample_order.status_changed' || row.eventType === 'showroom.published') {
    const { bumpPlatformCoreCommsInbox } =
      await import('@/lib/server/platform-core-comms-inbox-hub');
    bumpPlatformCoreCommsInbox(row.eventType);
  }
}

export async function enqueueWorkshop2DomainEvent(input: {
  type: Workshop2DomainEventType;
  collectionId: string;
  articleId: string;
  payload?: Record<string, unknown>;
  organizationId?: string;
  /** Немедленно диспетчеризовать подписчиков (chat + optional webhook). */
  dispatchNow?: boolean;
}): Promise<Workshop2DomainEventOutboxRow> {
  const createdAt = new Date().toISOString();
  const payload = input.payload ?? {};
  const organizationId = input.organizationId ?? 'org-brand-001';

  if (!isWorkshop2PostgresEnabled()) {
    hydrateFileOutboxIfNeeded();
    const row: Workshop2DomainEventOutboxRow = {
      id: newEventId(),
      eventType: input.type,
      collectionId: input.collectionId.trim(),
      articleId: input.articleId.trim(),
      payload,
      status: 'pending',
      createdAt,
      organizationId,
    };
    memoryOutbox.push(row);
    flushFileOutbox();
    if (input.type === 'showroom.published') {
      mirrorShowroomPublishedToBrandScAuditJournal({
        collectionId: row.collectionId,
        articleId: row.articleId,
        payload,
        organizationId,
      });
    }
    if (input.dispatchNow !== false) {
      try {
        await dispatchRowSubscribers(row);
        row.status = 'dispatched';
        row.dispatchedAt = new Date().toISOString();
        flushFileOutbox();
      } catch (e) {
        row.status = 'failed';
        row.lastError = e instanceof Error ? e.message : 'dispatch_failed';
        flushFileOutbox();
      }
    }
    return row;
  }

  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{ id: number; created_at: Date }>(
    `INSERT INTO workshop2_domain_event_outbox
       (organization_id, event_type, collection_id, article_id, payload, status)
     VALUES ($1, $2, $3, $4, $5::jsonb, 'pending')
     RETURNING id, created_at`,
    [
      organizationId,
      input.type,
      input.collectionId.trim(),
      input.articleId.trim(),
      JSON.stringify(payload),
    ]
  );
  const pg = res.rows[0]!;
  const row: Workshop2DomainEventOutboxRow = {
    id: String(pg.id),
    eventType: input.type,
    collectionId: input.collectionId.trim(),
    articleId: input.articleId.trim(),
    payload,
    status: 'pending',
    createdAt: pg.created_at.toISOString(),
    organizationId,
  };

  if (input.type === 'showroom.published') {
    mirrorShowroomPublishedToBrandScAuditJournal({
      collectionId: row.collectionId,
      articleId: row.articleId,
      payload,
      organizationId,
    });
  }

  if (input.dispatchNow !== false) {
    try {
      await dispatchRowSubscribers(row);
      await getWorkshop2PgPool().query(
        `UPDATE workshop2_domain_event_outbox
         SET status = 'dispatched', dispatched_at = NOW(), last_error = NULL
         WHERE id = $1`,
        [pg.id]
      );
      row.status = 'dispatched';
      row.dispatchedAt = new Date().toISOString();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'dispatch_failed';
      await getWorkshop2PgPool().query(
        `UPDATE workshop2_domain_event_outbox SET status = 'failed', last_error = $2 WHERE id = $1`,
        [pg.id, msg]
      );
      row.status = 'failed';
      row.lastError = msg;
    }
  }

  return row;
}

export async function processWorkshop2DomainEventOutboxBatch(limit = 20): Promise<{
  dispatched: number;
  failed: number;
}> {
  const result = { dispatched: 0, failed: 0 };

  if (!isWorkshop2PostgresEnabled()) {
    hydrateFileOutboxIfNeeded();
    let n = 0;
    for (const row of memoryOutbox) {
      if (row.status !== 'pending' && row.status !== 'failed') continue;
      try {
        await dispatchRowSubscribers(row);
        row.status = 'dispatched';
        row.dispatchedAt = new Date().toISOString();
        row.lastError = undefined;
        result.dispatched += 1;
      } catch (e) {
        row.status = 'failed';
        row.lastError = e instanceof Error ? e.message : 'dispatch_failed';
        result.failed += 1;
      }
      n += 1;
      if (n >= limit) break;
    }
    flushFileOutbox();
    return result;
  }

  await ensureWorkshop2PgSchema();
  const pending = await getWorkshop2PgPool().query<{
    id: number;
    event_type: string;
    collection_id: string;
    article_id: string;
    payload: Record<string, unknown>;
    created_at: Date;
    organization_id: string;
  }>(
    `SELECT id, event_type, collection_id, article_id, payload, created_at, organization_id
     FROM workshop2_domain_event_outbox
     WHERE status IN ('pending', 'failed')
     ORDER BY created_at ASC
     LIMIT $1`,
    [limit]
  );

  for (const row of pending.rows) {
    if (!isWorkshop2DomainEventType(row.event_type)) continue;
    const envelope: Workshop2DomainEventOutboxRow = {
      id: String(row.id),
      eventType: row.event_type,
      collectionId: row.collection_id,
      articleId: row.article_id,
      payload: row.payload ?? {},
      status: 'pending',
      createdAt: row.created_at.toISOString(),
      organizationId: row.organization_id,
    };
    try {
      await dispatchRowSubscribers(envelope);
      await getWorkshop2PgPool().query(
        `UPDATE workshop2_domain_event_outbox
         SET status = 'dispatched', dispatched_at = NOW(), last_error = NULL
         WHERE id = $1`,
        [row.id]
      );
      result.dispatched += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'dispatch_failed';
      await getWorkshop2PgPool().query(
        `UPDATE workshop2_domain_event_outbox SET status = 'failed', last_error = $2 WHERE id = $1`,
        [row.id, msg]
      );
      result.failed += 1;
    }
  }

  return result;
}

export async function listWorkshop2DomainEventsForArticle(input: {
  collectionId: string;
  articleId: string;
  since?: string;
  limit?: number;
}): Promise<Workshop2DomainEventEnvelope[]> {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  const cid = input.collectionId.trim();
  const aid = input.articleId.trim();

  if (!isWorkshop2PostgresEnabled()) {
    hydrateFileOutboxIfNeeded();
    const sinceMs = input.since ? Date.parse(input.since) : 0;
    return memoryOutbox
      .filter(
        (r) =>
          r.collectionId === cid &&
          r.articleId === aid &&
          (!sinceMs || Date.parse(r.createdAt) > sinceMs)
      )
      .slice(-limit)
      .map((r) => ({
        id: r.id,
        type: r.eventType,
        collectionId: r.collectionId,
        articleId: r.articleId,
        payload: r.payload,
        createdAt: r.createdAt,
        organizationId: r.organizationId,
      }));
  }

  await ensureWorkshop2PgSchema();
  const params: unknown[] = [cid, aid, limit];
  let sinceFilter = '';
  if (input.since?.trim()) {
    params.splice(2, 0, input.since.trim());
    sinceFilter = ' AND created_at > $3::timestamptz';
  }
  const res = await getWorkshop2PgPool().query<{
    id: number;
    event_type: string;
    collection_id: string;
    article_id: string;
    payload: Record<string, unknown>;
    created_at: Date;
    organization_id: string;
  }>(
    `SELECT id, event_type, collection_id, article_id, payload, created_at, organization_id
     FROM workshop2_domain_event_outbox
     WHERE collection_id = $1 AND article_id = $2${sinceFilter}
     ORDER BY created_at DESC
     LIMIT $${params.length}`,
    input.since?.trim() ? [cid, aid, input.since.trim(), limit] : [cid, aid, limit]
  );

  return res.rows
    .filter((r) => isWorkshop2DomainEventType(r.event_type))
    .map((r) => ({
      id: String(r.id),
      type: r.event_type as Workshop2DomainEventType,
      collectionId: r.collection_id,
      articleId: r.article_id,
      payload: r.payload ?? {},
      createdAt: r.created_at.toISOString(),
      organizationId: r.organization_id,
    }));
}

export async function listWorkshop2DomainEventsForCollection(input: {
  collectionId: string;
  eventType?: string;
  since?: string;
  limit?: number;
}): Promise<Workshop2DomainEventEnvelope[]> {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  const cid = input.collectionId.trim();
  const eventType = input.eventType?.trim();

  if (!isWorkshop2PostgresEnabled()) {
    hydrateFileOutboxIfNeeded();
    const sinceMs = input.since ? Date.parse(input.since) : 0;
    return memoryOutbox
      .filter(
        (r) =>
          r.collectionId === cid &&
          (!eventType || r.eventType === eventType) &&
          (!sinceMs || Date.parse(r.createdAt) > sinceMs)
      )
      .slice(-limit)
      .reverse()
      .map((r) => ({
        id: r.id,
        type: r.eventType,
        collectionId: r.collectionId,
        articleId: r.articleId,
        payload: r.payload,
        createdAt: r.createdAt,
        organizationId: r.organizationId,
      }));
  }

  await ensureWorkshop2PgSchema();
  const params: unknown[] = [cid];
  const filters: string[] = [];
  if (eventType) {
    params.push(eventType);
    filters.push(`event_type = $${params.length}`);
  }
  if (input.since?.trim()) {
    params.push(input.since.trim());
    filters.push(`created_at > $${params.length}::timestamptz`);
  }
  params.push(limit);
  const whereExtra = filters.length ? ` AND ${filters.join(' AND ')}` : '';
  const res = await getWorkshop2PgPool().query<{
    id: number;
    event_type: string;
    collection_id: string;
    article_id: string;
    payload: Record<string, unknown>;
    created_at: Date;
    organization_id: string;
  }>(
    `SELECT id, event_type, collection_id, article_id, payload, created_at, organization_id
     FROM workshop2_domain_event_outbox
     WHERE collection_id = $1${whereExtra}
     ORDER BY created_at DESC
     LIMIT $${params.length}`,
    params
  );

  return res.rows
    .filter((r) => isWorkshop2DomainEventType(r.event_type))
    .map((r) => ({
      id: String(r.id),
      type: r.event_type as Workshop2DomainEventType,
      collectionId: r.collection_id,
      articleId: r.article_id,
      payload: r.payload ?? {},
      createdAt: r.created_at.toISOString(),
      organizationId: r.organization_id,
    }));
}

export function clearWorkshop2DomainEventOutboxMemoryForTests(): void {
  memoryOutbox.length = 0;
  fileHydrated = false;
}
