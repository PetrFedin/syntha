import 'server-only';

import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';
import type { WorkingOrderVersion } from '@/lib/integrations/spine/working-order-persistence.file';
import { listWorkingOrderVersions } from '@/lib/integrations/spine/working-order-persistence.file';
import {
  isSpineOperationalPgEnabled,
  listWorkingOrderVersionsForOrderFromPg,
} from '@/lib/integrations/spine/spine-operational-persistence.pg';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import {
  appendShopWorkingOrderVersionDiffJournal,
  shopWorkingOrderVersionJournalStorageMode,
} from '@/lib/server/shop-working-order-version-journal-repository';

export type WorkingOrderVersionLineDiff = {
  productId: string;
  fromQty: number;
  toQty: number;
  delta: number;
};

export type WorkingOrderVersionDiffResult = {
  ok: boolean;
  wholesaleOrderId: string;
  fromVersionId?: string;
  toVersionId?: string;
  fromLabel?: string;
  toLabel?: string;
  addedLines: WorkingOrderVersionLineDiff[];
  removedLines: WorkingOrderVersionLineDiff[];
  changedLines: WorkingOrderVersionLineDiff[];
  changedSkuCount: number;
  summaryRu: string;
  journalId?: string;
};

function workingOrderVersionDiffChangedSkuCount(
  added: WorkingOrderVersionLineDiff[],
  removed: WorkingOrderVersionLineDiff[],
  changed: WorkingOrderVersionLineDiff[]
): number {
  return added.length + removed.length + changed.length;
}

function lineKey(line: B2BOrderLineItem): string {
  return line.productId?.trim() || 'unknown';
}

function lineQty(line: B2BOrderLineItem): number {
  const n = Number(line.quantity ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function qtyMap(lines: B2BOrderLineItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of lines) {
    const key = lineKey(line);
    map.set(key, (map.get(key) ?? 0) + lineQty(line));
  }
  return map;
}

function isWorkingOrderPgPrimary(): boolean {
  return process.env.SPINE_OPERATIONAL_PG_PRIMARY === '1' && isSpineOperationalPgEnabled();
}

export async function resolveWorkingOrderVersionsForOrder(
  wholesaleOrderId: string
): Promise<WorkingOrderVersion[]> {
  const orderId = wholesaleOrderId.trim();
  if (isWorkshop2PostgresEnabled()) {
    const fromPg = await listWorkingOrderVersionsForOrderFromPg(orderId);
    if (fromPg.length > 0) return fromPg;
    if (isWorkingOrderPgPrimary()) return [];
  }
  return listWorkingOrderVersions(orderId);
}

export function shopWorkingOrderVersionDiffStorageMode(): 'postgres' | 'file' | 'memory' {
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  return 'file';
}

/** Diff двух версий working order (последние две, если ids не указаны). */
export async function diffShopWorkingOrderVersions(input: {
  wholesaleOrderId: string;
  fromVersionId?: string;
  toVersionId?: string;
  persistJournal?: boolean;
}): Promise<WorkingOrderVersionDiffResult> {
  const wholesaleOrderId = input.wholesaleOrderId.trim();
  const versions = await resolveWorkingOrderVersionsForOrder(wholesaleOrderId);

  if (versions.length === 0) {
    return {
      ok: false,
      wholesaleOrderId,
      addedLines: [],
      removedLines: [],
      changedLines: [],
      changedSkuCount: 0,
      summaryRu: 'Нет версий рабочего заказа.',
    };
  }

  const toVersion =
    (input.toVersionId
      ? versions.find((v) => v.versionId === input.toVersionId)
      : versions[versions.length - 1]) ?? versions[versions.length - 1]!;
  const fromVersion =
    (input.fromVersionId
      ? versions.find((v) => v.versionId === input.fromVersionId)
      : versions.length > 1
        ? versions[versions.length - 2]
        : undefined) ?? undefined;

  if (!fromVersion) {
    const diff: WorkingOrderVersionDiffResult = {
      ok: true,
      wholesaleOrderId,
      toVersionId: toVersion.versionId,
      toLabel: toVersion.label,
      addedLines: [],
      removedLines: [],
      changedLines: [],
      changedSkuCount: 0,
      summaryRu: `Одна версия «${toVersion.label}» — сравнение недоступно.`,
    };
    if (input.persistJournal !== false) {
      const journal = await appendShopWorkingOrderVersionDiffJournal({ diff });
      diff.journalId = journal.id;
    }
    return diff;
  }

  const fromMap = qtyMap(fromVersion.lines);
  const toMap = qtyMap(toVersion.lines);
  const addedLines: WorkingOrderVersionLineDiff[] = [];
  const removedLines: WorkingOrderVersionLineDiff[] = [];
  const changedLines: WorkingOrderVersionLineDiff[] = [];

  for (const [productId, toQty] of toMap) {
    const fromQty = fromMap.get(productId);
    if (fromQty == null) {
      addedLines.push({ productId, fromQty: 0, toQty, delta: toQty });
    } else if (fromQty !== toQty) {
      changedLines.push({ productId, fromQty, toQty, delta: toQty - fromQty });
    }
  }

  for (const [productId, fromQty] of fromMap) {
    if (!toMap.has(productId)) {
      removedLines.push({ productId, fromQty, toQty: 0, delta: -fromQty });
    }
  }

  const parts: string[] = [];
  if (addedLines.length) parts.push(`+${addedLines.length} SKU`);
  if (removedLines.length) parts.push(`−${removedLines.length} SKU`);
  if (changedLines.length) parts.push(`Δ ${changedLines.length} SKU`);

  const diff: WorkingOrderVersionDiffResult = {
    ok: true,
    wholesaleOrderId,
    fromVersionId: fromVersion.versionId,
    toVersionId: toVersion.versionId,
    fromLabel: fromVersion.label,
    toLabel: toVersion.label,
    addedLines,
    removedLines,
    changedLines,
    changedSkuCount: workingOrderVersionDiffChangedSkuCount(addedLines, removedLines, changedLines),
    summaryRu:
      parts.length > 0
        ? `${fromVersion.label} → ${toVersion.label}: ${parts.join(', ')}.`
        : `${fromVersion.label} → ${toVersion.label}: без изменений количества.`,
  };

  if (input.persistJournal !== false) {
    const journal = await appendShopWorkingOrderVersionDiffJournal({ diff });
    diff.journalId = journal.id;
  }

  return diff;
}

export { shopWorkingOrderVersionJournalStorageMode };
