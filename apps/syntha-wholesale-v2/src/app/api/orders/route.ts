import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  createOrderDraftUseCase,
  getOrderRepository,
  listBuyerOrders,
} from '@/modules/orders';
import { getSelectionRepository } from '@/modules/selection';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredString,
} from '@/shared/server/commercial-api';
import { orderApiFailure } from '@/shared/server/order-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const repository = await getOrderRepository();
    const orders = await listBuyerOrders({
      repository,
      buyerOrganisationId: access.organisationId,
    });
    return NextResponse.json({ orders }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return orderApiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const body = await requireJsonObject(request);
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    const result = await createOrderDraftUseCase({
      repository,
      selectionRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      selectionId: requiredString(body.selectionId, 'selectionId'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey,
    });
    return NextResponse.json(result.entity, {
      status: result.replayed ? 200 : 201,
      headers: {
        'cache-control': 'no-store',
        'idempotency-replayed': String(result.replayed),
      },
    });
  } catch (error) {
    return orderApiFailure(error);
  }
}
