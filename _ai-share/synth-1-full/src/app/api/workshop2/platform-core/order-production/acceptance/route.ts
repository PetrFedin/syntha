import { NextRequest, NextResponse } from 'next/server';

import type { PlatformCoreAcceptanceStatus, PlatformCoreShipmentStatus } from '@/lib/platform-core-order-production-tail';
import {
  ensurePlatformCoreOrderProductionTail,
  platformCoreOrderProductionRuntime,
} from '@/lib/server/platform-core-order-production-runtime';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

const ACCEPTANCE_STATUSES = new Set<Exclude<PlatformCoreAcceptanceStatus, 'pending'>>([
  'accepted',
  'accepted_with_discrepancy',
  'rejected',
]);

const SHIPMENT_STATUSES = new Set<PlatformCoreShipmentStatus>([
  'not_ready',
  'ready_to_dispatch',
  'dispatched',
  'partially_delivered',
  'delivered',
]);

type Body = {
  orderId?: unknown;
  acceptanceStatus?: unknown;
  shipmentStatus?: unknown;
  expectedVersion?: unknown;
  idempotencyKey?: unknown;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readExpectedVersion(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined;
}

/** Records Shop receiving decision through the canonical Order Production runtime. */
export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  if (!auth.actor) {
    return NextResponse.json({ ok: false, messageRu: 'Не удалось определить пользователя.' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const orderId = readString(body.orderId);
  const acceptanceStatus = readString(body.acceptanceStatus) as Exclude<
    PlatformCoreAcceptanceStatus,
    'pending'
  >;
  const shipmentStatusRaw = readString(body.shipmentStatus) as PlatformCoreShipmentStatus;
  const shipmentStatus = SHIPMENT_STATUSES.has(shipmentStatusRaw)
    ? shipmentStatusRaw
    : 'not_ready';
  const idempotencyKey = readString(body.idempotencyKey) || crypto.randomUUID();
  const expectedVersion = readExpectedVersion(body.expectedVersion);

  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }
  if (!ACCEPTANCE_STATUSES.has(acceptanceStatus)) {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное решение по приёмке.' }, { status: 400 });
  }

  try {
    await ensurePlatformCoreOrderProductionTail({ orderId, shipmentStatus });
    const result = await platformCoreOrderProductionRuntime.execute({
      type: 'record_shop_acceptance',
      orderId,
      acceptanceStatus,
      meta: {
        actor: {
          role: 'shop',
          actorId: auth.actor.actorId,
        },
        occurredAt: new Date().toISOString(),
        idempotencyKey,
        expectedVersion,
      },
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось сохранить решение.';
    const status = message.includes('Version conflict') ? 409 : 422;
    return NextResponse.json({ ok: false, messageRu: message }, { status });
  }
}
