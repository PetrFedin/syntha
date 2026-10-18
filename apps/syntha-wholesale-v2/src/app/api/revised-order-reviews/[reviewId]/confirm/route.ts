import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  confirmApprovedRevisedOrderUseCase,
  getOrderAmendmentResponseRepository,
  getRevisedOrderReviewRepository,
} from '@/modules/orders';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredPositiveInteger,
} from '@/shared/server/commercial-api';
import { revisedOrderReviewApiFailure } from '@/shared/server/revised-order-review-api';

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
    const [responseRepository, reviewRepository] = await Promise.all([
      getOrderAmendmentResponseRepository(),
      getRevisedOrderReviewRepository(),
    ]);
    const result = await confirmApprovedRevisedOrderUseCase({
      responseRepository,
      reviewRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      reviewId,
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
    return revisedOrderReviewApiFailure(error);
  }
}
