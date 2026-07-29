import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  ShowroomDomainError,
  ShowroomNotFound,
  ShowroomVersionConflict,
  archiveShowroomUseCase,
  getShowroom,
  getShowroomRepository,
  updateShowroomUseCase,
} from '@/modules/showroom';
import {
  CommercialApiError,
  optionalDate,
  optionalString,
  requireCommercialApiAccess,
  requireJsonObject,
  requiredPositiveInteger,
} from '@/shared/server/commercial-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

function failure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (error instanceof ShowroomNotFound) {
    return NextResponse.json({ error: 'showroom_not_found' }, { status: 404 });
  }
  if (error instanceof ShowroomVersionConflict) {
    return NextResponse.json({ error: 'showroom_version_conflict' }, { status: 409 });
  }
  if (error instanceof ShowroomDomainError) {
    return NextResponse.json(
      { error: 'invalid_showroom', message: error.message },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: 'showroom_service_unavailable' }, { status: 503 });
}

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly showroomId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { showroomId } = await context.params;
    const repository = await getShowroomRepository();
    const showroom = await getShowroom({
      repository,
      organisationId: access.organisationId,
      id: showroomId,
    });
    const snapshot = await repository.findPublicationSnapshot(
      access.organisationId,
      showroom.id,
    );
    return NextResponse.json(
      { showroom, snapshot },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(
  request: Request,
  context: { readonly params: Promise<{ readonly showroomId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const { showroomId } = await context.params;
    const body = await requireJsonObject(request);
    const repository = await getShowroomRepository();
    const expectedVersion = requiredPositiveInteger(body.expectedVersion, 'expectedVersion');
    const showroom = body.status === 'ARCHIVED'
      ? await archiveShowroomUseCase({
          repository,
          clock,
          ids,
          organisationId: access.organisationId,
          id: showroomId,
          expectedVersion,
          actorCredentialId: access.actorCredentialId,
        })
      : await updateShowroomUseCase({
          repository,
          clock,
          ids,
          organisationId: access.organisationId,
          id: showroomId,
          expectedVersion,
          actorCredentialId: access.actorCredentialId,
          title: optionalString(body.title, 'title'),
          description: optionalString(body.description, 'description'),
          opensAt: optionalDate(body.opensAt, 'opensAt'),
          closesAt: optionalDate(body.closesAt, 'closesAt'),
        });
    return NextResponse.json(showroom, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
