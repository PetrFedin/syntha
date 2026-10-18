'use server';

import { randomUUID } from 'node:crypto';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import {
  CampaignAlreadyExists,
  CampaignDomainError,
  CampaignNotFound,
  CampaignVersionConflict,
  SeasonDoesNotAcceptCampaigns,
  createCampaignUseCase,
  getCampaignRepository,
  updateCampaignUseCase,
  type CampaignStatus,
} from '@/modules/campaigns';
import {
  CampaignDoesNotAcceptCollections,
  CollectionAlreadyExists,
  CollectionDomainError,
  CollectionNotFound,
  CollectionVersionConflict,
  createCollectionUseCase,
  getCollectionRepository,
  updateCollectionUseCase,
  type CollectionStatus,
} from '@/modules/collections';
import { LifecycleIdempotencyConflict } from '@/modules/lifecycle-idempotency';
import {
  SeasonAlreadyExists,
  SeasonDomainError,
  SeasonNotFound,
  SeasonVersionConflict,
  changeSeasonStatusUseCase,
  createSeasonUseCase,
  getSeasonRepository,
  type SeasonStatus,
} from '@/modules/seasons';
import { CommercialApiError } from '@/shared/server/commercial-api';
import { requireWorkspaceAccess } from '@/shared/server/workspace-access';

const clock = Object.freeze({ now: () => new Date() });
const ids = Object.freeze({ next: (prefix: string) => `${prefix}_${randomUUID()}` });

function required(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) {
    throw new CommercialApiError(400, 'invalid_field', `${field} is required`);
  }
  return value.trim();
}

function date(formData: FormData, field: string): Date {
  const value = new Date(required(formData, field));
  if (Number.isNaN(value.getTime())) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be an ISO date`);
  }
  return value;
}

function positiveInteger(formData: FormData, field: string): number {
  const value = Number(required(formData, field));
  if (!Number.isInteger(value) || value < 1) {
    throw new CommercialApiError(400, 'invalid_field', `${field} must be a positive integer`);
  }
  return value;
}

function oneOf<T extends string>(
  formData: FormData,
  field: string,
  values: readonly T[],
): T {
  const value = required(formData, field);
  if (!values.includes(value as T)) {
    throw new CommercialApiError(400, 'invalid_field', `${field} is invalid`);
  }
  return value as T;
}

function messageFor(error: unknown): string {
  if (error instanceof LifecycleIdempotencyConflict) return 'idempotency_conflict';
  if (error instanceof SeasonAlreadyExists) return 'season_already_exists';
  if (error instanceof CampaignAlreadyExists) return 'campaign_already_exists';
  if (error instanceof CollectionAlreadyExists) return 'collection_already_exists';
  if (error instanceof SeasonNotFound) return 'season_not_found';
  if (error instanceof CampaignNotFound) return 'campaign_not_found';
  if (error instanceof CollectionNotFound) return 'collection_not_found';
  if (error instanceof SeasonDoesNotAcceptCampaigns) return 'season_closed';
  if (error instanceof CampaignDoesNotAcceptCollections) return 'campaign_closed';
  if (
    error instanceof SeasonVersionConflict ||
    error instanceof CampaignVersionConflict ||
    error instanceof CollectionVersionConflict
  ) {
    return 'version_conflict';
  }
  if (
    error instanceof SeasonDomainError ||
    error instanceof CampaignDomainError ||
    error instanceof CollectionDomainError ||
    error instanceof CommercialApiError
  ) {
    return 'invalid_input';
  }
  return 'service_unavailable';
}

function target(path: '/campaigns' | '/collections', input: {
  readonly notice: string;
  readonly seasonId?: string;
  readonly campaignId?: string;
  readonly collectionId?: string;
}): Route {
  const query = new URLSearchParams({ notice: input.notice });
  if (input.seasonId) query.set('seasonId', input.seasonId);
  if (input.campaignId) query.set('campaignId', input.campaignId);
  if (input.collectionId) query.set('collectionId', input.collectionId);
  return `${path}?${query.toString()}` as Route;
}

export async function createSeasonAction(formData: FormData): Promise<never> {
  let notice = 'season_created';
  let seasonId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSeasonRepository();
    const result = await createSeasonUseCase(repository, clock, ids, {
      organisationId: access.organisationId,
      code: required(formData, 'code'),
      name: required(formData, 'name'),
      startsAt: date(formData, 'startsAt'),
      endsAt: date(formData, 'endsAt'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    seasonId = result.entity.id;
    notice = result.replayed ? 'season_replayed' : 'season_created';
    revalidatePath('/campaigns');
  } catch (error) {
    notice = messageFor(error);
  }
  redirect(target('/campaigns', { notice, seasonId }));
}

export async function changeSeasonStatusAction(formData: FormData): Promise<never> {
  const seasonId = required(formData, 'seasonId');
  let notice = 'season_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getSeasonRepository();
    await changeSeasonStatusUseCase(repository, clock, ids, {
      organisationId: access.organisationId,
      id: seasonId,
      status: oneOf<SeasonStatus>(formData, 'status', ['PLANNING', 'ACTIVE', 'CLOSED', 'ARCHIVED']),
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
    });
    revalidatePath('/campaigns');
  } catch (error) {
    notice = messageFor(error);
  }
  redirect(target('/campaigns', { notice, seasonId }));
}

export async function createCampaignAction(formData: FormData): Promise<never> {
  const seasonId = required(formData, 'seasonId');
  let notice = 'campaign_created';
  let campaignId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
    const [repository, seasonRepository] = await Promise.all([
      getCampaignRepository(),
      getSeasonRepository(),
    ]);
    const result = await createCampaignUseCase({
      repository,
      seasonRepository,
      clock,
      ids,
      organisationId: access.organisationId,
      seasonId,
      code: required(formData, 'code'),
      name: required(formData, 'name'),
      startsAt: date(formData, 'startsAt'),
      endsAt: date(formData, 'endsAt'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    campaignId = result.entity.id;
    notice = result.replayed ? 'campaign_replayed' : 'campaign_created';
    revalidatePath('/campaigns');
    revalidatePath('/collections');
  } catch (error) {
    notice = messageFor(error);
  }
  redirect(target('/campaigns', { notice, seasonId, campaignId }));
}

export async function updateCampaignStatusAction(formData: FormData): Promise<never> {
  const campaignId = required(formData, 'campaignId');
  const seasonId = required(formData, 'seasonId');
  let notice = 'campaign_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getCampaignRepository();
    await updateCampaignUseCase({
      repository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: campaignId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      status: oneOf<CampaignStatus>(formData, 'status', ['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED']),
    });
    revalidatePath('/campaigns');
    revalidatePath('/collections');
  } catch (error) {
    notice = messageFor(error);
  }
  redirect(target('/campaigns', { notice, seasonId, campaignId }));
}

export async function createCollectionAction(formData: FormData): Promise<never> {
  const campaignId = required(formData, 'campaignId');
  let notice = 'collection_created';
  let collectionId: string | undefined;
  try {
    const access = await requireWorkspaceAccess('operate');
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
      code: required(formData, 'code'),
      name: required(formData, 'name'),
      currency: required(formData, 'currency'),
      actorCredentialId: access.actorCredentialId,
      idempotencyKey: required(formData, 'idempotencyKey'),
    });
    collectionId = result.entity.id;
    notice = result.replayed ? 'collection_replayed' : 'collection_created';
    revalidatePath('/collections');
  } catch (error) {
    notice = messageFor(error);
  }
  redirect(target('/collections', { notice, campaignId, collectionId }));
}

export async function updateCollectionStatusAction(formData: FormData): Promise<never> {
  const collectionId = required(formData, 'collectionId');
  const campaignId = required(formData, 'campaignId');
  let notice = 'collection_updated';
  try {
    const access = await requireWorkspaceAccess('operate');
    const repository = await getCollectionRepository();
    await updateCollectionUseCase({
      repository,
      clock,
      ids,
      organisationId: access.organisationId,
      id: collectionId,
      expectedVersion: positiveInteger(formData, 'expectedVersion'),
      actorCredentialId: access.actorCredentialId,
      status: oneOf<CollectionStatus>(formData, 'status', ['DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED']),
    });
    revalidatePath('/collections');
  } catch (error) {
    notice = messageFor(error);
  }
  redirect(target('/collections', { notice, campaignId, collectionId }));
}
