import type { OrganisationId } from '@/modules/organisations';

import type { Season, SeasonId } from '../domain/season';

export type SeasonAuditAction = 'CREATED' | 'STATUS_CHANGED';

export interface SeasonAuditRecord {
  readonly id: string;
  readonly organisationId: OrganisationId;
  readonly seasonId: SeasonId;
  readonly action: SeasonAuditAction;
  readonly actorCredentialId: string;
  readonly expectedVersion: number | null;
  readonly resultingVersion: number;
  readonly occurredAt: string;
}

export interface SeasonRepository {
  findById(organisationId: OrganisationId, id: SeasonId): Promise<Season | null>;
  findByOrganisation(organisationId: OrganisationId): Promise<readonly Season[]>;
  findByCode(organisationId: OrganisationId, code: string): Promise<Season | null>;
  create(season: Season, audit: SeasonAuditRecord): Promise<void>;
  update(
    season: Season,
    expectedVersion: number,
    audit: SeasonAuditRecord,
  ): Promise<boolean>;
}
