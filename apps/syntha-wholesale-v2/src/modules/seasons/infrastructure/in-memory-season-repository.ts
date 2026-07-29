import type { OrganisationId } from '@/modules/organisations';

import type {
  SeasonAuditRecord,
  SeasonRepository,
} from '../application/season-repository';
import type { Season, SeasonId } from '../domain/season';

function copySeason(season: Season): Season {
  return Object.freeze({ ...season });
}

export class InMemorySeasonRepository implements SeasonRepository {
  private readonly records = new Map<string, Season>();
  readonly audits: SeasonAuditRecord[] = [];

  constructor(initial: readonly Season[] = []) {
    for (const season of initial) {
      const key = this.key(season.organisationId, season.id);
      if (this.records.has(key)) throw new Error(`Duplicate season fixture: ${season.id}`);
      this.records.set(key, copySeason(season));
    }
  }

  private key(organisationId: OrganisationId, id: SeasonId): string {
    return `${organisationId}:${id}`;
  }

  async findById(
    organisationId: OrganisationId,
    id: SeasonId,
  ): Promise<Season | null> {
    const season = this.records.get(this.key(organisationId, id));
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

  async create(season: Season, audit: SeasonAuditRecord): Promise<void> {
    const key = this.key(season.organisationId, season.id);
    if (this.records.has(key)) throw new Error(`Duplicate season id: ${season.id}`);
    const duplicate = await this.findByCode(season.organisationId, season.code);
    if (duplicate) throw new Error(`Duplicate season code: ${season.code}`);
    this.records.set(key, copySeason(season));
    this.audits.push(Object.freeze({ ...audit }));
  }

  async update(
    season: Season,
    expectedVersion: number,
    audit: SeasonAuditRecord,
  ): Promise<boolean> {
    const key = this.key(season.organisationId, season.id);
    const current = this.records.get(key);
    if (!current || current.version !== expectedVersion) return false;
    const duplicate = [...this.records.values()].find(
      (candidate) =>
        candidate.id !== season.id &&
        candidate.organisationId === season.organisationId &&
        candidate.code === season.code,
    );
    if (duplicate) throw new Error(`Duplicate season code: ${season.code}`);
    this.records.set(key, copySeason(season));
    this.audits.push(Object.freeze({ ...audit }));
    return true;
  }
}
