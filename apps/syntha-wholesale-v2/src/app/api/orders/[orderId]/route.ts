import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  getBuyerOrder,
  getOrderRepository,
  setOrderLineCommercialTermsUseCase,
  setOrderLineQuantityUseCase,
} from '@/modules/orders';
import { getSelectionRepository } from '@/modules/selection';
import {
  requireCommercialApiAccess,
  requireJsonObject,
  requiredPositiveInteger,
  requiredString,
} from '@/shared/server/commercial-api';
import {
  orderApiFailure,
  requiredBasisPoints,
  requiredNonNegativeSafeInteger,
} from '@/shared/server/order-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly orderId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { orderId } = await context.params;
    const repository = await getOrderRepository();
    const order = await getBuyerOrder({
      repository,
      buyerOrganisationId: access.organisationId,
      orderId,
    });
    return NextResponse.json(order, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return orderApiFailure(error);
  }
}

export async function PATCH(
  request: Request,
  context: { readonly params: Promise<{ readonly orderId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const { orderId } = await context.params;
    const body = await requireJsonObject(request);
    const action = requiredString(body.action, 'action');
    const expectedVersion = requiredPositiveInteger(body.expectedVersion, 'expectedVersion');
    const [repository, selectionRepository] = await Promise.all([
      getOrderRepository(),
      getSelectionRepository(),
    ]);
    const common = {
      repository,
      selectionRepository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      orderId,
      expectedVersion,
      actorCredentialId: access.actorCredentialId,
    } as const;

    const order = action === 'set_quantity'
      ? await setOrderLineQuantityUseCase({
          ...common,
          lineId: requiredString(body.lineId, 'lineId'),
          size: requiredString(body.size, 'size'),
          quantity: requiredNonNegativeSafeInteger(body.quantity, 'quantity'),
        })
      : action === 'set_terms'
        ? await setOrderLineCommercialTermsUseCase({
            ...common,
            lineId: requiredString(body.lineId, 'lineId'),
            unitPriceMinor: requiredNonNegativeSafeInteger(
              body.unitPriceMinor,
              'unitPriceMinor',
            ),
            discountBasisPoints: requiredBasisPoints(
              body.discountBasisPoints,
              'discountBasisPoints',
            ),
            taxBasisPoints: requiredBasisPoints(body.taxBasisPoints, 'taxBasisPoints'),
          })
        : null;

    if (!order) {
      return NextResponse.json({ error: 'unsupported_order_action' }, { status: 400 });
    }
    return NextResponse.json(order, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return orderApiFailure(error);
  }
}
