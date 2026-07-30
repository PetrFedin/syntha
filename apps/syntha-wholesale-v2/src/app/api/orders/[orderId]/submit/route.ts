import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  getOrderRepository,
  submitOrderUseCase,
} from '@/modules/orders';
import { getSelectionRepository } from '@/modules/selection';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredPositiveInteger,
} from '@/shared/server/commercial-api';
import { orderApiFailure } from '@/shared/server/order-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly orderId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { orderId } = await context.params;
    const body = await requireJsonObject(request);
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    const result = await submitOrderUseCase({
      repository,
      selectionRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      orderId,
      expectedVersion: requiredPositiveInteger(body.expectedVersion, 'expectedVersion'),
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
