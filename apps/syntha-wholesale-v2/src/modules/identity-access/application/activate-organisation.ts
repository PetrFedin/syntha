import type { OrganisationRepository } from '../../organisations';
import { OrganisationUnavailable } from './errors';
import type { MembershipRepository } from './membership-repository';
import {
  switchActiveOrganisation,
  type SwitchActiveOrganisationCommand,
  type SwitchActiveOrganisationResult,
} from './switch-active-organisation';

export async function activateOrganisation(
  command: SwitchActiveOrganisationCommand,
  dependencies: {
    readonly organisations: OrganisationRepository;
    readonly memberships: MembershipRepository;
  },
): Promise<SwitchActiveOrganisationResult> {
  const organisation = await dependencies.organisations.findById(
    command.targetOrganisationId,
  );
  if (!organisation) {
    throw new OrganisationUnavailable('Requested organisation does not exist');
  }
  if (organisation.status !== 'ACTIVE') {
    throw new OrganisationUnavailable('Suspended organisation cannot be activated');
  }

  const membership = await dependencies.memberships.findByUserAndOrganisation(
    command.userId,
    command.targetOrganisationId,
  );
  return switchActiveOrganisation(command, membership);
}
