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
    const revised = perspective === 'buyer'
      ? await repository.listRevisedForBuyer(access.organisationId)
      : await repository.listRevisedForSeller(access.organisationId);
    return NextResponse.json(revised, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return orderAmendmentResponseApiFailure(error);
  }
}
