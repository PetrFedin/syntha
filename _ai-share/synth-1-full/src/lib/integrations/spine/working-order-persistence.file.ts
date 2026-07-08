/**
 * Wave C2 · F-WORKING-ORDER version persistence (pillar 3).
 */
import 'server-only';

import fs from 'fs';
import path from 'path';

import type { B2BOrderLineItem } from '@/lib/order/b2b-order-payload';

export type WorkingOrderVersion = {
  versionId: string;
  wholesaleOrderId: string;
  label: string;
  sourcePlatform?: 'nuorder' | 'joor' | 'syntha' | 'zedonk';
  lines: B2BOrderLineItem[];
  status: 'draft' | 'submitted' | 'exported';
  createdAt: string;
};

type FileV1 = { schemaVersion: 1; byOrderId: Record<string, WorkingOrderVersion[]> };

const EMPTY: FileV1 = { schemaVersion: 1, byOrderId: {} };

function pathFile(): string {
  return (
    process.env.B2B_WORKING_ORDER_FILE?.trim() ||
    path.join(process.cwd(), 'data', 'b2b-working-order-versions.json')
  );
}

function load(): FileV1 {
  try {
    const j = JSON.parse(fs.readFileSync(pathFile(), 'utf8')) as FileV1;
    return j?.schemaVersion === 1
      ? { schemaVersion: 1, byOrderId: j.byOrderId ?? {} }
      : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

function save(data: FileV1): void {
  const p = pathFile();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  void import('./spine-operational-persistence.pg')
    .then((m) => m.mirrorWorkingOrderVersionsSnapshotToPg(data.byOrderId))
    .catch(() => {});
}

/** PG hydrate: replace full snapshot (idempotent). */
export function replaceWorkingOrderVersionsSnapshot(
  byOrderId: Record<string, WorkingOrderVersion[]>
): void {
  save({ schemaVersion: 1, byOrderId });
}

export function listWorkingOrderVersions(wholesaleOrderId: string): WorkingOrderVersion[] {
  return load().byOrderId[wholesaleOrderId.trim()] ?? [];
}

export function appendWorkingOrderVersion(version: WorkingOrderVersion): WorkingOrderVersion {
  const data = load();
  const id = version.wholesaleOrderId.trim();
  const list = data.byOrderId[id] ?? [];
  list.push(version);
  data.byOrderId[id] = list;
  save(data);
  return version;
}
