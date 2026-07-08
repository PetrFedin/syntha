import { NextRequest, NextResponse } from 'next/server';

import { publishInventoryReconciliationCompleted } from '@/lib/order/domain-event-factories';
import {
  appendShopInventoryLedgerAdjust,
  listShopInventoryLedgerAdjustments,
  shopInventoryLedgerAdjustStorageMode,
} from '@/lib/server/shop-inventory-ledger-adjust-repository';
import type { ShopInventoryLedgerAdjustResult } from '@/lib/shop/shop-inventory-ledger-adjust.types';

function resolveShopId(req: NextRequest, bodyShopId?: string): string {
  return bodyShopId?.trim() || req.nextUrl.searchParams.get('shopId')?.trim() || 'shop1';
}

async function emitReconcileCompleted(input: {
  shopId: string;
  sku: string;
  delta: number;
}): Promise<void> {
  try {
    await publishInventoryReconciliationCompleted({
      aggregateId: `inv-${input.shopId}-${input.sku}`,
      version: Date.now(),
      payload: {
        locationId: input.shopId,
        discrepancy: Math.abs(input.delta),
        actionTaken: 'adjusted',
        actorId: 'shop-reconcile-panel',
        tenantId: input.shopId,
      },
    });
  } catch {
    /* event bus best effort */
  }
}

async function adjustOne(input: {
  shopId: string;
  sku: string;
  ledgerAtp: number;
  physicalOnHand: number;
}): Promise<ShopInventoryLedgerAdjustResult> {
  if (input.physicalOnHand === input.ledgerAtp) {
    return {
      record: {
        id: 'noop',
        shopId: input.shopId,
        sku: input.sku,
        delta: 0,
        reason: 'cycle_count_reconcile',
        adjustedAt: new Date().toISOString(),
      },
      newLedgerAtp: input.ledgerAtp,
      diffAfter: 0,
    };
  }

  const result = await appendShopInventoryLedgerAdjust(input);
  if (result.record.delta !== 0) {
    await emitReconcileCompleted({
      shopId: input.shopId,
      sku: input.sku,
      delta: result.record.delta,
    });
  }
  return result;
}

/** GET /api/shop/inventory/reconcile/adjust — journal of ledger corrections. */
export async function GET(req: NextRequest) {
  const shopId = resolveShopId(req);
  const adjustments = await listShopInventoryLedgerAdjustments(shopId);
  return NextResponse.json({
    ok: true,
    shopId,
    adjustments,
    storageMode: shopInventoryLedgerAdjustStorageMode(),
    messageRu: `${adjustments.length} adjust(ов) в журнале.`,
  });
}

/** POST — align ledger ATP to physical count (single SKU or bulk items[]). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const shopId = resolveShopId(req, String(body.shopId ?? ''));

  if (Array.isArray(body.items)) {
    const results: ShopInventoryLedgerAdjustResult[] = [];
    for (const raw of body.items) {
      const item = raw as Record<string, unknown>;
      const sku = String(item.sku ?? '').trim();
      const ledgerAtp = Number(item.ledgerAtp);
      const physicalOnHand = Number(item.physicalOnHand);
      if (!sku || Number.isNaN(ledgerAtp) || Number.isNaN(physicalOnHand)) continue;
      results.push(await adjustOne({ shopId, sku, ledgerAtp, physicalOnHand }));
    }
    return NextResponse.json({
      ok: true,
      shopId,
      results,
      count: results.length,
      storageMode: shopInventoryLedgerAdjustStorageMode(),
      messageRu: `Bulk adjust: ${results.length} SKU.`,
    });
  }

  const sku = String(body.sku ?? '').trim();
  const ledgerAtp = Number(body.ledgerAtp);
  const physicalOnHand = Number(body.physicalOnHand);

  if (!sku || Number.isNaN(ledgerAtp) || Number.isNaN(physicalOnHand)) {
    return NextResponse.json(
      { ok: false, messageRu: 'sku, ledgerAtp, physicalOnHand обязательны.' },
      { status: 400 }
    );
  }

  const result = await adjustOne({ shopId, sku, ledgerAtp, physicalOnHand });

  return NextResponse.json({
    ok: true,
    result,
    storageMode: shopInventoryLedgerAdjustStorageMode(),
    messageRu:
      result.record.delta === 0
        ? 'Diff = 0, adjust не требуется.'
        : `Ledger ${sku}: ${result.record.delta > 0 ? '+' : ''}${result.record.delta} → ATP ${result.newLedgerAtp}.`,
  });
}
