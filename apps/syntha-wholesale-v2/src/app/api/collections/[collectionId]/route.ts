import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  CollectionDomainError,
  CollectionNotFound,
  CollectionVersionConflict,
  getCollection,
  getCollectionRepository,
  updateCollectionUseCase,
  type CollectionStatus,
} from '@/modules/collections';
import {
  CommercialApiError,
  optionalString,
  requireCommercialApiAccess,
  requireJsonObject,
  requiredPositiveInteger,
} from '@/shared/server/commercial-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });
const statuses = new Set<CollectionStatus>(['DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED']);

function optionalStatus(value: unknown): CollectionStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !statuses.has(value as CollectionStatus)) {
    throw new CommercialApiError(400, 'invalid_field', 'status is invalid');
  }
  return value as CollectionStatus;
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
  if (error instanceof CollectionVersionConflict) {
    return NextResponse.json({ error: 'collection_version_conflict' }, { status: 409 });
  }
  if (error instanceof CollectionDomainError) {
    return NextResponse.json(
      { error: 'invalid_collection', message: error.message },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: 'collection_service_unavailable' }, { status: 503 });
}

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly collectionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { collectionId } = await context.params;
    const repository = await getCollectionRepository();
    const collection = await getCollection({
      repository,
      organisationId: access.organisationId,
      id: collectionId,
    });
    return NextResponse.json(collection, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(
  request: Request,
  context: { readonly params: Promise<{ readonly collectionId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const { collectionId } = await context.params;
    const body = await requireJsonObject(request);
    const repository = await getCollectionRepository();
    const collection = await updateCollectionUseCase({
      repository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: collectionId,
      expectedVersion: requiredPositiveInteger(body.expectedVersion, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      name: optionalString(body.name, 'name'),
      currency: optionalString(body.currency, 'currency'),
      status: optionalStatus(body.status),
    });
    return NextResponse.json(collection, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
