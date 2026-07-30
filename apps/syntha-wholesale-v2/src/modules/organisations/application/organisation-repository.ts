import type { Organisation, OrganisationId } from '../domain/organisation';

export interface OrganisationRepository {
  findById(id: OrganisationId): Promise<Organisation | null>;
  save(organisation: Organisation): Promise<void>;
}
