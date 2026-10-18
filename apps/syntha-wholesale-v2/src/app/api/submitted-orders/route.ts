import { NextResponse } from 'next/server';

import {
  getOrderRepository,
  listSubmittedOrdersForBuyer,
  listSubmittedOrdersForSeller,
} from '@/modules/orders';
import { requireCommercialApiAccess } from '@/shared/server/commercial-api';
import { orderApiFailure, requiredPerspective } from '@/shared/server/order-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const perspective = requiredPerspective(new URL(request.url).searchParams.get('perspective'));
    const repository = await getOrderRepository();
    const snapshots = perspective === 'buyer'
      ? await listSubmittedOrdersForBuyer({
          repository,
          buyerOrganisationId: access.organisationId,
        })
      : await listSubmittedOrdersForSeller({
          repository,
          sellerOrganisationId: access.organisationId,
        });
    return NextResponse.json(
      { perspective, snapshots },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return orderApiFailure(error);
  }
}
