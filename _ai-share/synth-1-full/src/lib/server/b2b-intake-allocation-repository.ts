import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { AllocationPlan } from '@/lib/b2b/allocation/types';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const STORE_FILE = path.join(process.cwd(), 'data', 'b2b-intake-allocation-plans.json');

export type PersistedB2bIntakeAllocationPlan = {
  id: string;
  batchId: string;
  plan: AllocationPlan;
  createdAt: string;
  organizationId: string;
};

const memoryPlans: PersistedB2bIntakeAllocationPlan[] = [];

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function flushFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryPlans, null, 2), 'utf8');
  } catch {
    /* best-effort */
  }
}

function hydrateFileIfNeeded(): void {
  if (!canUseDiskPersistence() || memoryPlans.length > 0) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as PersistedB2bIntakeAllocationPlan[];
    if (Array.isArray(parsed)) memoryPlans.push(...parsed);
  } catch {
    /* ignore */
  }
}

async function ensureIntakeAllocationTable(): Promise<void> {
  await ensureWorkshop2PgSchema();
  await getWorkshop2PgPool().query(`
    CREATE TABLE IF NOT EXISTS workshop2_b2b_intake_allocations (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      batch_id TEXT NOT NULL,
      plan JSONB NOT NULL,
      demand_fingerprint TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await getWorkshop2PgPool().query(`
    CREATE INDEX IF NOT EXISTS workshop2_b2b_intake_alloc_batch_idx
      ON workshop2_b2b_intake_allocations (organization_id, batch_id, created_at DESC)
  `);
}

function hashIntakeAllocationLockKey(batchId: string, organizationId: string): string {
  return `intake:${organizationId}:${batchId}`;
}

function fingerprintIntakeDemand(plan: AllocationPlan): string {
  return JSON.stringify({
    allocations: plan.allocations?.map((a) => ({
      destinationType: a.destinationType,
      articleId: a.articleId,
      size: a.size,
      allocatedQuantity: a.allocatedQuantity,
    })),
    unallocated: plan.unallocated,
  });
}

/** Persist allocation plan (PG transaction + advisory lock or file/memory snapshot). */
export async function persistB2bIntakeAllocationPlan(input: {
  batchId: string;
  plan: AllocationPlan;
  organizationId?: string;
  idempotent?: boolean;
}): Promise<{
  ok: true;
  planId: string;
  mode: 'postgres' | 'file' | 'memory' | 'pg_only_blocked';
  idempotent?: boolean;
}> {
  const batchId = input.batchId.trim();
  if (!batchId) throw new Error('batchId required');

  const organizationId = input.organizationId?.trim() || 'org-brand-001';
  const demandFingerprint = fingerprintIntakeDemand(input.plan);
  const planId = `alloc-${batchId}-${Date.now()}`;
  const row: PersistedB2bIntakeAllocationPlan = {
    id: planId,
    batchId,
    plan: input.plan,
    createdAt: new Date().toISOString(),
    organizationId,
  };

  if (isWorkshop2PostgresEnabled()) {
    await ensureIntakeAllocationTable();
    const client = await getWorkshop2PgPool().connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [
        hashIntakeAllocationLockKey(batchId, organizationId),
      ]);

      if (input.idempotent !== false) {
        const existing = await client.query<{
          id: string;
          plan: AllocationPlan;
          demand_fingerprint: string | null;
        }>(
          `SELECT id, plan, demand_fingerprint
           FROM workshop2_b2b_intake_allocations
           WHERE organization_id = $1 AND batch_id = $2
           ORDER BY created_at DESC
           LIMIT 1
           FOR UPDATE`,
          [organizationId, batchId]
        );
        const prev = existing.rows[0];
        if (prev && prev.demand_fingerprint === demandFingerprint) {
          await client.query('COMMIT');
          return {
            ok: true,
            planId: prev.id,
            mode: 'postgres',
            idempotent: true,
          };
        }
      }

      await client.query(
        `INSERT INTO workshop2_b2b_intake_allocations
           (id, organization_id, batch_id, plan, demand_fingerprint, created_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6::timestamptz)`,
        [planId, organizationId, batchId, JSON.stringify(input.plan), demandFingerprint, row.createdAt]
      );
      await client.query('COMMIT');
      return { ok: true, planId, mode: 'postgres', idempotent: false };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  if (isWorkshop2PgOnlyMode()) {
    return { ok: true, planId, mode: 'pg_only_blocked' };
  }

  hydrateFileIfNeeded();
  memoryPlans.push(row);
  flushFile();
  return { ok: true, planId, mode: canUseDiskPersistence() ? 'file' : 'memory' };
}

export async function getLatestB2bIntakeAllocationPlan(batchId: string): Promise<PersistedB2bIntakeAllocationPlan | null> {
  const id = batchId.trim();
  if (!id) return null;

  if (isWorkshop2PostgresEnabled()) {
    await ensureIntakeAllocationTable();
    const res = await getWorkshop2PgPool().query(
      `SELECT id, organization_id, batch_id, plan, created_at
       FROM workshop2_b2b_intake_allocations
       WHERE batch_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );
    const row = res.rows[0] as
      | {
          id: string;
          organization_id: string;
          batch_id: string;
          plan: AllocationPlan;
          created_at: string;
        }
      | undefined;
    if (!row) return null;
    return {
      id: row.id,
      batchId: row.batch_id,
      plan: row.plan,
      createdAt: row.created_at,
      organizationId: row.organization_id,
    };
  }

  hydrateFileIfNeeded();
  return [...memoryPlans].reverse().find((p) => p.batchId === id) ?? null;
}
