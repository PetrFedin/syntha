import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  acceptOrderAmendmentUseCase,
  counterOrderAmendmentUseCase,
  getOrderAmendmentResponseRepository,
  getOrderRepository,
  getOrderReviewRepository,
  rejectOrderAmendmentUseCase,
} from '@/modules/orders';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredPositiveInteger,
  requiredString,
} from '@/shared/server/commercial-api';
import {
  orderAmendmentResponseApiFailure,
  requiredAmendmentResponseAction,
} from '@/shared/server/order-amendment-response-api';
import { requiredProposedOrderLineChanges } from '@/shared/server/order-review-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly reviewId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { reviewId } = await context.params;
    const body = await requireJsonObject(request);
    const action = requiredAmendmentResponseAction(body.action);
    const expectedReviewVersion = requiredPositiveInteger(
      body.expectedReviewVersion,
      'expectedReviewVersion',
    );
    const [orderRepository, reviewRepository, responseRepository] = await Promise.all([
      getOrderRepository(),
      getOrderReviewRepository(),
      getOrderAmendmentResponseRepository(),
    ]);
    const common = {
      orderRepository,
      reviewRepository,
      responseRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      reviewId,
      expectedReviewVersion,
      actorCredentialId: access.actorCredentialId,
      idempotencyKey,
    } as const;
    const result = action === 'accept'
      ? await acceptOrderAmendmentUseCase(common)
      : action === 'counter'
        ? await counterOrderAmendmentUseCase({
            ...common,
            reason: requiredString(body.reason, 'reason'),
            lineChanges: requiredProposedOrderLineChanges(body.lineChanges),
          })
        : await rejectOrderAmendmentUseCase({
            ...common,
            reason: requiredString(body.reason, 'reason'),
          });
    return NextResponse.json(result.entity, {
      status: result.replayed ? 200 : 201,
      headers: {
        'cache-control': 'no-store',
        'idempotency-replayed': String(result.replayed),
      },
    });
  } catch (error) {
    return orderAmendmentResponseApiFailure(error);
  }
}
