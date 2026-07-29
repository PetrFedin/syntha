import { describe, expect, it } from 'vitest';

import {
  createCampaign,
  reviseCampaign,
  type Campaign,
  type CampaignId,
  type CampaignRepository,
  type LifecycleAuditRecord,
} from '@/modules/campaigns';
import { organisationId } from '@/modules/organisations';

import type { CollectionRepository } from '../application/collection-repository';
import {
  CampaignDoesNotAcceptCollections,
  CollectionVersionConflict,
  createCollectionUseCase,
  getCollection,
  updateCollectionUseCase,
} from '../application/collection-workflows';
import type { Collection, CollectionId } from '../domain/collection';

class MemoryCampaignRepository implements CampaignRepository {
  constructor(private readonly campaign: Campaign) {}

  async findById(organisation: Campaign['organisationId'], id: CampaignId) {
    return this.campaign.organisationId === organisation && this.campaign.id === id
      ? this.campaign
      : null;
  }

  async findByCode(organisation: Campaign['organisationId'], code: string) {
    return this.campaign.organisationId === organisation && this.campaign.code === code
      ? this.campaign
      : null;
  }

  async list(organisation: Campaign['organisationId']) {
    return this.campaign.organisationId === organisation ? [this.campaign] : [];
  }

  async create() {
    throw new Error('not used');
  }

  async update() {
    throw new Error('not used');
  }
}

class MemoryCollectionRepository implements CollectionRepository {
  readonly collections = new Map<string, Collection>();
  readonly audits: LifecycleAuditRecord[] = [];

  private key(organisation: string, id: string): string {
    return `${organisation}:${id}`;
  }

  async findById(organisation: Collection['organisationId'], id: CollectionId) {
    return this.collections.get(this.key(organisation, id)) ?? null;
  }

  async findByCode(
    organisation: Collection['organisationId'],
    campaignId: CampaignId,
    code: string,
  ) {
    return (
      [...this.collections.values()].find(
        (collection) =>
          collection.organisationId === organisation &&
          collection.campaignId === campaignId &&
          collection.code === code,
      ) ?? null
    );
  }

  async listByCampaign(
    organisation: Collection['organisationId'],
    campaignId: CampaignId,
  ) {
    return [...this.collections.values()].filter(
      (collection) =>
        collection.organisationId === organisation && collection.campaignId === campaignId,
    );
  }

  async create(collection: Collection, audit: LifecycleAuditRecord) {
    this.collections.set(this.key(collection.organisationId, collection.id), collection);
    this.audits.push(audit);
  }

  async update(
    collection: Collection,
    expectedVersion: number,
    audit: LifecycleAuditRecord,
  ) {
    const key = this.key(collection.organisationId, collection.id);
    const current = this.collections.get(key);
    if (!current || current.version !== expectedVersion) return false;
    this.collections.set(key, collection);
    this.audits.push(audit);
    return true;
  }
}

function fixture(status: Campaign['status'] = 'DRAFT') {
  const organisation = organisationId('ORG-A');
  const created = createCampaign({
    id: 'campaign-1',
    organisationId: organisation,
    seasonId: 'season-1',
    code: 'SS27',
    name: 'Spring Summer 2027',
    startsAt: new Date('2026-09-01T00:00:00.000Z'),
    endsAt: new Date('2027-03-01T00:00:00.000Z'),
    ownerCredentialId: 'campaign-owner',
    now: new Date('2026-07-29T10:00:00.000Z'),
  });
  const campaign =
    status === 'DRAFT'
      ? created
      : reviseCampaign(created, {
          status,
          now: new Date('2026-07-29T11:00:00.000Z'),
        });
  let sequence = 0;
  return {
    organisation,
    campaign,
    campaignRepository: new MemoryCampaignRepository(campaign),
    collectionRepository: new MemoryCollectionRepository(),
    clock: { now: () => new Date('2026-07-29T12:00:00.000Z') },
    ids: { next: (prefix: string) => `${prefix}-${++sequence}` },
  };
}

describe('collection workflows', () => {
  it('creates a collection under an authoritative campaign and audits the actor', async () => {
    const context = fixture();

    const collection = await createCollectionUseCase({
      ...context,
      organisationId: context.organisation,
      campaignId: context.campaign.id,
      code: ' main-line ',
      name: 'Main Line',
      currency: 'eur',
      actorCredentialId: 'collection-manager',
    });

    expect(collection.code).toBe('MAIN-LINE');
    expect(collection.currency).toBe('EUR');
    expect(context.collectionRepository.audits).toEqual([
      expect.objectContaining({
        entityType: 'COLLECTION',
        entityId: collection.id,
        actorCredentialId: 'collection-manager',
        resultingVersion: 1,
      }),
    ]);
  });

  it('blocks collection creation after campaign closure', async () => {
    const context = fixture('CLOSED');

    await expect(
      createCollectionUseCase({
        ...context,
        organisationId: context.organisation,
        campaignId: context.campaign.id,
        code: 'CLOSED-LINE',
        name: 'Closed Line',
        currency: 'USD',
        actorCredentialId: 'operator',
      }),
    ).rejects.toBeInstanceOf(CampaignDoesNotAcceptCollections);
  });

  it('isolates reads and rejects stale collection updates', async () => {
    const context = fixture();
    const collection = await createCollectionUseCase({
      ...context,
      organisationId: context.organisation,
      campaignId: context.campaign.id,
      code: 'CAPSULE',
      name: 'Capsule',
      currency: 'GBP',
      actorCredentialId: 'creator',
    });

    await expect(
      getCollection({
        repository: context.collectionRepository,
        organisationId: organisationId('ORG-B'),
        id: collection.id,
      }),
    ).rejects.toMatchObject({ name: 'CollectionNotFound' });

    const ready = await updateCollectionUseCase({
      repository: context.collectionRepository,
      clock: context.clock,
      ids: context.ids,
      organisationId: context.organisation,
      id: collection.id,
      expectedVersion: 1,
      actorCredentialId: 'approver',
      status: 'READY',
    });
    expect(ready.version).toBe(2);

    await expect(
      updateCollectionUseCase({
        repository: context.collectionRepository,
        clock: context.clock,
        ids: context.ids,
        organisationId: context.organisation,
        id: collection.id,
        expectedVersion: 1,
        actorCredentialId: 'stale-client',
        name: 'Stale overwrite',
      }),
    ).rejects.toBeInstanceOf(CollectionVersionConflict);
  });
});
