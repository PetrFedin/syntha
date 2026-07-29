import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { getCollectionRepository } from '@/modules/collections';
import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  CollectionNotReadyForShowroomPublication,
  ShowroomDomainError,
  ShowroomNotFound,
  ShowroomVersionConflict,
  getShowroomRepository,
  publishShowroomUseCase,
} from '@/modules/showroom';
import {
  CommercialApiError,
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredPositiveInteger,
} from '@/shared/server/commercial-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

function postgresCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const code = (error as { readonly code?: unknown }).code;
  return typeof code === 'string' ? code : null;
}

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
  if (error instanceof CollectionNotReadyForShowroomPublication) {
    return NextResponse.json(
      { error: 'collection_not_ready_for_showroom_publication' },
      { status: 409 },
    );
  }
  if (
    error instanceof ShowroomVersionConflict ||
    error instanceof LifecycleIdempotencyConflict ||
    postgresCode(error) === '23505'
  ) {
    return NextResponse.json({ error: 'showroom_publication_conflict' }, { status: 409 });
  }
  if (error instanceof ShowroomDomainError) {
    return NextResponse.json(
      { error: 'invalid_showroom_publication', message: error.message },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: 'showroom_service_unavailable' }, { status: 503 });
}

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly showroomId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { showroomId } = await context.params;
    const body = await requireJsonObject(request);
    const [repository, collectionRepository] = await Promise.all([
      getShowroomRepository(),
      getCollectionRepository(),
    ]);
    const result = await publishShowroomUseCase({
      repository,
      collectionRepository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: showroomId,
      expectedVersion: requiredPositiveInteger(body.expectedVersion, 'expectedVersion'),
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
    return failure(error);
  }
}
