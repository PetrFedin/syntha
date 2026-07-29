import type { CampaignId, LifecycleAuditRecord } from '@/modules/campaigns';
import type { OrganisationId } from '@/modules/organisations';

import type { Collection, CollectionId } from '../domain/collection';

export interface CollectionRepository {
  findById(organisationId: OrganisationId, id: CollectionId): Promise<Collection | null>;
  findByCode(
    organisationId: OrganisationId,
    campaignId: CampaignId,
    code: string,
  ): Promise<Collection | null>;
  listByCampaign(
    organisationId: OrganisationId,
    campaignId: CampaignId,
  ): Promise<readonly Collection[]>;
  create(collection: Collection, audit: LifecycleAuditRecord): Promise<void>;
  update(
    collection: Collection,
    expectedVersion: number,
    audit: LifecycleAuditRecord,
  ): Promise<boolean>;
}
