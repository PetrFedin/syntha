import { describe, expect, it } from 'vitest';

import {
  createCampaign,
  reviseCampaign,
  type Campaign,
  type CampaignId,
  type CampaignRepository,
  type LifecycleAuditRecord,
} from '@/modules/campaigns';
import {
  InMemoryLifecycleIdempotencyRegistry,
  LifecycleIdempotencyConflict,
  type LifecycleCreateCommand,
} from '@/modules/lifecycle-idempotency';
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

  async findCreateReplay() {
    return null;
  }

  async create(): Promise<never> {
    throw new Error('not used');
  }

  async update(): Promise<boolean> {
    return false;
  }
}

class MemoryCollectionRepository implements CollectionRepository {
  readonly collections = new Map<string, Collection>();
  readonly audits: LifecycleAuditRecord[] = [];
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();

  private key(organisation: string, id: string): string {
    return `${organisation}:${id}`;
  }

  private loadForCommand(command: LifecycleCreateCommand, id: string): Collection | null {
    return this.collections.get(this.key(command.organisationId, id)) ?? null;
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

  async findCreateReplay(command: LifecycleCreateCommand) {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'COLLECTION',
      loadEntity: (id) => this.loadForCommand(command, id),
    });
  }

  async create(
    collection: Collection,
    audit: LifecycleAuditRecord,
    command: LifecycleCreateCommand,
  ) {
    const replay = await this.findCreateReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });

    this.collections.set(this.key(collection.organisationId, collection.id), collection);
    this.audits.push(audit);
    return this.idempotency.complete({
      command,
      resultEntityType: 'COLLECTION',
      resultEntityId: collection.id,
      entity: collection,
      loadEntity: (id) => this.loadForCommand(command, id),
    });
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
  let campaign = created;
  if (status === 'ACTIVE' || status === 'CLOSED') {
    campaign = reviseCampaign(campaign, {
      status: 'ACTIVE',
      now: new Date('2026-07-29T10:30:00.000Z'),
    });
  }
  if (status === 'CLOSED') {
    campaign = reviseCampaign(campaign, {
      status: 'CLOSED',
      now: new Date('2026-07-29T11:00:00.000Z'),
    });
  }
  if (status === 'ARCHIVED') {
    campaign = reviseCampaign(campaign, {
      status: 'ARCHIVED',
      now: new Date('2026-07-29T11:00:00.000Z'),
    });
  }
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

function createInput(
  context: ReturnType<typeof fixture>,
  overrides: Partial<{
    code: string;
    name: string;
    currency: string;
    actorCredentialId: string;
    idempotencyKey: string;
  }> = {},
) {
  return {
    ...context,
    organisationId: context.organisation,
    campaignId: context.campaign.id,
    code: overrides.code ?? 'MAIN-LINE',
    name: overrides.name ?? 'Main Line',
    currency: overrides.currency ?? 'EUR',
    actorCredentialId: overrides.actorCredentialId ?? 'collection-manager',
    idempotencyKey: overrides.idempotencyKey ?? 'collection-create-001',
  };
}

describe('collection workflows', () => {
  it('creates a collection under an authoritative campaign and audits the actor', async () => {
    const context = fixture();

    const result = await createCollectionUseCase(
      createInput(context, { code: ' main-line ', currency: 'eur' }),
    );
    const collection = result.entity;

    expect(result.replayed).toBe(false);
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

  it('replays the original collection without a duplicate entity or audit', async () => {
    const context = fixture();
    const input = createInput(context, { idempotencyKey: 'collection-create-replay' });

    const first = await createCollectionUseCase(input);
    const replay = await createCollectionUseCase(input);

    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.entity.id).toBe(first.entity.id);
    expect(context.collectionRepository.collections.size).toBe(1);
    expect(context.collectionRepository.audits).toHaveLength(1);
  });

  it('rejects reuse of a collection idempotency key with another payload', async () => {
    const context = fixture();
    const input = createInput(context, { idempotencyKey: 'collection-create-conflict' });

    await createCollectionUseCase(input);
    await expect(
      createCollectionUseCase({ ...input, currency: 'USD' }),
    ).rejects.toBeInstanceOf(LifecycleIdempotencyConflict);
    expect(context.collectionRepository.collections.size).toBe(1);
    expect(context.collectionRepository.audits).toHaveLength(1);
  });

  it('blocks collection creation after campaign closure', async () => {
    const context = fixture('CLOSED');

    await expect(
      createCollectionUseCase(
        createInput(context, {
          code: 'CLOSED-LINE',
          name: 'Closed Line',
          currency: 'USD',
          actorCredentialId: 'operator',
          idempotencyKey: 'collection-closed-campaign',
        }),
      ),
    ).rejects.toBeInstanceOf(CampaignDoesNotAcceptCollections);
  });

  it('isolates reads and rejects stale collection updates', async () => {
    const context = fixture();
    const collection = (
      await createCollectionUseCase(
        createInput(context, {
          code: 'CAPSULE',
          name: 'Capsule',
          currency: 'GBP',
          actorCredentialId: 'creator',
          idempotencyKey: 'collection-stale-update',
        }),
      )
    ).entity;

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
