import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  createSelectionUseCase,
  getSelectionRepository,
  listBuyerSelections,
} from '@/modules/selection';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredString,
} from '@/shared/server/commercial-api';
import {
  optionalNonNegativeInteger,
  selectionApiFailure,
} from '@/shared/server/selection-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const repository = await getSelectionRepository();
    const selections = await listBuyerSelections({
      repository,
      buyerOrganisationId: access.organisationId,
    });
    return NextResponse.json(
      { selections },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return selectionApiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const body = await requireJsonObject(request);
    const repository = await getSelectionRepository();
    const result = await createSelectionUseCase({
      repository,
      clock,
      ids,
      buyerOrganisationId: access.organisationId,
      grantId: requiredString(body.grantId, 'grantId'),
      title: requiredString(body.title, 'title'),
      currency: requiredString(body.currency, 'currency'),
      budgetMinor: optionalNonNegativeInteger(body.budgetMinor, 'budgetMinor'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey,
    });
    return NextResponse.json(result.entity, {
      status: result.replayed ? 200 : 201,
      headers: {
        'cache-control': 'no-store',
        'idempotency-replayed': String(result.replayed),
      },
    });
  } catch (error) {
    return selectionApiFailure(error);
  }
}
