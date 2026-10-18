import type { OrganisationId } from '@/modules/organisations';
import type { Season, SeasonId } from '../domain/season';

export interface SeasonRepository {
  findById(id: SeasonId): Promise<Season | null>;
  findByOrganisation(organisationId: OrganisationId): Promise<readonly Season[]>;
  findByCode(organisationId: OrganisationId, code: string): Promise<Season | null>;
  save(season: Season, expectedVersion?: number): Promise<void>;
}
