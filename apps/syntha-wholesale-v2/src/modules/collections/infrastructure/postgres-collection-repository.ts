import type { LifecycleAuditRecord } from '@/modules/campaigns';
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

import type { CollectionRepository } from '../application/collection-repository';
import {
  collectionId,
  type Collection,
  type CollectionId,
  type CollectionStatus,
} from '../domain/collection';

interface CollectionRow {
  readonly organisationId: string;
  readonly id: string;
  readonly campaignId: string;
  readonly code: string;
  readonly name: string;
  readonly currency: string;
  readonly status: CollectionStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string | number;
}

const selection = `SELECT
  organisation_id AS "organisationId",
  id,
  campaign_id AS "campaignId",
  code,
  name,
  currency,
  status,
  owner_credential_id AS "ownerCredentialId",
  created_at::text AS "createdAt",
  updated_at::text AS "updatedAt",
  version
FROM syntha_collection`;

function freezeCollection(row: CollectionRow): Collection {
  return Object.freeze({
    organisationId: organisationId(row.organisationId),
    id: collectionId(row.id),
    campaignId: row.campaignId as Collection['campaignId'],
    code: row.code,
    name: row.name,
    currency: row.currency,
    status: row.status,
    ownerCredentialId: row.ownerCredentialId,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    version: Number(row.version),
  });
}

async function loadCollection(
  executor: SqlExecutor,
  organisationIdValue: OrganisationId,
  id: string,
): Promise<Collection | null> {
  const result = await executor.query<CollectionRow>(
    `${selection} WHERE organisation_id = $1 AND id = $2`,
    [organisationIdValue, id],
  );
  return result.rows[0] ? freezeCollection(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: LifecycleAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_lifecycle_audit
       (id, organisation_id, entity_type, entity_id, action, actor_credential_id,
        expected_version, resulting_version, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz)`,
    [
      audit.id,
      audit.organisationId,
      audit.entityType,
      audit.entityId,
      audit.action,
      audit.actorCredentialId,
      audit.expectedVersion,
      audit.resultingVersion,
      audit.occurredAt,
    ],
  );
}

export class PostgresCollectionRepository implements CollectionRepository {
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findById(
    organisationIdValue: OrganisationId,
    id: CollectionId,
  ): Promise<Collection | null> {
    return loadCollection(this.pool, organisationIdValue, id);
  }

  async findByCode(
    organisationIdValue: OrganisationId,
    campaignId: Collection['campaignId'],
    code: string,
  ): Promise<Collection | null> {
    const result = await this.pool.query<CollectionRow>(
      `${selection}
       WHERE organisation_id = $1 AND campaign_id = $2 AND code = $3`,
      [organisationIdValue, campaignId, code],
    );
    return result.rows[0] ? freezeCollection(result.rows[0]) : null;
  }

  async listByCampaign(
    organisationIdValue: OrganisationId,
    campaignId: Collection['campaignId'],
  ): Promise<readonly Collection[]> {
    const result = await this.pool.query<CollectionRow>(
      `${selection}
       WHERE organisation_id = $1 AND campaign_id = $2
       ORDER BY updated_at DESC, code ASC`,
      [organisationIdValue, campaignId],
    );
    return Object.freeze(result.rows.map(freezeCollection));
  }

  async findCreateReplay(command: LifecycleCreateCommand): Promise<Collection | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'COLLECTION',
      loadEntity: (executor, id) =>
        loadCollection(executor, command.organisationId, id),
    });
  }

  async create(
    collection: Collection,
    audit: LifecycleAuditRecord,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Collection>> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'COLLECTION',
        resultEntityId: collection.id,
        loadEntity: (executor, id) =>
          loadCollection(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_collection
               (organisation_id, id, campaign_id, code, name, currency, status,
                owner_credential_id, created_at, updated_at, version)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                     $9::timestamptz, $10::timestamptz, $11)`,
            [
              collection.organisationId,
              collection.id,
              collection.campaignId,
              collection.code,
              collection.name,
              collection.currency,
              collection.status,
              collection.ownerCredentialId,
              collection.createdAt,
              collection.updatedAt,
              collection.version,
            ],
          );
          await appendAudit(client, audit);
          return collection;
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
    collection: Collection,
    expectedVersion: number,
    audit: LifecycleAuditRecord,
  ): Promise<boolean> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE syntha_collection
         SET name = $1,
             currency = $2,
             status = $3,
             updated_at = $4::timestamptz,
             version = $5
         WHERE organisation_id = $6 AND id = $7 AND version = $8`,
        [
          collection.name,
          collection.currency,
          collection.status,
          collection.updatedAt,
          collection.version,
          collection.organisationId,
          collection.id,
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
}
