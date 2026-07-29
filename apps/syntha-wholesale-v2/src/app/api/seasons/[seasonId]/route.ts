import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  SeasonDomainError,
  SeasonNotFound,
  SeasonVersionConflict,
  changeSeasonStatusUseCase,
  getSeason,
  getSeasonRepository,
  type SeasonStatus,
} from '@/modules/seasons';
import {
  CommercialApiError,
  requireCommercialApiAccess,
  requireJsonObject,
  requiredPositiveInteger,
} from '@/shared/server/commercial-api';

export const runtime = 'nodejs';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });
const statuses = new Set<SeasonStatus>(['PLANNING', 'ACTIVE', 'CLOSED', 'ARCHIVED']);

function requiredStatus(value: unknown): SeasonStatus {
  if (typeof value !== 'string' || !statuses.has(value as SeasonStatus)) {
    throw new CommercialApiError(400, 'invalid_field', 'status is invalid');
  }
  return value as SeasonStatus;
}

function failure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (error instanceof SeasonNotFound) {
    return NextResponse.json({ error: 'season_not_found' }, { status: 404 });
  }
  if (error instanceof SeasonVersionConflict) {
    return NextResponse.json({ error: 'season_version_conflict' }, { status: 409 });
  }
  if (error instanceof SeasonDomainError) {
    return NextResponse.json(
      { error: 'invalid_season', message: error.message },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: 'season_service_unavailable' }, { status: 503 });
}

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly seasonId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { seasonId } = await context.params;
    const repository = await getSeasonRepository();
    const season = await getSeason(repository, access.organisationId, seasonId);
    return NextResponse.json(season, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(
  request: Request,
  context: { readonly params: Promise<{ readonly seasonId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const { seasonId } = await context.params;
    const body = await requireJsonObject(request);
    const repository = await getSeasonRepository();
    const season = await changeSeasonStatusUseCase(repository, clock, ids, {
      organisationId: access.organisationId,
      id: seasonId,
      status: requiredStatus(body.status),
      expectedVersion: requiredPositiveInteger(body.expectedVersion, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
    });
    return NextResponse.json(season, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
