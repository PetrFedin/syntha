import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { B2BPriorityStrategy } from '@/lib/b2b/allocation/allocation-engine';
import { persistB2bIntakeAllocationPlan } from '@/lib/server/b2b-intake-allocation-repository';
import { bumpPlatformCoreB2bRegistry } from '@/lib/server/platform-core-b2b-registry-hub';
import { bumpPlatformCoreCommsInbox } from '@/lib/server/platform-core-comms-inbox-hub';
import {
  guardWorkshop2Route,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

const itemSchema = z.object({
  articleId: z.string(),
  size: z.string(),
  quantity: z.number().int().nonnegative(),
});

const demandSchema = z.object({
  orderId: z.string().optional(),
  storeId: z.string().optional(),
  articleId: z.string(),
  size: z.string(),
  requestedQuantity: z.number().int().nonnegative(),
});

const allocatePayloadSchema = z.object({
  batch: z.object({
    batchId: z.string(),
    items: z.array(itemSchema),
  }),
  demand: z.object({
    b2bBackorders: z.array(demandSchema),
    ecomDemand: z.array(demandSchema),
    retailDemand: z.array(demandSchema),
  }),
});

export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  try {
    const json = await req.json();
    const payload = allocatePayloadSchema.parse(json);

    const strategy = new B2BPriorityStrategy();
    const demandProfile = {
      b2bBackorders: payload.demand.b2bBackorders.map((d) => ({
        ...d,
        orderId: d.orderId || 'UNKNOWN',
      })),
      ecomDemand: payload.demand.ecomDemand,
      retailDemand: payload.demand.retailDemand.map((d) => ({
        ...d,
        storeId: d.storeId || 'UNKNOWN',
      })),
    };

    const plan = strategy.allocate(payload.batch, demandProfile);
    const persisted = await persistB2bIntakeAllocationPlan({
      batchId: payload.batch.batchId,
      plan,
      idempotent: true,
    });

    if (persisted.mode === 'postgres' && !persisted.idempotent) {
      bumpPlatformCoreB2bRegistry('b2b.intake_allocated');
      bumpPlatformCoreCommsInbox('b2b.intake_allocated');
    }

    return NextResponse.json({
      ...plan,
      planId: persisted.planId,
      persistMode: persisted.mode,
      idempotent: persisted.idempotent === true,
      messageRu:
        persisted.idempotent
          ? `План аллокации ${persisted.planId} уже существует (идемпотентно).`
          : persisted.mode === 'postgres'
          ? `План аллокации ${persisted.planId} сохранён в PG.`
          : persisted.mode === 'pg_only_blocked'
            ? 'PG-only: план рассчитан, persist заблокирован без PostgreSQL.'
            : `План аллокации ${persisted.planId} сохранён (${persisted.mode}).`,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
