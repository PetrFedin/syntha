import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  approveSubmittedOrderUseCase,
  getOrderRepository,
  getOrderReviewRepository,
  requestOrderAmendmentUseCase,
} from '@/modules/orders';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredString,
} from '@/shared/server/commercial-api';
import { requiredNonNegativeSafeInteger } from '@/shared/server/order-api';
import {
  orderReviewApiFailure,
  requiredProposedOrderLineChanges,
} from '@/shared/server/order-review-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly snapshotId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { snapshotId } = await context.params;
    const body = await requireJsonObject(request);
    const action = requiredString(body.action, 'action');
    const expectedVersion = requiredNonNegativeSafeInteger(
      body.expectedVersion,
      'expectedVersion',
    );
    const [orderRepository, reviewRepository] = await Promise.all([
      getOrderRepository(),
      getOrderReviewRepository(),
    ]);
    const common = {
      orderRepository,
      reviewRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      snapshotId,
      expectedVersion,
      actorCredentialId: access.actorCredentialId,
      idempotencyKey,
    } as const;
    const result = action === 'approve'
      ? await approveSubmittedOrderUseCase(common)
      : action === 'request_amendment'
        ? await requestOrderAmendmentUseCase({
            ...common,
            reason: requiredString(body.reason, 'reason'),
            lineChanges: requiredProposedOrderLineChanges(body.lineChanges),
          })
        : null;
    if (!result) {
      return NextResponse.json({ error: 'unsupported_order_review_action' }, { status: 400 });
    }
    return NextResponse.json(result.entity, {
      status: result.replayed ? 200 : 201,
      headers: {
        'cache-control': 'no-store',
        'idempotency-replayed': String(result.replayed),
      },
    });
  } catch (error) {
    return orderReviewApiFailure(error);
  }
}
