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
    const confirmed = perspective === 'seller'
      ? await repository.listConfirmedForSeller(access.organisationId)
      : await repository.listConfirmedForBuyer(access.organisationId);
    return NextResponse.json(confirmed, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return revisedOrderReviewApiFailure(error);
  }
}
