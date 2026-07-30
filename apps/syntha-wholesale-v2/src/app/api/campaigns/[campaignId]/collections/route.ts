import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  CampaignNotFound,
  getCampaign,
  getCampaignRepository,
} from '@/modules/campaigns';
import {
  CampaignDoesNotAcceptCollections,
  CollectionAlreadyExists,
  CollectionDomainError,
  createCollectionUseCase,
  getCollectionRepository,
  listCampaignCollections,
} from '@/modules/collections';
import {
  LifecycleIdempotencyConflict,
  LifecycleIdempotencyInProgress,
  LifecycleIdempotencyResultMissing,
} from '@/modules/lifecycle-idempotency';
import {
  CommercialApiError,
  requireCommercialApiAccess,
  requireIdempotencyKey,
  requireJsonObject,
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
  if (error instanceof LifecycleIdempotencyConflict) {
    return NextResponse.json(
      { error: 'idempotency_conflict', message: error.message },
      { status: 409 },
    );
  }
  if (error instanceof LifecycleIdempotencyInProgress) {
    return NextResponse.json({ error: 'idempotency_in_progress' }, { status: 409 });
  }
  if (error instanceof LifecycleIdempotencyResultMissing) {
    return NextResponse.json({ error: 'idempotency_result_missing' }, { status: 503 });
  }
  if (error instanceof CampaignNotFound) {
    return NextResponse.json({ error: 'campaign_not_found' }, { status: 404 });
  }
  if (error instanceof CampaignDoesNotAcceptCollections) {
    return NextResponse.json(
      { error: 'campaign_does_not_accept_collections' },
      { status: 409 },
    );
  }
  if (error instanceof CollectionAlreadyExists || postgresCode(error) === '23505') {
    return NextResponse.json({ error: 'collection_already_exists' }, { status: 409 });
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
  context: { readonly params: Promise<{ readonly campaignId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { campaignId } = await context.params;
    const [campaignRepository, collectionRepository] = await Promise.all([
      getCampaignRepository(),
      getCollectionRepository(),
    ]);
    await getCampaign({
      repository: campaignRepository,
      organisationId: access.organisationId,
      id: campaignId,
    });
    const collections = await listCampaignCollections({
      repository: collectionRepository,
      organisationId: access.organisationId,
      campaignId,
    });
    return NextResponse.json(
      { collections },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}

export async function POST(
  request: Request,
  context: { readonly params: Promise<{ readonly campaignId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const idempotencyKey = requireIdempotencyKey(request);
    const { campaignId } = await context.params;
    const body = await requireJsonObject(request);
    const [campaignRepository, collectionRepository] = await Promise.all([
      getCampaignRepository(),
      getCollectionRepository(),
    ]);
    const result = await createCollectionUseCase({
      campaignRepository,
      collectionRepository,
      clock,
      ids,
      organisationId: access.organisationId,
      campaignId,
      code: requiredString(body.code, 'code'),
      name: requiredString(body.name, 'name'),
      currency: requiredString(body.currency, 'currency'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey,
    });
    return NextResponse.json(result.entity, {
      status: result.replayed ? 200 : 201,
      headers: {
        'cache-control': 'no-store',
        'idempotency-replayed': result.replayed ? 'true' : 'false',
      },
    });
  } catch (error) {
    return failure(error);
  }
}
