import {
  organisationId,
  registerOrganisation,
  type OrganisationRegistration,
  type RegisterOrganisationInput,
} from '../domain/organisation';
import type { OrganisationRepository } from './organisation-repository';

export class OrganisationAlreadyExists extends Error {
  constructor(id: string) {
    super(`Organisation already exists: ${id}`);
    this.name = 'OrganisationAlreadyExists';
  }
}

export async function registerOrganisationUseCase(
  input: RegisterOrganisationInput,
  repository: OrganisationRepository,
): Promise<OrganisationRegistration> {
  const id = organisationId(input.id);
  if (await repository.findById(id)) throw new OrganisationAlreadyExists(id);

  const registration = registerOrganisation(input);
  await repository.save(registration.organisation);
  return registration;
}
