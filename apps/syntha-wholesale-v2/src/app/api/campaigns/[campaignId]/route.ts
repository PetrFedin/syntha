import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import {
  CampaignDomainError,
  CampaignNotFound,
  CampaignVersionConflict,
  getCampaign,
  getCampaignRepository,
  updateCampaignUseCase,
  type CampaignStatus,
} from '@/modules/campaigns';
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
const statuses = new Set<CampaignStatus>(['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']);

function optionalStatus(value: unknown): CampaignStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !statuses.has(value as CampaignStatus)) {
    throw new CommercialApiError(400, 'invalid_field', 'status is invalid');
  }
  return value as CampaignStatus;
}

function failure(error: unknown): NextResponse {
  if (error instanceof CommercialApiError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (error instanceof CampaignNotFound) {
    return NextResponse.json({ error: 'campaign_not_found' }, { status: 404 });
  }
  if (error instanceof CampaignVersionConflict) {
    return NextResponse.json({ error: 'campaign_version_conflict' }, { status: 409 });
  }
  if (error instanceof CampaignDomainError) {
    return NextResponse.json(
      { error: 'invalid_campaign', message: error.message },
      { status: 400 },
    );
  }
  return NextResponse.json({ error: 'campaign_service_unavailable' }, { status: 503 });
}

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly campaignId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'read');
    const { campaignId } = await context.params;
    const repository = await getCampaignRepository();
    const campaign = await getCampaign({
      repository,
      organisationId: access.organisationId,
      id: campaignId,
    });
    return NextResponse.json(campaign, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(
  request: Request,
  context: { readonly params: Promise<{ readonly campaignId: string }> },
) {
  try {
    const access = await requireCommercialApiAccess(request, 'operate');
    const { campaignId } = await context.params;
    const body = await requireJsonObject(request);
    const repository = await getCampaignRepository();
    const campaign = await updateCampaignUseCase({
      repository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: campaignId,
      expectedVersion: requiredPositiveInteger(body.expectedVersion, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      name: optionalString(body.name, 'name'),
      startsAt: optionalDate(body.startsAt, 'startsAt'),
      endsAt: optionalDate(body.endsAt, 'endsAt'),
      status: optionalStatus(body.status),
    });
    return NextResponse.json(campaign, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return failure(error);
  }
}
