import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  approveRevisedOrderUseCase,
  getOrderAmendmentResponseRepository,
  getRevisedOrderReviewRepository,
  requestRevisedOrderAmendmentUseCase,
} from '@/modules/orders';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredPositiveInteger,
  requiredString,
} from '@/shared/server/commercial-api';
import { requiredProposedOrderLineChanges } from '@/shared/server/order-review-api';
import {
  requiredRevisedOrderReviewAction,
  revisedOrderReviewApiFailure,
} from '@/shared/server/revised-order-review-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly versionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { versionId } = await context.params;
    const body = await requireJsonObject(request);
    const action = requiredRevisedOrderReviewAction(body.action);
    const expectedVersion = body.expectedVersion === 0
      ? 0
      : requiredPositiveInteger(body.expectedVersion, 'expectedVersion');
    const [responseRepository, reviewRepository] = await Promise.all([
      getOrderAmendmentResponseRepository(),
      getRevisedOrderReviewRepository(),
    ]);
    const common = {
      responseRepository,
      reviewRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      versionId,
      expectedVersion,
      actorCredentialId: access.actorCredentialId,
      idempotencyKey,
    } as const;
    const result = action === 'approve'
      ? await approveRevisedOrderUseCase(common)
      : await requestRevisedOrderAmendmentUseCase({
          ...common,
          reason: requiredString(body.reason, 'reason'),
          lineChanges: requiredProposedOrderLineChanges(body.lineChanges),
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
