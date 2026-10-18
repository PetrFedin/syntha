import { NextResponse } from 'next/server';

import {
  getOrderReviewRepository,
  listOrderReviewsForBuyer,
  listOrderReviewsForSeller,
} from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import {
  orderReviewApiFailure,
  requiredReviewPerspective,
} from '@/shared/server/order-review-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredReviewPerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const repository = await getOrderReviewRepository();
    const reviews = perspective === 'buyer'
      ? await listOrderReviewsForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
        })
      : await listOrderReviewsForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
        });
    return NextResponse.json(
      { perspective, reviews },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return orderReviewApiFailure(error);
  }
}
