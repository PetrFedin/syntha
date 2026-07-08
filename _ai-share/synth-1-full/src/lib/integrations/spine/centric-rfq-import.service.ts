/**
 * Wave D3 + E1: Centric RFQ → supplier procurement + comms thread.
 */
import 'server-only';

import { WORKSHOP2_ARTICLE_CONTEXT_TYPE } from '@/lib/production/workshop2-domain-event-types';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { upsertExternalRef } from './integration-external-refs-persistence.file';
import {
  getCentricRfqById,
  upsertCentricRfq,
  type CentricRfqLine,
  type CentricRfqRecord,
} from './centric-rfq-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_PROCUREMENT_SCOPES,
} from './spine-operational-store';
import {
  isSpineOperationalPgEnabled,
  mirrorCentricRfqRecordToPg,
} from './spine-operational-persistence.pg';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';

async function persistCentricRfqWriteThrough(record: CentricRfqRecord): Promise<CentricRfqRecord> {
  const saved = upsertCentricRfq(record);
  if (isSpineOperationalPgEnabled()) {
    await mirrorCentricRfqRecordToPg(saved);
  }
  return saved;
}

export type CentricRfqImportPayload = {
  rfqId: string;
  styleId: string;
  collectionId: string;
  articleId: string;
  b2bOrderId?: string;
  productionOrderId?: string;
  status?: 'open' | 'quoted' | 'awarded';
  lines?: CentricRfqLine[];
};

export async function importCentricRfq(
  payload: CentricRfqImportPayload,
  organizationId?: string
): Promise<CentricRfqRecord> {
  await ensureSpineOperationalStoreReady(SPINE_PROCUREMENT_SCOPES);
  const org = organizationId?.trim() || 'org-brand-001';
  const lines = payload.lines?.length
    ? payload.lines
    : [
        { materialName: 'Main fabric SS27', qty: 1200, unit: 'm', supplierHint: 'Textile Co' },
        { materialName: 'Lining', qty: 800, unit: 'm' },
      ];

  const record = await persistCentricRfqWriteThrough({
    rfqId: payload.rfqId,
    centricStyleId: payload.styleId,
    collectionId: payload.collectionId,
    articleId: payload.articleId,
    b2bOrderId: payload.b2bOrderId,
    productionOrderId: payload.productionOrderId,
    status: payload.status ?? 'open',
    lines,
    importedAt: new Date().toISOString(),
  });

  upsertExternalRef({
    platform: 'centric',
    externalId: payload.rfqId,
    synthaEntityType: 'material',
    synthaEntityId: `${payload.collectionId}:${payload.articleId}`,
    lastSyncedAt: new Date().toISOString(),
    syncDirection: 'inbound',
  });

  const articleCtx = `${payload.collectionId}:${payload.articleId}`;
  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId: articleCtx,
    message: `Centric RFQ ${payload.rfqId} · ${lines.length} строк материалов · статус ${record.status}.`,
  });

  if (payload.b2bOrderId) {
    await appendWorkshop2ContextualSystemMessage({
      organizationId: org,
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      contextId: workshop2B2bOrderContextId(payload.b2bOrderId),
      message: `RFQ Centric ${payload.rfqId} привязан к заказу · supplier procurement.`,
    });
  }

  return record;
}

export async function acknowledgeCentricRfq(input: {
  rfqId: string;
  status?: 'quoted' | 'awarded';
  organizationId?: string;
}): Promise<CentricRfqRecord | null> {
  await ensureSpineOperationalStoreReady(SPINE_PROCUREMENT_SCOPES);
  const org = input.organizationId?.trim() || 'org-brand-001';
  const existing = getCentricRfqById(input.rfqId);
  if (!existing) return null;

  const nextStatus: CentricRfqRecord['status'] =
    input.status ??
    (existing.status === 'open'
      ? 'quoted'
      : existing.status === 'quoted'
        ? 'awarded'
        : existing.status);

  const record = await persistCentricRfqWriteThrough({ ...existing, status: nextStatus });

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_ARTICLE_CONTEXT_TYPE,
    contextId: `${record.collectionId}:${record.articleId}`,
    message: `Centric RFQ ${record.rfqId} · статус ${record.status}.`,
  });

  if (record.b2bOrderId) {
    await appendWorkshop2ContextualSystemMessage({
      organizationId: org,
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      contextId: workshop2B2bOrderContextId(record.b2bOrderId),
      message: `RFQ Centric ${record.rfqId} · ${record.status} · supplier procurement.`,
    });
    bumpPlatformCoreChainStatus([record.b2bOrderId]);
  }

  return record;
}
