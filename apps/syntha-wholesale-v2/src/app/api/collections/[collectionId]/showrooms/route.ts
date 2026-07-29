import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  CollectionNotFound,
  getCollection,
  getCollectionRepository,
} from '@/modules/collections';
import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  CollectionDoesNotAcceptShowrooms,
  ShowroomAlreadyExists,
  ShowroomDomainError,
  createShowroomUseCase,
  getShowroomRepository,
  listCollectionShowrooms,
} from '@/modules/showroom';
import {
  CommercialApiError,
  optionalString,
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
  requiredDate,
  requiredString,
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
  if (error instanceof CollectionNotFound) {
    return NextResponse.json({ error: 'collection_not_found' }, { status: 404 });
  }
  if (error instanceof CollectionDoesNotAcceptShowrooms) {
    return NextResponse.json({ error: 'collection_does_not_accept_showrooms' }, { status: 409 });
  }
  if (
    error instanceof ShowroomAlreadyExists ||
    error instanceof LifecycleIdempotencyConflict ||
    postgresCode(error) === '23505'
  ) {
    return NextResponse.json({ error: 'showroom_conflict' }, { status: 409 });
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
  context: { readonly params: Promise<{ readonly collectionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { collectionId } = await context.params;
    const [collectionRepository, showroomRepository] = await Promise.all([
      getCollectionRepository(),
      getShowroomRepository(),
    ]);
    await getCollection({
      repository: collectionRepository,
      organisationId: access.organisationId,
      id: collectionId,
    });
    const showrooms = await listCollectionShowrooms({
      repository: showroomRepository,
      organisationId: access.organisationId,
      collectionId,
    });
    return NextResponse.json(
      { showrooms },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly collectionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { collectionId } = await context.params;
    const body = await requireJsonObject(request);
    const [collectionRepository, repository] = await Promise.all([
      getCollectionRepository(),
      getShowroomRepository(),
    ]);
    const result = await createShowroomUseCase({
      repository,
      collectionRepository,
      clock,
      ids,
      organisationId: access.organisationId,
      collectionId,
      code: requiredString(body.code, 'code'),
      title: requiredString(body.title, 'title'),
      description: optionalString(body.description, 'description'),
      opensAt: requiredDate(body.opensAt, 'opensAt'),
      closesAt: requiredDate(body.closesAt, 'closesAt'),
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
