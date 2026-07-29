import { NextResponse } from 'next/server';

import {
  getConfirmedOrderForBuyer,
  getConfirmedOrderForSeller,
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
  context: { readonly params: Promise<{ readonly versionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredReviewPerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const { versionId } = await context.params;
    const repository = await getOrderReviewRepository();
    const version = perspective === 'buyer'
      ? await getConfirmedOrderForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
          versionId,
        })
      : await getConfirmedOrderForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
          versionId,
        });
    return NextResponse.json(version, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return orderReviewApiFailure(error);
  }
}
