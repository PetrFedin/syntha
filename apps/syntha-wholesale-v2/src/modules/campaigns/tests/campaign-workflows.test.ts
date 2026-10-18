import { describe, expect, it } from 'vitest';

import {
  InMemoryLifecycleIdempotencyRegistry,
  LifecycleIdempotencyConflict,
  type LifecycleCreateCommand,
} from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';
import {
  InMemorySeasonRepository,
  SeasonNotFound,
  createSeason,
} from '@/modules/seasons';

import type {
  CampaignRepository,
  LifecycleAuditRecord,
} from '../application/campaign-repository';
import {
  CampaignNotFound,
  CampaignVersionConflict,
  createCampaignUseCase,
  getCampaign,
  updateCampaignUseCase,
} from '../application/campaign-workflows';
import type { Campaign, CampaignId } from '../domain/campaign';

class MemoryCampaignRepository implements CampaignRepository {
  readonly campaigns = new Map<string, Campaign>();
  readonly audits: LifecycleAuditRecord[] = [];
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();

  private key(organisation: string, id: string): string {
    return `${organisation}:${id}`;
  }

  private loadForCommand(command: LifecycleCreateCommand, id: string): Campaign | null {
    return this.campaigns.get(this.key(command.organisationId, id)) ?? null;
  }

  async findById(organisation: Campaign['organisationId'], id: CampaignId) {
    return this.campaigns.get(this.key(organisation, id)) ?? null;
  }

  async findByCode(organisation: Campaign['organisationId'], code: string) {
    return (
      [...this.campaigns.values()].find(
        (campaign) => campaign.organisationId === organisation && campaign.code === code,
      ) ?? null
    );
  }

  async list(organisation: Campaign['organisationId']) {
    return [...this.campaigns.values()].filter(
      (campaign) => campaign.organisationId === organisation,
    );
  }

  async findCreateReplay(command: LifecycleCreateCommand) {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'CAMPAIGN',
      loadEntity: (id) => this.loadForCommand(command, id),
    });
  }

  async create(
    campaign: Campaign,
    audit: LifecycleAuditRecord,
    command: LifecycleCreateCommand,
  ) {
    const replay = await this.findCreateReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });

    this.campaigns.set(this.key(campaign.organisationId, campaign.id), campaign);
    this.audits.push(audit);
    return this.idempotency.complete({
      command,
      resultEntityType: 'CAMPAIGN',
      resultEntityId: campaign.id,
      entity: campaign,
      loadEntity: (id) => this.loadForCommand(command, id),
    });
  }

  async update(
    campaign: Campaign,
    expectedVersion: number,
    audit: LifecycleAuditRecord,
  ) {
    const key = this.key(campaign.organisationId, campaign.id);
    const current = this.campaigns.get(key);
    if (!current || current.version !== expectedVersion) return false;
    this.campaigns.set(key, campaign);
    this.audits.push(audit);
    return true;
  }
}

function dependencies() {
  let sequence = 0;
  return {
    clock: { now: () => new Date('2026-07-29T10:00:00.000Z') },
    ids: { next: (prefix: string) => `${prefix}-${++sequence}` },
  };
}

function seasons(
  organisation: Campaign['organisationId'],
  id: string,
): InMemorySeasonRepository {
  return new InMemorySeasonRepository([
    createSeason({
      id,
      organisationId: organisation,
      code: `CODE-${id}`,
      name: `Season ${id}`,
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2027-08-01T00:00:00.000Z'),
      ownerCredentialId: 'season-owner',
      now: new Date('2026-07-29T09:00:00.000Z'),
    }),
  ]);
}

function createInput(input: {
  repository: CampaignRepository;
  organisation: Campaign['organisationId'];
  seasonId: string;
  idempotencyKey: string;
  code?: string;
  name?: string;
  actorCredentialId?: string;
}) {
  const { clock, ids } = dependencies();
  return {
    repository: input.repository,
    seasonRepository: seasons(input.organisation, input.seasonId),
    clock,
    ids,
    organisationId: input.organisation,
    seasonId: input.seasonId,
    code: input.code ?? 'SS27-MAIN',
    name: input.name ?? 'Spring Summer 2027',
    startsAt: new Date('2026-09-01T00:00:00.000Z'),
    endsAt: new Date('2027-03-01T00:00:00.000Z'),
    actorCredentialId: input.actorCredentialId ?? 'org-a-operator',
    idempotencyKey: input.idempotencyKey,
  };
}

describe('campaign workflows', () => {
  it('creates an organisation-scoped campaign with exact audit actor', async () => {
    const repository = new MemoryCampaignRepository();
    const organisation = organisationId('ORG-A');

    const result = await createCampaignUseCase(
      createInput({
        repository,
        organisation,
        seasonId: 'season-ss27',
        idempotencyKey: 'campaign-create-001',
        code: ' ss27-main ',
      }),
    );
    const campaign = result.entity;

    expect(result.replayed).toBe(false);
    expect(campaign.code).toBe('SS27-MAIN');
    expect(campaign.version).toBe(1);
    expect(repository.audits).toEqual([
      expect.objectContaining({
        organisationId: organisation,
        entityType: 'CAMPAIGN',
        entityId: campaign.id,
        action: 'CREATED',
        actorCredentialId: 'org-a-operator',
        expectedVersion: null,
        resultingVersion: 1,
      }),
    ]);
  });

  it('replays the original campaign without a second entity or audit record', async () => {
    const repository = new MemoryCampaignRepository();
    const organisation = organisationId('ORG-A');
    const input = createInput({
      repository,
      organisation,
      seasonId: 'season-ss27',
      idempotencyKey: 'campaign-create-replay',
    });

    const first = await createCampaignUseCase(input);
    const replay = await createCampaignUseCase(input);

    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.entity.id).toBe(first.entity.id);
    expect(repository.campaigns.size).toBe(1);
    expect(repository.audits).toHaveLength(1);
  });

  it('rejects reuse of a campaign idempotency key with another payload', async () => {
    const repository = new MemoryCampaignRepository();
    const organisation = organisationId('ORG-A');
    const base = createInput({
      repository,
      organisation,
      seasonId: 'season-ss27',
      idempotencyKey: 'campaign-create-conflict',
    });

    await createCampaignUseCase(base);
    await expect(
      createCampaignUseCase({ ...base, name: 'Different campaign name' }),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);
    expect(repository.campaigns.size).toBe(1);
    expect(repository.audits).toHaveLength(1);
  });

  it('rejects a season owned by another organisation', async () => {
    const repository = new MemoryCampaignRepository();
    const { clock, ids } = dependencies();
    await expect(
      createCampaignUseCase({
        repository,
        seasonRepository: seasons(organisationId('ORG-B'), 'season-1'),
        clock,
        ids,
        organisationId: organisationId('ORG-A'),
        seasonId: 'season-1',
        code: 'FW27',
        name: 'Fall Winter 2027',
        startsAt: new Date('2027-01-01T00:00:00.000Z'),
        endsAt: new Date('2027-08-01T00:00:00.000Z'),
        actorCredentialId: 'org-a-operator',
        idempotencyKey: 'campaign-cross-tenant',
      }),
    ).rejects.toBeInstanceOf(SeasonNotFound);
  });

  it('does not expose a campaign through another organisation scope', async () => {
    const repository = new MemoryCampaignRepository();
    const organisation = organisationId('ORG-A');
    const campaign = (
      await createCampaignUseCase(
        createInput({
          repository,
          organisation,
          seasonId: 'season-1',
          idempotencyKey: 'campaign-isolation-001',
          code: 'FW27',
          name: 'Fall Winter 2027',
        }),
      )
    ).entity;

    await expect(
      getCampaign({
        repository,
        organisationId: organisationId('ORG-B'),
        id: campaign.id,
      }),
    ).rejects.toBeInstanceOf(CampaignNotFound);
  });

  it('rejects a stale update and preserves the winning version', async () => {
    const repository = new MemoryCampaignRepository();
    const { clock, ids } = dependencies();
    const organisation = organisationId('ORG-A');
    const campaign = (
      await createCampaignUseCase({
        repository,
        seasonRepository: seasons(organisation, 'season-1'),
        clock,
        ids,
        organisationId: organisation,
        seasonId: 'season-1',
        code: 'RESORT27',
        name: 'Resort 2027',
        startsAt: new Date('2026-11-01T00:00:00.000Z'),
        endsAt: new Date('2027-04-01T00:00:00.000Z'),
        actorCredentialId: 'creator',
        idempotencyKey: 'campaign-stale-update',
      })
    ).entity;

    const activated = await updateCampaignUseCase({
      repository,
      clock,
      ids,
      organisationId: organisation,
      id: campaign.id,
      expectedVersion: 1,
      actorCredentialId: 'approver',
      status: 'ACTIVE',
    });

    expect(activated.version).toBe(2);
    expect(repository.audits.at(-1)).toEqual(
      expect.objectContaining({
        action: 'STATUS_CHANGED',
        actorCredentialId: 'approver',
        expectedVersion: 1,
        resultingVersion: 2,
      }),
    );

    await expect(
      updateCampaignUseCase({
        repository,
        clock,
        ids,
        organisationId: organisation,
        id: campaign.id,
        expectedVersion: 1,
        actorCredentialId: 'stale-client',
        name: 'Stale overwrite',
      }),
    ).rejects.toBeInstanceOf(CampaignVersionConflict);

    expect((await repository.findById(organisation, campaign.id))?.name).toBe('Resort 2027');
  });
});
