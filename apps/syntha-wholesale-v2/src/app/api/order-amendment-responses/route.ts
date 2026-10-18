import { NextResponse } from 'next/server';

import { getOrderAmendmentResponseRepository } from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import {
  orderAmendmentResponseApiFailure,
  requiredAmendmentResponsePerspective,
} from '@/shared/server/order-amendment-response-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredAmendmentResponsePerspective(
      new URL(request.url).searchParams.get('perspective'),
    );
    const repository = await getOrderAmendmentResponseRepository();
    const responses = perspective === 'buyer'
      ? await repository.listResponsesForBuyer(access.organisationId)
      : await repository.listResponsesForSeller(access.organisationId);
    return NextResponse.json(responses, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return orderAmendmentResponseApiFailure(error);
  }
}
