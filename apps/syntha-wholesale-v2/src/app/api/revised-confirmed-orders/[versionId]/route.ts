import { NextResponse } from 'next/server';

import {
  getRevisedConfirmedOrderForBuyer,
  getRevisedConfirmedOrderForSeller,
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
  context: { readonly params: Promise<{ readonly versionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredRevisedOrderReviewPerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const { versionId } = await context.params;
    const repository = await getRevisedOrderReviewRepository();
    const confirmed = perspective === 'seller'
      ? await getRevisedConfirmedOrderForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
          versionId,
        })
      : await getRevisedConfirmedOrderForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
          versionId,
        });
    return NextResponse.json(confirmed, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return revisedOrderReviewApiFailure(error);
  }
}
