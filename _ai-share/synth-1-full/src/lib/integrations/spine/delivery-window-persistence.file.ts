/**
 * Wave E2 · F-CAL-Delivery — delivery windows per wholesaleOrderId (spine overlay).
 */
import 'server-only';

import fs from 'fs';
import path from 'path';

export type DeliveryWindowRecord = {
  wholesaleOrderId: string;
  collectionId: string;
  label: string;
  startAt: string;
  endAt: string;
  sourcePlatform?: 'joor' | 'nuorder' | 'zedonk' | 'syntha';
  updatedAt: string;
};

type FileV1 = { schemaVersion: 1; byOrderId: Record<string, DeliveryWindowRecord> };

const EMPTY: FileV1 = { schemaVersion: 1, byOrderId: {} };

function pathFile(): string {
  return (
    process.env.B2B_DELIVERY_WINDOWS_FILE?.trim() ||
    path.join(process.cwd(), 'data', 'b2b-delivery-windows.json')
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
    .then((m) => m.mirrorDeliveryWindowsSnapshotToPg(data.byOrderId))
    .catch(() => {});
}

export function upsertDeliveryWindow(record: DeliveryWindowRecord): DeliveryWindowRecord {
  const data = load();
  data.byOrderId[record.wholesaleOrderId] = record;
  save(data);
  return record;
}

export function getDeliveryWindow(wholesaleOrderId: string): DeliveryWindowRecord | undefined {
  return load().byOrderId[wholesaleOrderId.trim()];
}

export function listDeliveryWindowsForCollection(collectionId: string): DeliveryWindowRecord[] {
  const cid = collectionId.trim();
  return Object.values(load().byOrderId).filter((r) => r.collectionId === cid);
}
