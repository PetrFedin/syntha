import { NextResponse } from 'next/server';

import { getRevisedOrderReviewRepository } from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import {
  requiredRevisedOrderReviewPerspective,
  revisedOrderReviewApiFailure,
} from '@/shared/server/revised-order-review-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredRevisedOrderReviewPerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const repository = await getRevisedOrderReviewRepository();
    const reviews = perspective === 'seller'
      ? await repository.listReviewsForSeller(access.organisationId)
      : await repository.listReviewsForBuyer(access.organisationId);
    return NextResponse.json(reviews, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return revisedOrderReviewApiFailure(error);
  }
}
