import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  SeasonAlreadyExists,
  SeasonDomainError,
  createSeasonUseCase,
  getSeasonRepository,
  listOrganisationSeasons,
} from '@/modules/seasons';
import {
  CommercialApiError,
  requireCommercialApiAccess,
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
  if (error instanceof SeasonAlreadyExists || postgresCode(error) === '23505') {
    return NextResponse.json({ error: 'season_already_exists' }, { status: 409 });
  }
  if (error instanceof SeasonDomainError) {
    return NextResponse.json(
      { error: 'invalid_season', message: error.message },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: 'season_service_unavailable' }, { status: 503 });
}

export async function GET(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const repository = await getSeasonRepository();
    const seasons = await listOrganisationSeasons(repository, access.organisationId);
    return NextResponse.json(
      { seasons },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const body = await requireJsonObject(request);
    const repository = await getSeasonRepository();
    const season = await createSeasonUseCase(repository, clock, ids, {
      organisationId: access.organisationId,
      code: requiredString(body.code, 'code'),
      name: requiredString(body.name, 'name'),
      startsAt: requiredDate(body.startsAt, 'startsAt'),
      endsAt: requiredDate(body.endsAt, 'endsAt'),
      actorCredentialId: access.actorCredentialId,
    });
    return NextResponse.json(season, {
      status: 201,
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
