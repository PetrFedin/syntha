import { NextResponse } from 'next/server';

import {
  getOrderAmendmentResponseRepository,
  getRevisedOrderForBuyer,
  getRevisedOrderForSeller,
} from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import {
  orderAmendmentResponseApiFailure,
  requiredAmendmentResponsePerspective,
} from '@/shared/server/order-amendment-response-api';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly versionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredAmendmentResponsePerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const { versionId } = await context.params;
    const repository = await getOrderAmendmentResponseRepository();
    const revised = perspective === 'buyer'
      ? await getRevisedOrderForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
          versionId,
        })
      : await getRevisedOrderForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
          versionId,
        });
    return NextResponse.json(revised, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return orderAmendmentResponseApiFailure(error);
  }
}
