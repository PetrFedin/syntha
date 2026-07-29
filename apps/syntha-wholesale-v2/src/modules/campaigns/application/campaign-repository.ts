import type {
  LifecycleCreateCommand,
  LifecycleCreateResult,
} from '@/modules/lifecycle-idempotency';
import type { OrganisationId } from '@/modules/organisations';

import type { Campaign, CampaignId } from '../domain/campaign';

export type LifecycleEntityType = 'CAMPAIGN' | 'COLLECTION';
export type LifecycleAuditAction = 'CREATED' | 'UPDATED' | 'STATUS_CHANGED';

export interface LifecycleAuditRecord {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly entityType: LifecycleEntityType;
  readonly entityId: string;
  readonly action: LifecycleAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly resultingVersion: number;
  readonly occurredAt: string;
}

export interface CampaignRepository {
  findById(organisationId: OrganisationId, id: CampaignId): Promise<Campaign | null>;
  findByCode(organisationId: OrganisationId, code: string): Promise<Campaign | null>;
  list(organisationId: OrganisationId): Promise<readonly Campaign[]>;
  findCreateReplay(command: LifecycleCreateCommand): Promise<Campaign | null>;
  create(
    campaign: Campaign,
    audit: LifecycleAuditRecord,
    command: LifecycleCreateCommand,
  ): Promise<LifecycleCreateResult<Campaign>>;
  update(
    campaign: Campaign,
    expectedVersion: number,
    audit: LifecycleAuditRecord,
  ): Promise<boolean>;
}
