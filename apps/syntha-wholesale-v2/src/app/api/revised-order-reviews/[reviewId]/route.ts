import { NextResponse } from 'next/server';

import {
  getRevisedOrderReviewForBuyer,
  getRevisedOrderReviewForSeller,
  getRevisedOrderReviewRepository,
} from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import {
  requiredRevisedOrderReviewPerspective,
  revisedOrderReviewApiFailure,
} from '@/shared/server/revised-order-review-api';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly reviewId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredRevisedOrderReviewPerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const { reviewId } = await context.params;
    const repository = await getRevisedOrderReviewRepository();
    const review = perspective === 'seller'
      ? await getRevisedOrderReviewForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
          reviewId,
        })
      : await getRevisedOrderReviewForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
          reviewId,
        });
    return NextResponse.json(review, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return revisedOrderReviewApiFailure(error);
  }
}
