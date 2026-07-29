import { describe, expect, it } from 'vitest';

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

  private key(organisation: string, id: string): string {
    return `${organisation}:${id}`;
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

  async create(campaign: Campaign, audit: LifecycleAuditRecord) {
    this.campaigns.set(this.key(campaign.organisationId, campaign.id), campaign);
    this.audits.push(audit);
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

describe('campaign workflows', () => {
  it('creates an organisation-scoped campaign with exact audit actor', async () => {
    const repository = new MemoryCampaignRepository();
    const { clock, ids } = dependencies();
    const organisation = organisationId('ORG-A');

    const campaign = await createCampaignUseCase({
      repository,
      seasonRepository: seasons(organisation, 'season-ss27'),
      clock,
      ids,
      organisationId: organisation,
      seasonId: 'season-ss27',
      code: ' ss27-main ',
      name: 'Spring Summer 2027',
      startsAt: new Date('2026-09-01T00:00:00.000Z'),
      endsAt: new Date('2027-03-01T00:00:00.000Z'),
      actorCredentialId: 'org-a-operator',
    });

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
      }),
    ).rejects.toBeInstanceOf(SeasonNotFound);
  });

  it('does not expose a campaign through another organisation scope', async () => {
    const repository = new MemoryCampaignRepository();
    const { clock, ids } = dependencies();
    const organisation = organisationId('ORG-A');
    const campaign = await createCampaignUseCase({
      repository,
      seasonRepository: seasons(organisation, 'season-1'),
      clock,
      ids,
      organisationId: organisation,
      seasonId: 'season-1',
      code: 'FW27',
      name: 'Fall Winter 2027',
      startsAt: new Date('2027-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-08-01T00:00:00.000Z'),
      actorCredentialId: 'org-a-operator',
    });

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
    const campaign = await createCampaignUseCase({
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
    });

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
