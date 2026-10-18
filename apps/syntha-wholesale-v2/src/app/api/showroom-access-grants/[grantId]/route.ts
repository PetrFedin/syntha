import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  getSelectionRepository,
  revokeShowroomAccessUseCase,
} from '@/modules/selection';
import {
  requireCommercialApiAccess,
  requireJsonObject,
  requiredPositiveInteger,
  requiredString,
} from '@/shared/server/commercial-api';
import { selectionApiFailure } from '@/shared/server/selection-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

export async function PATCH(
  request: Request,
  context: { readonly params: Promise<{ readonly grantId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const { grantId } = await context.params;
    const body = await requireJsonObject(request);
    const action = requiredString(body.action, 'action');
    if (action !== 'revoke') {
      return NextResponse.json({ error: 'unsupported_access_action' }, { status: 400 });
    }
    const repository = await getSelectionRepository();
    const grant = await revokeShowroomAccessUseCase({
      repository,
      clock,
      ids,
      sellerOrganisationId: access.organisationId,
      grantId,
      expectedVersion: requiredPositiveInteger(body.expectedVersion, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
    });
    return NextResponse.json(grant, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return selectionApiFailure(error);
  }
}
