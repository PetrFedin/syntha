import type { TransactionalSqlClient, TransactionalSqlPool } from '@/modules/commercial-execution';
import { organisationId, type OrganisationId } from '@/modules/organisations';

import type {
  CampaignRepository,
  LifecycleAuditRecord,
} from '../application/campaign-repository';
import {
  campaignId,
  type Campaign,
  type CampaignId,
  type CampaignStatus,
} from '../domain/campaign';

interface CampaignRow {
  readonly organisationId: string;
  readonly id: string;
  readonly seasonId: string;
  readonly code: string;
  readonly name: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: CampaignStatus;
  readonly ownerCredentialId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string | number;
}

const selection = `SELECT
  organisation_id AS "organisationId",
  id,
  season_id AS "seasonId",
  code,
  name,
  starts_at::text AS "startsAt",
  ends_at::text AS "endsAt",
  status,
  owner_credential_id AS "ownerCredentialId",
  created_at::text AS "createdAt",
  updated_at::text AS "updatedAt",
  version
FROM syntha_campaign`;

function freezeCampaign(row: CampaignRow): Campaign {
  return Object.freeze({
    organisationId: organisationId(row.organisationId),
    id: campaignId(row.id),
    seasonId: row.seasonId,
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

export class PostgresCampaignRepository implements CampaignRepository {
  constructor(private readonly pool: TransactionalSqlPool) {}

  async findById(
    organisationIdValue: OrganisationId,
    id: CampaignId,
  ): Promise<Campaign | null> {
    const result = await this.pool.query<CampaignRow>(
      `${selection} WHERE organisation_id = $1 AND id = $2`,
      [organisationIdValue, id],
    );
    return result.rows[0] ? freezeCampaign(result.rows[0]) : null;
  }

  async findByCode(
    organisationIdValue: OrganisationId,
    code: string,
  ): Promise<Campaign | null> {
    const result = await this.pool.query<CampaignRow>(
      `${selection} WHERE organisation_id = $1 AND code = $2`,
      [organisationIdValue, code],
    );
    return result.rows[0] ? freezeCampaign(result.rows[0]) : null;
  }

  async list(organisationIdValue: OrganisationId): Promise<readonly Campaign[]> {
    const result = await this.pool.query<CampaignRow>(
      `${selection}
       WHERE organisation_id = $1
       ORDER BY starts_at DESC, code ASC`,
      [organisationIdValue],
    );
    return Object.freeze(result.rows.map(freezeCampaign));
  }

  async create(campaign: Campaign, audit: LifecycleAuditRecord): Promise<void> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      await client.query(
        `INSERT INTO syntha_campaign
           (organisation_id, id, season_id, code, name, starts_at, ends_at, status,
            owner_credential_id, created_at, updated_at, version)
         VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8,
                 $9, $10::timestamptz, $11::timestamptz, $12)`,
        [
          campaign.organisationId,
          campaign.id,
          campaign.seasonId,
          campaign.code,
          campaign.name,
          campaign.startsAt,
          campaign.endsAt,
          campaign.status,
          campaign.ownerCredentialId,
          campaign.createdAt,
          campaign.updatedAt,
          campaign.version,
        ],
      );
      await appendAudit(client, audit);
      await client.query('COMMIT');
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
    campaign: Campaign,
    expectedVersion: number,
    audit: LifecycleAuditRecord,
  ): Promise<boolean> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    try {
      const result = await client.query(
        `UPDATE syntha_campaign
         SET name = $1,
             starts_at = $2::timestamptz,
             ends_at = $3::timestamptz,
             status = $4,
             updated_at = $5::timestamptz,
             version = $6
         WHERE organisation_id = $7 AND id = $8 AND version = $9`,
        [
          campaign.name,
          campaign.startsAt,
          campaign.endsAt,
          campaign.status,
          campaign.updatedAt,
          campaign.version,
          campaign.organisationId,
          campaign.id,
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
