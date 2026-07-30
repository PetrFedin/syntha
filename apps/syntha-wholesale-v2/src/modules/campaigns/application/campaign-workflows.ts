import {
  lifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';
import {
  getSeason,
  type SeasonRepository,
} from '@/modules/seasons';

import {
  createCampaign,
  reviseCampaign,
  type Campaign,
  type CampaignStatus,
} from '../domain/campaign';
import type {
  CampaignRepository,
  LifecycleAuditAction,
  LifecycleAuditRecord,
} from './campaign-repository';

export interface CampaignClock {
  now(): Date;
}

export interface CampaignIdGenerator {
  next(prefix: string): string;
}

export class CampaignAlreadyExists extends Error {
  constructor(code: string) {
    super(`Campaign with code ${code} already exists`);
    this.name = 'CampaignAlreadyExists';
  }
}

export class CampaignNotFound extends Error {
  constructor(id: string) {
    super(`Campaign ${id} was not found`);
    this.name = 'CampaignNotFound';
  }
}

export class CampaignVersionConflict extends Error {
  constructor(id: string) {
    super(`Campaign ${id} was modified by another operation`);
    this.name = 'CampaignVersionConflict';
  }
}

export class SeasonDoesNotAcceptCampaigns extends Error {
  constructor(id: string) {
    super(`Season ${id} does not accept new campaigns in its current status`);
    this.name = 'SeasonDoesNotAcceptCampaigns';
  }
}

function audit(input: {
  readonly ids: CampaignIdGenerator;
  readonly organisationId: OrganisationId;
  readonly campaign: Campaign;
  readonly action: LifecycleAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly occurredAt: Date;
}): LifecycleAuditRecord {
  return Object.freeze({
    id: input.ids.next('audit'),
    organisationId: input.organisationId,
    entityType: 'CAMPAIGN' as const,
    entityId: input.campaign.id,
    action: input.action,
    actorCredentialId: input.actorCredentialId,
    expectedVersion: input.expectedVersion,
    resultingVersion: input.campaign.version,
    occurredAt: input.occurredAt.toISOString(),
  });
}

export async function createCampaignUseCase(input: {
  readonly repository: CampaignRepository;
  readonly seasonRepository: SeasonRepository;
  readonly clock: CampaignClock;
  readonly ids: CampaignIdGenerator;
  readonly organisationId: OrganisationId;
  readonly seasonId: string;
  readonly code: string;
  readonly name: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly actorCredentialId: string;
  readonly idempotencyKey: string;
}): Promise<LifecycleCreateResult<Campaign>> {
  const now = input.clock.now();
  const code = input.code.trim().toUpperCase();
  const idempotency = lifecycleCreateCommand({
    organisationId: input.organisationId,
    commandName: 'CREATE_CAMPAIGN',
    idempotencyKey: input.idempotencyKey,
    payload: {
      seasonId: input.seasonId.trim(),
      code,
      name: input.name.trim(),
      startsAt: input.startsAt.toISOString(),
      endsAt: input.endsAt.toISOString(),
    },
    actorCredentialId: input.actorCredentialId,
    requestedAt: now,
  });

  const replay = await input.repository.findCreateReplay(idempotency);
  if (replay) return Object.freeze({ entity: replay, replayed: true });

  const season = await getSeason(
    input.seasonRepository,
    input.organisationId,
    input.seasonId,
  );
  if (season.status === 'CLOSED' || season.status === 'ARCHIVED') {
    throw new SeasonDoesNotAcceptCampaigns(season.id);
  }
  if (await input.repository.findByCode(input.organisationId, code)) {
    throw new CampaignAlreadyExists(code);
  }

  const campaign = createCampaign({
    id: input.ids.next('campaign'),
    organisationId: input.organisationId,
    seasonId: season.id,
    code,
    name: input.name,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    ownerCredentialId: input.actorCredentialId,
    now,
  });
  return input.repository.create(
    campaign,
    audit({
      ids: input.ids,
      organisationId: input.organisationId,
      campaign,
      action: 'CREATED',
      actorCredentialId: input.actorCredentialId,
      expectedVersion: null,
      occurredAt: now,
    }),
    idempotency,
  );
}

export async function listCampaigns(
  repository: CampaignRepository,
  organisationId: OrganisationId,
): Promise<readonly Campaign[]> {
  return repository.list(organisationId);
}

export async function getCampaign(input: {
  readonly repository: CampaignRepository;
  readonly organisationId: OrganisationId;
  readonly id: string;
}): Promise<Campaign> {
  const campaign = await input.repository.findById(
    input.organisationId,
    input.id as Campaign['id'],
  );
  if (!campaign) throw new CampaignNotFound(input.id);
  return campaign;
}

export async function updateCampaignUseCase(input: {
  readonly repository: CampaignRepository;
  readonly clock: CampaignClock;
  readonly ids: CampaignIdGenerator;
  readonly organisationId: OrganisationId;
  readonly id: string;
  readonly expectedVersion: number;
  readonly actorCredentialId: string;
  readonly name?: string;
  readonly startsAt?: Date;
  readonly endsAt?: Date;
  readonly status?: CampaignStatus;
}): Promise<Campaign> {
  const current = await getCampaign(input);
  if (current.version !== input.expectedVersion) {
    throw new CampaignVersionConflict(input.id);
  }
  const now = input.clock.now();
  const changed = reviseCampaign(current, {
    name: input.name,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    status: input.status,
    now,
  });
  const action: LifecycleAuditAction =
    changed.status === current.status ? 'UPDATED' : 'STATUS_CHANGED';
  const updated = await input.repository.update(
    changed,
    input.expectedVersion,
    audit({
      ids: input.ids,
      organisationId: input.organisationId,
      campaign: changed,
      action,
      actorCredentialId: input.actorCredentialId,
      expectedVersion: input.expectedVersion,
      occurredAt: now,
    }),
  );
  if (!updated) throw new CampaignVersionConflict(input.id);
  return changed;
}
