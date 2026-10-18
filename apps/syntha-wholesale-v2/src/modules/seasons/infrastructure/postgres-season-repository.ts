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
  SeasonAuditRecord,
  SeasonRepository,
} from '../application/season-repository';
import {
  seasonId,
  type Season,
  type SeasonId,
  type SeasonStatus,
} from '../domain/season';

interface SeasonRow {
  readonly organisationId: string;
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: SeasonStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string | number;
}

const selection = `SELECT
  organisation_id AS "organisationId",
  id,
  code,
  name,
  starts_at::text AS "startsAt",
  ends_at::text AS "endsAt",
  status,
  owner_credential_id AS "ownerCredentialId",
  created_at::text AS "createdAt",
  updated_at::text AS "updatedAt",
  version
FROM syntha_season`;

function freezeSeason(row: SeasonRow): Season {
  return Object.freeze({
    organisationId: organisationId(row.organisationId),
    id: seasonId(row.id),
    code: row.code,
    name: row.name,
    startsAt: new Date(row.startsAt).toISOString(),
    endsAt: new Date(row.endsAt).toISOString(),
    status: row.status,
    ownerCredentialId: row.ownerCredentialId,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    version: Number(row.version),
  });
}

async function loadSeason(
  executor: SqlExecutor,
  organisationIdValue: OrganisationId,
  id: string,
): Promise<Season | null> {
  const result = await executor.query<SeasonRow>(
    `${selection} WHERE organisation_id = $1 AND id = $2`,
    [organisationIdValue, id],
  );
  return result.rows[0] ? freezeSeason(result.rows[0]) : null;
}

async function appendAudit(
  client: TransactionalSqlClient,
  audit: SeasonAuditRecord,
): Promise<void> {
  await client.query(
    `INSERT INTO syntha_lifecycle_audit
       (id, organisation_id, entity_type, entity_id, action, actor_credential_id,
        expected_version, resulting_version, occurred_at)
     VALUES ($1, $2, 'SEASON', $3, $4, $5, $6, $7, $8::timestamptz)`,
    [
      audit.id,
      audit.organisationId,
      audit.seasonId,
      audit.action,
      audit.actorCredentialId,
      audit.expectedVersion,
      audit.resultingVersion,
      audit.occurredAt,
    ],
  );
}

export class PostgresSeasonRepository implements SeasonRepository {
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findById(
    organisationIdValue: OrganisationId,
    id: SeasonId,
  ): Promise<Season | null> {
    return loadSeason(this.pool, organisationIdValue, id);
  }

  async findByOrganisation(
    organisationIdValue: OrganisationId,
  ): Promise<readonly Season[]> {
    const result = await this.pool.query<SeasonRow>(
      `${selection}
       WHERE organisation_id = $1
       ORDER BY starts_at DESC, code ASC`,
      [organisationIdValue],
    );
    return Object.freeze(result.rows.map(freezeSeason));
  }

  async findByCode(
    organisationIdValue: OrganisationId,
    code: string,
  ): Promise<Season | null> {
    const result = await this.pool.query<SeasonRow>(
      `${selection} WHERE organisation_id = $1 AND code = $2`,
      [organisationIdValue, code],
    );
    return result.rows[0] ? freezeSeason(result.rows[0]) : null;
  }

  async findCreateReplay(command: LifecycleCreateCommand): Promise<Season | null> {
    return findLifecycleCreateReplay({
      executor: this.pool,
      command,
      expectedEntityType: 'SEASON',
      loadEntity: (executor, id) =>
        loadSeason(executor, command.organisationId, id),
    });
  }

  async create(
    season: Season,
    audit: SeasonAuditRecord,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Season>> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await executeLifecycleCreate({
        client,
        command,
        resultEntityType: 'SEASON',
        resultEntityId: season.id,
        loadEntity: (executor, id) =>
          loadSeason(executor, command.organisationId, id),
        createEntity: async () => {
          await client.query(
            `INSERT INTO syntha_season
               (organisation_id, id, code, name, starts_at, ends_at, status,
                owner_credential_id, created_at, updated_at, version)
             VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7,
                     $8, $9::timestamptz, $10::timestamptz, $11)`,
            [
              season.organisationId,
              season.id,
              season.code,
              season.name,
              season.startsAt,
              season.endsAt,
              season.status,
              season.ownerCredentialId,
              season.createdAt,
              season.updatedAt,
              season.version,
            ],
          );
          await appendAudit(client, audit);
          return season;
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
    season: Season,
    expectedVersion: number,
    audit: SeasonAuditRecord,
  ): Promise<boolean> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE syntha_season
         SET status = $1,
             updated_at = $2::timestamptz,
             version = $3
         WHERE organisation_id = $4 AND id = $5 AND version = $6`,
        [
          season.status,
          season.updatedAt,
          season.version,
          season.organisationId,
          season.id,
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
