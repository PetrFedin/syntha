import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { BrandAgentRepCommissionDisputeRecord } from '@/lib/fashion/brand-agent-rep-commission-dispute-store';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const DEFAULT_ORG = 'org-brand-001';
const memory: BrandAgentRepCommissionDisputeRecord[] = [];
const STORE_FILE = path.join(process.cwd(), 'data', 'brand-agent-rep-commission-disputes.json');
let fileHydrated = false;
let pgTouched = false;

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test' && !isWorkshop2PgOnlyMode();
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(
      fs.readFileSync(STORE_FILE, 'utf8')
    ) as BrandAgentRepCommissionDisputeRecord[];
    if (Array.isArray(parsed)) memory.push(...parsed);
  } catch {
    /* ignore */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(memory, null, 2));
  } catch {
    /* ignore */
  }
}

function mapPgRow(row: {
  dispute_id: string;
  commission_id: string;
  reason_ru: string;
  rep_name: string | null;
  status: string;
  created_at: Date;
}): BrandAgentRepCommissionDisputeRecord {
  return {
    disputeId: row.dispute_id,
    commissionId: row.commission_id,
    reasonRu: row.reason_ru,
    repName: row.rep_name,
    status: 'received',
    createdAt: row.created_at.toISOString(),
  };
}

async function listFromPg(
  organizationId: string
): Promise<BrandAgentRepCommissionDisputeRecord[] | null> {
  if (!isWorkshop2PostgresEnabled()) return null;
  await ensureWorkshop2PgSchema();
  const res = await getWorkshop2PgPool().query<{
    dispute_id: string;
    commission_id: string;
    reason_ru: string;
    rep_name: string | null;
    status: string;
    created_at: Date;
  }>(
    `SELECT dispute_id, commission_id, reason_ru, rep_name, status, created_at
     FROM brand_agent_rep_commission_disputes
     WHERE organization_id = $1
     ORDER BY created_at DESC
     LIMIT 200`,
    [organizationId]
  );
  pgTouched = true;
  return res.rows.map(mapPgRow);
}

async function insertToPg(
  organizationId: string,
  dispute: BrandAgentRepCommissionDisputeRecord
): Promise<boolean> {
  if (!isWorkshop2PostgresEnabled()) return false;
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(
    `INSERT INTO brand_agent_rep_commission_disputes
       (dispute_id, organization_id, commission_id, reason_ru, rep_name, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
     ON CONFLICT (dispute_id) DO NOTHING`,
    [
      dispute.disputeId,
      organizationId,
      dispute.commissionId,
      dispute.reasonRu,
      dispute.repName,
      dispute.status,
      dispute.createdAt,
    ]
  );
  pgTouched = true;
  return true;
}

export type BrandAgentRepCommissionDisputeStorageMode = 'postgres' | 'file' | 'memory';

export function brandAgentRepCommissionDisputeStorageMode(): BrandAgentRepCommissionDisputeStorageMode {
  if (pgTouched && isWorkshop2PostgresEnabled()) return 'postgres';
  hydrateFileIfNeeded();
  if (isWorkshop2PostgresEnabled()) return 'postgres';
  return canUseDiskPersistence() ? 'file' : 'memory';
}

export async function listBrandAgentRepCommissionDisputesServer(
  organizationId?: string
): Promise<BrandAgentRepCommissionDisputeRecord[]> {
  const orgId = organizationId?.trim() || DEFAULT_ORG;
  hydrateFileIfNeeded();

  const fromPg = await listFromPg(orgId);
  if (fromPg) return fromPg;

  if (isWorkshop2PgOnlyMode()) return [...memory];
  return [...memory];
}

export async function createBrandAgentRepCommissionDisputeServer(input: {
  commissionId: string;
  reasonRu: string;
  repName?: string | null;
  organizationId?: string;
}): Promise<BrandAgentRepCommissionDisputeRecord> {
  hydrateFileIfNeeded();
  const orgId = input.organizationId?.trim() || DEFAULT_ORG;
  const dispute: BrandAgentRepCommissionDisputeRecord = {
    disputeId: `disp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    commissionId: input.commissionId.trim(),
    reasonRu: input.reasonRu.trim(),
    repName: input.repName?.trim() || null,
    status: 'received',
    createdAt: new Date().toISOString(),
  };

  memory.unshift(dispute);
  persistFile();

  const pgOk = await insertToPg(orgId, dispute);
  if (!pgOk && isWorkshop2PgOnlyMode()) {
    /* memory retained for read-back in pg-only tests without live PG */
  }

  return dispute;
}
