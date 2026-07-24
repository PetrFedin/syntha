import type { OrganisationId } from '../../organisations';
import type { MembershipRepository } from '../application/membership-repository';
import type { Membership, MembershipId } from '../domain/membership';

export class MembershipRepositoryConflict extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MembershipRepositoryConflict';
  }
}

export class InMemoryMembershipRepository implements MembershipRepository {
  private readonly records = new Map<MembershipId, Membership>();

  constructor(initial: readonly Membership[] = []) {
    for (const membership of initial) this.storeWithoutConflict(membership);
  }

  async findById(id: MembershipId): Promise<Membership | null> {
    return this.records.get(id) ?? null;
  }

  async findByUserAndOrganisation(
    userId: string,
    organisationId: OrganisationId,
  ): Promise<Membership | null> {
    return [...this.records.values()].find((membership) =>
      membership.userId === userId && membership.organisationId === organisationId,
    ) ?? null;
  }

  async save(membership: Membership): Promise<void> {
    const duplicate = [...this.records.values()].find((candidate) =>
      candidate.id !== membership.id
      && candidate.userId === membership.userId
      && candidate.organisationId === membership.organisationId,
    );
    if (duplicate) {
      throw new MembershipRepositoryConflict(
        `Membership already exists for user ${membership.userId} in organisation ${membership.organisationId}`,
      );
    }
    this.records.set(membership.id, membership);
  }

  private storeWithoutConflict(membership: Membership): void {
    if (this.records.has(membership.id)) {
      throw new MembershipRepositoryConflict(`Duplicate membership fixture: ${membership.id}`);
    }
    const duplicate = [...this.records.values()].some((candidate) =>
      candidate.userId === membership.userId
      && candidate.organisationId === membership.organisationId,
    );
    if (duplicate) {
      throw new MembershipRepositoryConflict(
        `Duplicate user/organisation membership fixture: ${membership.userId}/${membership.organisationId}`,
      );
    }
    this.records.set(membership.id, membership);
  }
}
