import type { OrganisationId } from '../../organisations';
import type { Membership, MembershipId } from '../domain/membership';

export interface MembershipRepository {
  findById(id: MembershipId): Promise<Membership | null>;
  findByUserAndOrganisation(
    userId: string,
    organisationId: OrganisationId,
  ): Promise<Membership | null>;
  save(membership: Membership): Promise<void>;
}
