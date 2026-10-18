import {
  InMemoryLifecycleIdempotencyRegistry,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type {
  ShowroomAuditRecord,
  ShowroomPublishedEvent,
  ShowroomRepository,
} from '../application/showroom-repository';
import { ShowroomVersionConflict } from '../application/showroom-workflows';
import type {
  Showroom,
  ShowroomId,
  ShowroomPublicationSnapshot,
} from '../domain/showroom';

function copyShowroom(showroom: Showroom): Showroom {
  return Object.freeze({ ...showroom });
}

function copySnapshot(snapshot: ShowroomPublicationSnapshot): ShowroomPublicationSnapshot {
  return Object.freeze({ ...snapshot });
}

export class InMemoryShowroomRepository implements ShowroomRepository {
  private readonly records = new Map<string, Showroom>();
  private readonly snapshots = new Map<string, ShowroomPublicationSnapshot>();
  private readonly idempotency = new InMemoryLifecycleIdempotencyRegistry();
  readonly audits: ShowroomAuditRecord[] = [];
  readonly outbox: ShowroomPublishedEvent[] = [];

  constructor(initial: readonly Showroom[] = []) {
    for (const showroom of initial) {
      this.records.set(this.key(showroom.organisationId, showroom.id), copyShowroom(showroom));
    }
  }

  private key(organisationId: OrganisationId, id: string): string {
    return `${organisationId}:${id}`;
  }

  private loadShowroom(command: LifecycleCreateCommand, id: string): Showroom | null {
    return this.records.get(this.key(command.organisationId, id)) ?? null;
  }

  private loadSnapshot(
    command: LifecycleCreateCommand,
    id: string,
  ): ShowroomPublicationSnapshot | null {
    return this.snapshots.get(this.key(command.organisationId, id)) ?? null;
  }

  async findById(
    organisationId: OrganisationId,
    id: ShowroomId,
  ): Promise<Showroom | null> {
    const showroom = this.records.get(this.key(organisationId, id));
    return showroom ? copyShowroom(showroom) : null;
  }

  async findByCode(
    organisationId: OrganisationId,
    collectionId: Showroom['collectionId'],
    code: string,
  ): Promise<Showroom | null> {
    const showroom = [...this.records.values()].find(
      (candidate) =>
        candidate.organisationId === organisationId &&
        candidate.collectionId === collectionId &&
        candidate.code === code,
    );
    return showroom ? copyShowroom(showroom) : null;
  }

  async listByCollection(
    organisationId: OrganisationId,
    collectionId: Showroom['collectionId'],
  ): Promise<readonly Showroom[]> {
    return [...this.records.values()]
      .filter(
        (showroom) =>
          showroom.organisationId === organisationId && showroom.collectionId === collectionId,
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(copyShowroom);
  }

  async findPublicationSnapshot(
    organisationId: OrganisationId,
    showroomId: ShowroomId,
  ): Promise<ShowroomPublicationSnapshot | null> {
    const snapshot = [...this.snapshots.values()].find(
      (candidate) =>
        candidate.organisationId === organisationId && candidate.showroomId === showroomId,
    );
    return snapshot ? copySnapshot(snapshot) : null;
  }

  async findCreateReplay(command: LifecycleCreateCommand): Promise<Showroom | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'SHOWROOM',
      loadEntity: (id) => this.loadShowroom(command, id),
    });
  }

  async create(
    showroom: Showroom,
    audit: ShowroomAuditRecord,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Showroom>> {
    const replay = await this.findCreateReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    this.records.set(this.key(showroom.organisationId, showroom.id), copyShowroom(showroom));
    this.audits.push(Object.freeze({ ...audit }));
    return this.idempotency.complete({
      command,
      resultEntityType: 'SHOWROOM',
      resultEntityId: showroom.id,
      entity: copyShowroom(showroom),
      loadEntity: (id) => this.loadShowroom(command, id),
    });
  }

  async update(
    showroom: Showroom,
    expectedVersion: number,
    audit: ShowroomAuditRecord,
  ): Promise<boolean> {
    const key = this.key(showroom.organisationId, showroom.id);
    const current = this.records.get(key);
    if (!current || current.version !== expectedVersion) return false;
    this.records.set(key, copyShowroom(showroom));
    this.audits.push(Object.freeze({ ...audit }));
    return true;
  }

  async findPublishReplay(
    command: LifecycleCreateCommand,
  ): Promise<ShowroomPublicationSnapshot | null> {
    return this.idempotency.findReplay({
      command,
      expectedEntityType: 'SHOWROOM_SNAPSHOT',
      loadEntity: (id) => this.loadSnapshot(command, id),
    });
  }

  async publish(
    showroom: Showroom,
    snapshot: ShowroomPublicationSnapshot,
    expectedVersion: number,
    audit: ShowroomAuditRecord,
    event: ShowroomPublishedEvent,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<ShowroomPublicationSnapshot>> {
    const replay = await this.findPublishReplay(command);
    if (replay) return Object.freeze({ entity: replay, replayed: true });

    const key = this.key(showroom.organisationId, showroom.id);
    const current = this.records.get(key);
    if (!current || current.version !== expectedVersion || current.status !== 'DRAFT') {
      throw new ShowroomVersionConflict(showroom.id);
    }
    this.records.set(key, copyShowroom(showroom));
    this.snapshots.set(this.key(snapshot.organisationId, snapshot.id), copySnapshot(snapshot));
    this.audits.push(Object.freeze({ ...audit }));
    this.outbox.push(Object.freeze({ ...event, payload: Object.freeze({ ...event.payload }) }));
    return this.idempotency.complete({
      command,
      resultEntityType: 'SHOWROOM_SNAPSHOT',
      resultEntityId: snapshot.id,
      entity: copySnapshot(snapshot),
      loadEntity: (id) => this.loadSnapshot(command, id),
    });
  }
}
