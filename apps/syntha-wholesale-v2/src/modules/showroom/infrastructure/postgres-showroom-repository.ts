import type {
  SqlExecutor,
  TransactionalSqlClient,
  TransactionalSqlPool,
} from '@/modules/commercial-execution';
import {
  executeLifecycleCreate,
  findLifecycleCreateReplay,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import { organisationId, type OrganisationId } from '@/modules/organisations';

import type {
  ShowroomAuditRecord,
  ShowroomPublishedEvent,
  ShowroomRepository,
} from '../application/showroom-repository';
import { ShowroomVersionConflict } from '../application/showroom-workflows';
import {
  showroomId,
  showroomSnapshotId,
  type Showroom,
  type ShowroomId,
  type ShowroomPublicationSnapshot,
  type ShowroomStatus,
} from '../domain/showroom';

interface ShowroomRow {
  readonly organisationId: string;
  readonly id: string;
  readonly collectionId: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly opensAt: string;
  readonly closesAt: string;
  readonly status: ShowroomStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string | number;
}

interface SnapshotRow {
  readonly organisationId: string;
  readonly id: string;
  readonly showroomId: string;
  readonly showroomVersion: string | number;
  readonly collectionId: string;
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly opensAt: string;
  readonly closesAt: string;
  readonly publishedByCredentialId: string;
  readonly publishedAt: string;
}

const showroomSelection = `SELECT
  organisation_id AS "organisationId",
  id,
  collection_id AS "collectionId",
  code,
  title,
  description,
  opens_at::text AS "opensAt",
  closes_at::text AS "closesAt",
  status,
  owner_credential_id AS "ownerCredentialId",
  created_at::text AS "createdAt",
  updated_at::text AS "updatedAt",
  version
FROM syntha_showroom`;

const snapshotSelection = `SELECT
  organisation_id AS "organisationId",
  id,
  showroom_id AS "showroomId",
  showroom_version AS "showroomVersion",
  collection_id AS "collectionId",
  code,
  title,
  description,
  opens_at::text AS "opensAt",
  closes_at::text AS "closesAt",
  published_by_credential_id AS "publishedByCredentialId",
  published_at::text AS "publishedAt"
FROM syntha_showroom_publication_snapshot`;

function freezeShowroom(row: ShowroomRow): Showroom {
  return Object.freeze({
    organisationId: organisationId(row.organisationId),
    id: showroomId(row.id),
    collectionId: row.collectionId as Showroom['collectionId'],
    code: row.code,
    title: row.title,
    description: row.description,
    opensAt: new Date(row.opensAt).toISOString(),
    closesAt: new Date(row.closesAt).toISOString(),
    status: row.status,
    ownerCredentialId: row.ownerCredentialId,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    version: Number(row.version),
  });
}

function freezeSnapshot(row: SnapshotRow): ShowroomPublicationSnapshot {
  return Object.freeze({
    organisationId: organisationId(row.organisationId),
    id: showroomSnapshotId(row.id),
    showroomId: showroomId(row.showroomId),
    showroomVersion: Number(row.showroomVersion),
    collectionId: row.collectionId as ShowroomPublicationSnapshot['collectionId'],
    code: row.code,
    title: row.title,
    description: row.description,
    opensAt: new Date(row.opensAt).toISOString(),
    closesAt: new Date(row.closesAt).toISOString(),
    publishedByCredentialId: row.publishedByCredentialId,
    publishedAt: new Date(row.publishedAt).toISOString(),
  });
}

async function loadShowroom(
  executor: SqlExecutor,
  organisationIdValue: OrganisationId,
  id: string,
): Promise<Showroom | null> {
  const result = await executor.query<ShowroomRow>(
    `${showroomSelection} WHERE organisation_id = $1 AND id = $2`,
    [organisationIdValue, id],
  );
  return result.rows[0] ? freezeShowroom(result.rows[0]) : null;
}

async function loadSnapshot(
  executor: SqlExecutor,
  organisationIdValue: OrganisationId,
  id: string,
): Promise<ShowroomPublicationSnapshot | null> {
  const result = await executor.query<SnapshotRow>(
    `${snapshotSelection} WHERE organisation_id = $1 AND id = $2`,
    [organisationIdValue, id],
  );
  return result.rows[0] ? freezeSnapshot(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: ShowroomAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_showroom_audit
       (id, organisation_id, showroom_id, action, actor_credential_id,
        expected_version, resulting_version, snapshot_id, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz)`,
    [
      audit.id,
      audit.organisationId,
      audit.showroomId,
      audit.action,
      audit.actorCredentialId,
      audit.expectedVersion,
      audit.resultingVersion,
      audit.snapshotId,
      audit.occurredAt,
    ],
  );
}

async function appendOutbox(
  client: TransactionalSqlClient,
  event: ShowroomPublishedEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_showroom_outbox
       (id, organisation_id, aggregate_id, aggregate_version,
        event_name, payload, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::timestamptz)`,
    [
      event.id,
      event.organisationId,
      event.aggregateId,
      event.aggregateVersion,
      event.eventName,
      JSON.stringify(event.payload),
      event.occurredAt,
    ],
  );
}

export class PostgresShowroomRepository implements ShowroomRepository {
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findById(
    organisationIdValue: OrganisationId,
    id: ShowroomId,
  ): Promise<Showroom | null> {
    return loadShowroom(this.pool, organisationIdValue, id);
  }

  async findByCode(
    organisationIdValue: OrganisationId,
    collectionId: Showroom['collectionId'],
    code: string,
  ): Promise<Showroom | null> {
    const result = await this.pool.query<ShowroomRow>(
      `${showroomSelection}
       WHERE organisation_id = $1 AND collection_id = $2 AND code = $3`,
      [organisationIdValue, collectionId, code],
    );
    return result.rows[0] ? freezeShowroom(result.rows[0]) : null;
  }

  async listByCollection(
    organisationIdValue: OrganisationId,
    collectionId: Showroom['collectionId'],
  ): Promise<readonly Showroom[]> {
    const result = await this.pool.query<ShowroomRow>(
      `${showroomSelection}
       WHERE organisation_id = $1 AND collection_id = $2
       ORDER BY updated_at DESC, code ASC`,
      [organisationIdValue, collectionId],
    );
    return Object.freeze(result.rows.map(freezeShowroom));
  }

  async findPublicationSnapshot(
    organisationIdValue: OrganisationId,
    showroomIdValue: ShowroomId,
  ): Promise<ShowroomPublicationSnapshot | null> {
    const result = await this.pool.query<SnapshotRow>(
      `${snapshotSelection}
       WHERE organisation_id = $1 AND showroom_id = $2`,
      [organisationIdValue, showroomIdValue],
    );
    return result.rows[0] ? freezeSnapshot(result.rows[0]) : null;
  }

  async findCreateReplay(command: LifecycleCreateCommand): Promise<Showroom | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'SHOWROOM',
      loadEntity: (executor, id) => loadShowroom(executor, command.organisationId, id),
    });
  }

  async create(
    showroom: Showroom,
    audit: ShowroomAuditRecord,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Showroom>> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'SHOWROOM',
        resultEntityId: showroom.id,
        loadEntity: (executor, id) =>
          loadShowroom(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_showroom
               (organisation_id, id, collection_id, code, title, description,
                opens_at, closes_at, status, owner_credential_id,
                created_at, updated_at, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz,
                     $9, $10, $11::timestamptz, $12::timestamptz, $13)`,
            [
              showroom.organisationId,
              showroom.id,
              showroom.collectionId,
              showroom.code,
              showroom.title,
              showroom.description,
              showroom.opensAt,
              showroom.closesAt,
              showroom.status,
              showroom.ownerCredentialId,
              showroom.createdAt,
              showroom.updatedAt,
              showroom.version,
            ],
          );
          await appendAudit(client, audit);
          return showroom;
        },
      });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the write failure.
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async update(
    showroom: Showroom,
    expectedVersion: number,
    audit: ShowroomAuditRecord,
  ): Promise<boolean> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE syntha_showroom
         SET title = $1,
             description = $2,
             opens_at = $3::timestamptz,
             closes_at = $4::timestamptz,
             status = $5,
             updated_at = $6::timestamptz,
             version = $7
         WHERE organisation_id = $8 AND id = $9 AND version = $10`,
        [
          showroom.title,
          showroom.description,
          showroom.opensAt,
          showroom.closesAt,
          showroom.status,
          showroom.updatedAt,
          showroom.version,
          showroom.organisationId,
          showroom.id,
          expectedVersion,
        ],
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }
      await appendAudit(client, audit);
      await client.query('COMMIT');
      return true;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the write failure.
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async findPublishReplay(
    command: LifecycleCreateCommand,
  ): Promise<ShowroomPublicationSnapshot | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'SHOWROOM_SNAPSHOT',
      loadEntity: (executor, id) => loadSnapshot(executor, command.organisationId, id),
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
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'SHOWROOM_SNAPSHOT',
        resultEntityId: snapshot.id,
        loadEntity: (executor, id) => loadSnapshot(executor, command.organisationId, id),
        createEntity: async () => {
          const updated = await client.query(
            `UPDATE syntha_showroom
             SET status = $1,
                 updated_at = $2::timestamptz,
                 version = $3
             WHERE organisation_id = $4 AND id = $5 AND version = $6 AND status = 'DRAFT'`,
            [
              showroom.status,
              showroom.updatedAt,
              showroom.version,
              showroom.organisationId,
              showroom.id,
              expectedVersion,
            ],
          );
          if (updated.rowCount === 0) {
            throw new ShowroomVersionConflict(showroom.id);
          }
          await client.query(
            `INSERT INTO syntha_showroom_publication_snapshot
               (organisation_id, id, showroom_id, showroom_version, collection_id,
                code, title, description, opens_at, closes_at,
                published_by_credential_id, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                     $9::timestamptz, $10::timestamptz, $11, $12::timestamptz)`,
            [
              snapshot.organisationId,
              snapshot.id,
              snapshot.showroomId,
              snapshot.showroomVersion,
              snapshot.collectionId,
              snapshot.code,
              snapshot.title,
              snapshot.description,
              snapshot.opensAt,
              snapshot.closesAt,
              snapshot.publishedByCredentialId,
              snapshot.publishedAt,
            ],
          );
          await appendAudit(client, audit);
          await appendOutbox(client, event);
          return snapshot;
        },
      });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Preserve the write failure.
      }
      throw error;
    } finally {
      client.release();
    }
  }
}
