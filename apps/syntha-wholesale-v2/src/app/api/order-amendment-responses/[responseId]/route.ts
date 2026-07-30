import { NextResponse } from 'next/server';

import {
  getOrderAmendmentResponseForBuyer,
  getOrderAmendmentResponseForSeller,
  getOrderAmendmentResponseRepository,
} from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import {
  orderAmendmentResponseApiFailure,
  requiredAmendmentResponsePerspective,
} from '@/shared/server/order-amendment-response-api';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly responseId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredAmendmentResponsePerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const { responseId } = await context.params;
    const repository = await getOrderAmendmentResponseRepository();
    const response = perspective === 'buyer'
      ? await getOrderAmendmentResponseForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
          responseId,
        })
      : await getOrderAmendmentResponseForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
          responseId,
        });
    return NextResponse.json(response, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return orderAmendmentResponseApiFailure(error);
  }
}
