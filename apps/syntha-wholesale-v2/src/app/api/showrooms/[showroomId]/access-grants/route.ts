import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { organisationId } from '@/modules/organisations';
import {
  getSelectionRepository,
  grantShowroomAccessUseCase,
} from '@/modules/selection';
import { getShowroomRepository } from '@/modules/showroom';
import {
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredString,
} from '@/shared/server/commercial-api';
import { selectionApiFailure } from '@/shared/server/selection-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly showroomId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { showroomId } = await context.params;
    const body = await requireJsonObject(request);
    const [repository, showroomRepository] = await Promise.all([
      getSelectionRepository(),
      getShowroomRepository(),
    ]);
    const result = await grantShowroomAccessUseCase({
      repository,
      showroomRepository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      buyerOrganisationId: organisationId(
        requiredString(body.buyerOrganisationId, 'buyerOrganisationId'),
      ),
      showroomId,
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
