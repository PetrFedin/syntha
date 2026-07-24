import type { OrganisationId } from '@/modules/organisations';
import type { SeasonRepository } from '../application/season-repository';
import { SeasonVersionConflict } from '../application/season-workflows';
import type { Season, SeasonId } from '../domain/season';

function copySeason(season: Season): Season {
  return Object.freeze({ ...season });
}

export class InMemorySeasonRepository implements SeasonRepository {
  private readonly records = new Map<SeasonId, Season>();

  constructor(initial: readonly Season[] = []) {
    for (const season of initial) {
      if (this.records.has(season.id)) throw new Error(`Duplicate season fixture: ${season.id}`);
      this.records.set(season.id, copySeason(season));
    }
  }

  async findById(id: SeasonId): Promise<Season | null> {
    const season = this.records.get(id);
    return season ? copySeason(season) : null;
  }

  async findByOrganisation(organisationId: OrganisationId): Promise<readonly Season[]> {
    return [...this.records.values()]
      .filter((season) => season.organisationId === organisationId)
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
      .map(copySeason);
  }

  async findByCode(organisationId: OrganisationId, code: string): Promise<Season | null> {
    const normalized = code.trim().toUpperCase();
    const season = [...this.records.values()].find(
      (candidate) => candidate.organisationId === organisationId && candidate.code === normalized,
    );
    return season ? copySeason(season) : null;
  }

  async save(season: Season, expectedVersion?: number): Promise<void> {
    const current = this.records.get(season.id);
    if (expectedVersion !== undefined && current?.version !== expectedVersion) {
      throw new SeasonVersionConflict(season.id);
    }
    const duplicate = [...this.records.values()].find(
      (candidate) => candidate.id !== season.id
        && candidate.organisationId === season.organisationId
        && candidate.code === season.code,
    );
    if (duplicate) throw new Error(`Duplicate season code: ${season.code}`);
    this.records.set(season.id, copySeason(season));
  }
}
