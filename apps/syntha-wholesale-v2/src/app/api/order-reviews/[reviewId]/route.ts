import { NextResponse } from 'next/server';

import {
  getOrderReviewForBuyer,
  getOrderReviewForSeller,
  getOrderReviewRepository,
} from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import {
  orderReviewApiFailure,
  requiredReviewPerspective,
} from '@/shared/server/order-review-api';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly reviewId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredReviewPerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const { reviewId } = await context.params;
    const repository = await getOrderReviewRepository();
    const review = perspective === 'buyer'
      ? await getOrderReviewForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
          reviewId,
        })
      : await getOrderReviewForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
          reviewId,
        });
    return NextResponse.json(review, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return orderReviewApiFailure(error);
  }
}
