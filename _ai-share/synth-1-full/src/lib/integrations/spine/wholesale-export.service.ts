/**
 * Wave C2 · F-WORKING-ORDER + F-NU-EXPORT / JOOR export records.
 */
import 'server-only';

import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { getIntegrationMetaForOrder } from './integration-meta-persistence.file';
import { getImportedOrderRecord } from './imported-orders-persistence';
import { upsertExternalRef } from './integration-external-refs-persistence.file';
import type { IntegrationPlatform } from './integration-platform';
import {
  appendWorkingOrderVersion,
  listWorkingOrderVersions,
  type WorkingOrderVersion,
} from './working-order-persistence.file';
import { integrationPlatformLabelRu } from './integration-ui-utils';
import fs from 'fs';
import path from 'path';

export type WholesaleExportRecord = {
  wholesaleOrderId: string;
  platform: 'nuorder' | 'joor';
  externalExportId: string;
  exportedAt: string;
  status: 'pending' | 'acknowledged';
};

type ExportFileV1 = { schemaVersion: 1; byOrderId: Record<string, WholesaleExportRecord> };

function exportPath(): string {
  return (
    process.env.B2B_WHOLESALE_EXPORT_FILE?.trim() ||
    path.join(process.cwd(), 'data', 'b2b-wholesale-export.json')
  );
}

function loadExports(): ExportFileV1 {
  try {
    const j = JSON.parse(fs.readFileSync(exportPath(), 'utf8')) as ExportFileV1;
    return j?.schemaVersion === 1
      ? { schemaVersion: 1, byOrderId: j.byOrderId ?? {} }
      : { schemaVersion: 1, byOrderId: {} };
  } catch {
    return { schemaVersion: 1, byOrderId: {} };
  }
}

function saveExports(data: ExportFileV1): void {
  fs.mkdirSync(path.dirname(exportPath()), { recursive: true });
  fs.writeFileSync(exportPath(), JSON.stringify(data, null, 2), 'utf8');
  void import('./spine-operational-persistence.pg')
    .then((m) => m.mirrorWholesaleExportSnapshotToPg(data.byOrderId))
    .catch(() => {});
}

/** PG hydrate: replace full export snapshot (idempotent). */
export function replaceWholesaleExportSnapshot(
  byOrderId: Record<string, WholesaleExportRecord>
): void {
  saveExports({ schemaVersion: 1, byOrderId });
}

export function getWholesaleExport(wholesaleOrderId: string): WholesaleExportRecord | undefined {
  return loadExports().byOrderId[wholesaleOrderId.trim()];
}

/** PG-primary: read export from PG before file fallback. */
export async function resolveWholesaleExport(
  wholesaleOrderId: string
): Promise<WholesaleExportRecord | undefined> {
  const id = wholesaleOrderId.trim();
  if (!id) return undefined;
  const { isSpineOperationalPgPrimary } = await import('./spine-pg-hydrate-guards');
  if (isSpineOperationalPgPrimary()) {
    const { getWholesaleExportFromPgByOrderId } =
      await import('./spine-operational-persistence.pg');
    const pgHit = await getWholesaleExportFromPgByOrderId(id);
    if (pgHit) return pgHit;
  }
  return getWholesaleExport(id);
}

function platformSupportsExport(
  platform: IntegrationPlatform | 'syntha' | 'centric' | undefined
): platform is 'nuorder' | 'joor' {
  return platform === 'nuorder' || platform === 'joor';
}

export function createInitialWorkingOrderVersion(
  wholesaleOrderId: string,
  lines: B2BOrderLineItem[],
  sourcePlatform?: WorkingOrderVersion['sourcePlatform']
): WorkingOrderVersion {
  const existing = listWorkingOrderVersions(wholesaleOrderId);
  if (existing.length > 0) return existing[existing.length - 1]!;
  return appendWorkingOrderVersion({
    versionId: `WO-v1-${wholesaleOrderId}`,
    wholesaleOrderId,
    label: 'v1 · Syntha confirm snapshot',
    sourcePlatform: sourcePlatform ?? 'syntha',
    lines,
    status: 'submitted',
    createdAt: new Date().toISOString(),
  });
}

export async function exportWholesaleOrderAfterConfirm(
  wholesaleOrderId: string,
  organizationId?: string,
  opts?: { force?: boolean }
): Promise<WholesaleExportRecord | null> {
  const org = organizationId?.trim() || 'org-brand-001';
  const id = wholesaleOrderId.trim();
  const meta = getIntegrationMetaForOrder(id);
  const platform = meta?.sourcePlatform;
  if (!platformSupportsExport(platform)) return null;

  const existing = getWholesaleExport(id);
  if (existing && !opts?.force) return existing;

  const imported = getImportedOrderRecord(id);
  const suffix = opts?.force ? `-${Date.now().toString(36)}` : '';
  const externalExportId = `EXP-${id.replace(/[^A-Z0-9-]/gi, '').slice(-24)}${suffix}`;
  const record: WholesaleExportRecord = {
    wholesaleOrderId: id,
    platform,
    externalExportId,
    exportedAt: new Date().toISOString(),
    status: 'acknowledged',
  };

  const data = loadExports();
  data.byOrderId[id] = record;
  saveExports(data);

  const { isSpineOperationalPgPrimary } = await import('./spine-pg-hydrate-guards');
  if (isSpineOperationalPgPrimary()) {
    const { upsertWholesaleExportToPg } = await import('./spine-operational-persistence.pg');
    await upsertWholesaleExportToPg(record);
  }

  upsertExternalRef({
    platform,
    externalId: externalExportId,
    synthaEntityType: 'wholesale_order',
    synthaEntityId: id,
    lastSyncedAt: record.exportedAt,
    syncDirection: 'outbound',
  });

  if (imported?.lineItems) {
    const channelLabel = integrationPlatformLabelRu(platform);
    appendWorkingOrderVersion({
      versionId: `WO-export-${Date.now().toString(36)}`,
      wholesaleOrderId: id,
      label: `Экспорт · ${channelLabel}`,
      sourcePlatform: platform,
      lines: imported.lineItems,
      status: 'exported',
      createdAt: record.exportedAt,
    });
  }

  await appendWorkshop2ContextualSystemMessage({
    organizationId: org,
    contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
    contextId: workshop2B2bOrderContextId(id),
    message: `Исходящий экспорт подтверждён · ${externalExportId} после confirm.`,
  });

  return record;
}

export function addWorkingOrderEditVersion(input: {
  wholesaleOrderId: string;
  label: string;
  lines: B2BOrderLineItem[];
}): WorkingOrderVersion {
  const n = listWorkingOrderVersions(input.wholesaleOrderId).length + 1;
  return appendWorkingOrderVersion({
    versionId: `WO-v${n}-${Date.now().toString(36)}`,
    wholesaleOrderId: input.wholesaleOrderId.trim(),
    label: input.label,
    sourcePlatform: 'syntha',
    lines: input.lines,
    status: 'draft',
    createdAt: new Date().toISOString(),
  });
}
