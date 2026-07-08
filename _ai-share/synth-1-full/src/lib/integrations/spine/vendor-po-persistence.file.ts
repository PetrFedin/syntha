/**
 * Wave D6 · P4-AM-VENDOR-PO — Apparel Magic vendor PO (supplier · pillar 4).
 */
import 'server-only';

import fs from 'fs';
import path from 'path';

export type VendorPoLine = {
  materialName: string;
  qty: number;
  unit?: string;
  ackQty?: number;
  ackDate?: string;
};

export type VendorPoRecord = {
  vendorPoId: string;
  b2bOrderId: string;
  productionOrderId?: string;
  platform: 'apparel_magic';
  status: 'open' | 'acknowledged' | 'shipped';
  lines: VendorPoLine[];
  importedAt: string;
  acknowledgedAt?: string;
};

type FileV1 = {
  schemaVersion: 1;
  byVendorPoId: Record<string, VendorPoRecord>;
  byOrderId: Record<string, string>;
};

const EMPTY: FileV1 = { schemaVersion: 1, byVendorPoId: {}, byOrderId: {} };

function pathFile(): string {
  return (
    process.env.B2B_VENDOR_PO_FILE?.trim() || path.join(process.cwd(), 'data', 'b2b-vendor-po.json')
  );
}

function load(): FileV1 {
  try {
    const j = JSON.parse(fs.readFileSync(pathFile(), 'utf8')) as FileV1;
    if (j?.schemaVersion !== 1) return { ...EMPTY };
    return {
      schemaVersion: 1,
      byVendorPoId: j.byVendorPoId ?? {},
      byOrderId: j.byOrderId ?? {},
    };
  } catch {
    return { ...EMPTY };
  }
}

function save(data: FileV1): void {
  const p = pathFile();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

export function upsertVendorPo(record: VendorPoRecord): VendorPoRecord {
  const data = load();
  data.byVendorPoId[record.vendorPoId] = record;
  data.byOrderId[record.b2bOrderId] = record.vendorPoId;
  save(data);
  return record;
}

export function getVendorPoByOrderId(b2bOrderId: string): VendorPoRecord | undefined {
  const id = load().byOrderId[b2bOrderId.trim()];
  return id ? load().byVendorPoId[id] : undefined;
}

export function getVendorPoById(vendorPoId: string): VendorPoRecord | undefined {
  return load().byVendorPoId[vendorPoId.trim()];
}

export function listVendorPoRecords(): VendorPoRecord[] {
  return Object.values(load().byVendorPoId);
}

export function replaceVendorPoSnapshot(records: VendorPoRecord[]): void {
  const data: FileV1 = { schemaVersion: 1, byVendorPoId: {}, byOrderId: {} };
  for (const record of records) {
    data.byVendorPoId[record.vendorPoId] = record;
    data.byOrderId[record.b2bOrderId] = record.vendorPoId;
  }
  save(data);
}
