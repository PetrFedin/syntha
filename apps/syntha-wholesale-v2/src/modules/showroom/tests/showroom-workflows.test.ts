import { describe, expect, it } from 'vitest';

import {
  createCollection,
  reviseCollection,
  type Collection,
  type CollectionId,
  type CollectionRepository,
} from '@/modules/collections';
import type { LifecycleCreateResult } from '@/modules/lifecycle-idempotency';
import { organisationId } from '@/modules/organisations';

import {
  CollectionNotReadyForShowroomPublication,
  InMemoryShowroomRepository,
  ShowroomVersionConflict,
  archiveShowroomUseCase,
  createShowroomUseCase,
  publishShowroomUseCase,
} from '../index';

class MemoryCollectionRepository implements CollectionRepository {
  constructor(private readonly collection: Collection) {}

  async findById(organisation: Collection['organisationId'], id: CollectionId) {
    return this.collection.organisationId === organisation && this.collection.id === id
      ? this.collection
      : null;
  }

  async findByCode() {
    return null;
  }

  async listByCampaign() {
    return [this.collection];
  }

  async findCreateReplay() {
    return null;
  }

  async create(collection: Collection): Promise<LifecycleCreateResult<Collection>> {
    return Object.freeze({ entity: collection, replayed: false });
  }

  async update() {
    return false;
  }
}

function ids(scope: string) {
  let sequence = 0;
  return { next: (prefix: string) => `${prefix}-${scope}-${++sequence}` };
}

const organisation = organisationId('ORG-SHOWROOM');
const now = new Date('2026-07-29T12:00:00.000Z');
const clock = { now: () => now };

function collection(status: Collection['status'] = 'DRAFT'): Collection {
  let value = createCollection({
    id: 'collection-1',
    organisationId: organisation,
    campaignId: 'campaign-1' as Collection['campaignId'],
    code: 'MAIN',
    name: 'Main Collection',
    currency: 'EUR',
    ownerCredentialId: 'collection-owner',
    now: new Date('2026-07-29T09:00:00.000Z'),
  });
  if (status === 'READY' || status === 'PUBLISHED') {
    value = reviseCollection(value, {
      status: 'READY',
      now: new Date('2026-07-29T09:30:00.000Z'),
    });
  }
  if (status === 'PUBLISHED') {
    value = reviseCollection(value, {
      status: 'PUBLISHED',
      now: new Date('2026-07-29T10:00:00.000Z'),
    });
  }
  return value;
}

function createInput(
  repository: InMemoryShowroomRepository,
  parent: Collection,
  key: string,
) {
  return {
    repository,
    collectionRepository: new MemoryCollectionRepository(parent),
    clock,
    ids: ids(key),
    organisationId: organisation,
    collectionId: parent.id,
    code: 'BUYER-PREVIEW',
    title: 'Buyer Preview',
    description: 'Authoritative line presentation',
    opensAt: new Date('2026-09-01T00:00:00.000Z'),
    closesAt: new Date('2026-12-01T00:00:00.000Z'),
    actorCredentialId: 'showroom-editor',
    idempotencyKey: key,
  } as const;
}

describe('Showroom workflows', () => {
  it('creates and replays one draft without duplicate audit evidence', async () => {
    const repository = new InMemoryShowroomRepository();
    const parent = collection();
    const input = createInput(repository, parent, 'showroom-create-replay');

    const first = await createShowroomUseCase(input);
    const replay = await createShowroomUseCase(input);

    expect(first.replayed).toBe(false);
    expect(replay.replayed).toBe(true);
    expect(replay.entity.id).toBe(first.entity.id);
    expect(await repository.listByCollection(organisation, parent.id)).toHaveLength(1);
    expect(repository.audits).toHaveLength(1);
  });

  it('rejects publication while the parent Collection is not published', async () => {
    const repository = new InMemoryShowroomRepository();
    const parent = collection('READY');
    const created = await createShowroomUseCase(
      createInput(repository, parent, 'showroom-create-unpublished-parent'),
    );

    await expect(
      publishShowroomUseCase({
        repository,
        collectionRepository: new MemoryCollectionRepository(parent),
        clock,
        ids: ids('publish-unpublished-parent'),
        organisationId: organisation,
        id: created.entity.id,
        expectedVersion: 1,
        actorCredentialId: 'showroom-publisher',
        idempotencyKey: 'showroom-publish-unpublished-parent',
      }),
    ).rejects.toBeInstanceOf(CollectionNotReadyForShowroomPublication);
  });

  it('publishes one immutable snapshot, audit and outbox fact and replays it', async () => {
    const repository = new InMemoryShowroomRepository();
    const parent = collection('PUBLISHED');
    const created = await createShowroomUseCase(
      createInput(repository, parent, 'showroom-create-publish'),
    );
    const publishInput = {
      repository,
      collectionRepository: new MemoryCollectionRepository(parent),
      clock,
      ids: ids('publish'),
      organisationId: organisation,
      id: created.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'showroom-publisher',
      idempotencyKey: 'showroom-publish-replay',
    } as const;

    const published = await publishShowroomUseCase(publishInput);
    const replay = await publishShowroomUseCase(publishInput);

    expect(published.replayed).toBe(false);
    expect(replay).toEqual({ entity: published.entity, replayed: true });
    expect(published.entity).toMatchObject({
      showroomId: created.entity.id,
      showroomVersion: 2,
      collectionId: parent.id,
      title: 'Buyer Preview',
      publishedByCredentialId: 'showroom-publisher',
    });
    expect(repository.audits.map((record) => record.action)).toEqual(['CREATED', 'PUBLISHED']);
    expect(repository.outbox).toEqual([
      expect.objectContaining({
        eventName: 'SHOWROOM_PUBLISHED',
        aggregateId: created.entity.id,
        aggregateVersion: 2,
      }),
    ]);

    const archived = await archiveShowroomUseCase({
      repository,
      clock,
      ids: ids('archive'),
      organisationId: organisation,
      id: created.entity.id,
      expectedVersion: 2,
      actorCredentialId: 'showroom-archiver',
    });
    const snapshot = await repository.findPublicationSnapshot(organisation, created.entity.id);
    expect(archived).toMatchObject({ status: 'ARCHIVED', version: 3 });
    expect(snapshot).toEqual(published.entity);
  });

  it('rejects a stale second publication with another idempotency key', async () => {
    const repository = new InMemoryShowroomRepository();
    const parent = collection('PUBLISHED');
    const created = await createShowroomUseCase(
      createInput(repository, parent, 'showroom-create-stale-publish'),
    );

    await publishShowroomUseCase({
      repository,
      collectionRepository: new MemoryCollectionRepository(parent),
      clock,
      ids: ids('publish-a'),
      organisationId: organisation,
      id: created.entity.id,
      expectedVersion: 1,
      actorCredentialId: 'showroom-publisher',
      idempotencyKey: 'showroom-publish-first',
    });

    await expect(
      publishShowroomUseCase({
        repository,
        collectionRepository: new MemoryCollectionRepository(parent),
        clock,
        ids: ids('publish-b'),
        organisationId: organisation,
        id: created.entity.id,
        expectedVersion: 1,
        actorCredentialId: 'showroom-publisher',
        idempotencyKey: 'showroom-publish-stale',
      }),
    ).rejects.toBeInstanceOf(ShowroomVersionConflict);
    expect(repository.outbox).toHaveLength(1);
  });
});
