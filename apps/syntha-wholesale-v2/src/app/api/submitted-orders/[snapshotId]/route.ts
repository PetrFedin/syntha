import { NextResponse } from 'next/server';

import {
  getOrderRepository,
  getSubmittedOrderForBuyer,
  getSubmittedOrderForSeller,
} from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import { orderApiFailure, requiredPerspective } from '@/shared/server/order-api';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly snapshotId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredPerspective(new URL(request.url).searchParams.get('perspective'));
    const { snapshotId } = await context.params;
    const repository = await getOrderRepository();
    const snapshot = perspective === 'buyer'
      ? await getSubmittedOrderForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
          snapshotId,
        })
      : await getSubmittedOrderForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
          snapshotId,
        });
    return NextResponse.json(snapshot, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return orderApiFailure(error);
  }
}
