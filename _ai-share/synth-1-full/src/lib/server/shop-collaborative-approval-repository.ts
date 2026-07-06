import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import {
  defaultShopCollaborativeApprovalState,
  type ShopCollaborativeApprovalState,
  type ShopCollaborativeApprovalStepId,
  type ShopCollaborativeApprovalActor,
  shopCollaborativeApprovalCanAdvance,
  shopCollaborativeApprovalStepDone,
} from '@/lib/shop/shop-collaborative-approval-feed';
import {
  appendBrandCollaborativeMarginJournal,
  appendShopCollaborativeStepJournal,
} from '@/lib/server/shop-collaborative-session-journal-repository';
import { ensureWorkshop2PgSchema } from '@/lib/server/workshop2-dossier-repository';
import { getWorkshop2PgPool, isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

const memory = new Map<string, ShopCollaborativeApprovalState>();
const STORE_FILE = path.join(process.cwd(), 'data', 'shop-collaborative-approvals.json');
let fileHydrated = false;
let pgAvailable = false;

function scopeKey(buyerId: string, orderId: string): string {
  return `${buyerId.trim()}::${orderId.trim()}`;
}

function canUseDiskPersistence(): boolean {
  return process.env.NODE_ENV !== 'test';
}

function hydrateFileIfNeeded(): void {
  if (fileHydrated) return;
  fileHydrated = true;
  if (!canUseDiskPersistence()) return;
  try {
    if (!fs.existsSync(STORE_FILE)) return;
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as ShopCollaborativeApprovalState[];
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        if (row.buyerId && row.orderId) {
          memory.set(scopeKey(row.buyerId, row.orderId), row);
        }
      }
    }
  } catch {
    /* ignore corrupt file */
  }
}

function persistFile(): void {
  if (!canUseDiskPersistence()) return;
  try {
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify([...memory.values()], null, 2));
  } catch {
    /* best effort */
  }
}

function rowToState(row: {
  buyer_id: string;
  order_id: string;
  matrix_done: boolean;
  margin_done: boolean;
  submit_done: boolean;
  brand_actor: string | null;
  updated_at: Date;
}): ShopCollaborativeApprovalState {
  return {
    buyerId: row.buyer_id,
    orderId: row.order_id,
    matrixDone: row.matrix_done,
    marginDone: row.margin_done,
    submitDone: row.submit_done,
    brandActor: row.brand_actor ?? undefined,
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getShopCollaborativeApprovalServer(input: {
  buyerId: string;
  orderId: string;
}): Promise<ShopCollaborativeApprovalState | null> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const orderId = input.orderId.trim();
  if (!orderId) return null;

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      const res = await getWorkshop2PgPool().query<{
        buyer_id: string;
        order_id: string;
        matrix_done: boolean;
        margin_done: boolean;
        submit_done: boolean;
        brand_actor: string | null;
        updated_at: Date;
      }>(
        `SELECT buyer_id, order_id, matrix_done, margin_done, submit_done, brand_actor, updated_at
         FROM shop_collaborative_approvals
         WHERE buyer_id = $1 AND order_id = $2`,
        [buyerId, orderId]
      );
      pgAvailable = true;
      const row = res.rows[0];
      if (!row) return null;
      const state = rowToState(row);
      memory.set(scopeKey(buyerId, orderId), state);
      return state;
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  return memory.get(scopeKey(buyerId, orderId)) ?? null;
}

async function persistShopCollaborativeApprovalState(
  state: ShopCollaborativeApprovalState
): Promise<ShopCollaborativeApprovalState> {
  const next: ShopCollaborativeApprovalState = {
    ...state,
    updatedAt: new Date().toISOString(),
  };

  if (isWorkshop2PostgresEnabled()) {
    try {
      await ensureWorkshop2PgSchema();
      await getWorkshop2PgPool().query(
        `INSERT INTO shop_collaborative_approvals
           (buyer_id, order_id, matrix_done, margin_done, submit_done, brand_actor, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
         ON CONFLICT (buyer_id, order_id) DO UPDATE SET
           matrix_done = EXCLUDED.matrix_done,
           margin_done = EXCLUDED.margin_done,
           submit_done = EXCLUDED.submit_done,
           brand_actor = COALESCE(EXCLUDED.brand_actor, shop_collaborative_approvals.brand_actor),
           updated_at = EXCLUDED.updated_at`,
        [
          next.buyerId,
          next.orderId,
          next.matrixDone,
          next.marginDone,
          next.submitDone,
          next.brandActor ?? null,
          next.updatedAt,
        ]
      );
      pgAvailable = true;
      memory.set(scopeKey(next.buyerId, next.orderId), next);
      persistFile();
      return next;
    } catch {
      pgAvailable = false;
    }
  }

  hydrateFileIfNeeded();
  memory.set(scopeKey(next.buyerId, next.orderId), next);
  persistFile();
  return next;
}

export async function advanceShopCollaborativeApprovalStepServer(input: {
  buyerId: string;
  orderId: string;
  stepId: ShopCollaborativeApprovalStepId;
  actor?: ShopCollaborativeApprovalActor;
  brandActorLabel?: string;
}): Promise<{ state: ShopCollaborativeApprovalState; advanced: boolean }> {
  const buyerId = input.buyerId.trim() || 'shop1';
  const orderId = input.orderId.trim();
  const actor = input.actor ?? 'shop';
  if (!orderId) {
    throw new Error('orderId required');
  }

  const existing =
    (await getShopCollaborativeApprovalServer({ buyerId, orderId })) ??
    defaultShopCollaborativeApprovalState({ buyerId, orderId });

  if (!shopCollaborativeApprovalCanAdvance(existing, input.stepId, actor)) {
    return { state: existing, advanced: false };
  }

  const next: ShopCollaborativeApprovalState = {
    ...existing,
    matrixDone:
      input.stepId === 'matrix' ? true : shopCollaborativeApprovalStepDone(existing, 'matrix'),
    marginDone:
      input.stepId === 'margin' ? true : shopCollaborativeApprovalStepDone(existing, 'margin'),
    submitDone:
      input.stepId === 'submit' ? true : shopCollaborativeApprovalStepDone(existing, 'submit'),
    brandActor:
      input.stepId === 'margin' && actor === 'brand'
        ? input.brandActorLabel?.trim() || 'brand'
        : existing.brandActor,
    updatedAt: new Date().toISOString(),
  };

  const saved = await persistShopCollaborativeApprovalState(next);
  if (actor === 'brand' && input.stepId === 'margin') {
    await appendBrandCollaborativeMarginJournal({
      buyerId,
      orderId,
      brandActorLabel: input.brandActorLabel,
    });
  } else if (actor === 'shop') {
    await appendShopCollaborativeStepJournal({ buyerId, orderId, stepId: input.stepId });
  }
  return { state: saved, advanced: true };
}

export async function approveBrandCollaborativeMarginServer(input: {
  buyerId: string;
  orderId: string;
  brandActorLabel?: string;
}): Promise<{ state: ShopCollaborativeApprovalState; advanced: boolean }> {
  return advanceShopCollaborativeApprovalStepServer({
    buyerId: input.buyerId,
    orderId: input.orderId,
    stepId: 'margin',
    actor: 'brand',
    brandActorLabel: input.brandActorLabel,
  });
}

export function shopCollaborativeApprovalStorageMode(): 'pg' | 'file' | 'memory' {
  if (pgAvailable && isWorkshop2PostgresEnabled()) return 'pg';
  if (canUseDiskPersistence() && fs.existsSync(STORE_FILE)) return 'file';
  return 'memory';
}
