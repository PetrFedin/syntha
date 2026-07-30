import type { OrganisationRepository } from '../application/organisation-repository';
import type { Organisation, OrganisationId } from '../domain/organisation';

export class InMemoryOrganisationRepository implements OrganisationRepository {
  private readonly records = new Map<OrganisationId, Organisation>();

  constructor(initial: readonly Organisation[] = []) {
    for (const organisation of initial) {
      if (this.records.has(organisation.id)) {
        throw new Error(`Duplicate organisation fixture: ${organisation.id}`);
      }
      this.records.set(organisation.id, organisation);
    }
  }

  async findById(id: OrganisationId): Promise<Organisation | null> {
    return this.records.get(id) ?? null;
  }

  async save(organisation: Organisation): Promise<void> {
    this.records.set(organisation.id, organisation);
  }
}
