import { describe, expect, it } from 'vitest';

import {
  InMemoryOrganisationRepository,
  OrganisationAlreadyExists,
  organisationId,
  registerOrganisationUseCase,
} from '../index';

describe('organisation persistence boundary', () => {
  it('registers and retrieves an organisation through the repository port', async () => {
    const repository = new InMemoryOrganisationRepository();

    await registerOrganisationUseCase({
      id: 'brand-acme',
      type: 'BRAND',
      displayName: 'ACME',
      now: new Date('2026-07-22T13:00:00.000Z'),
    }, repository);

    await expect(repository.findById(organisationId('brand-acme'))).resolves.toMatchObject({
      displayName: 'ACME',
      status: 'ACTIVE',
    });
  });

  it('prevents duplicate organisation identities', async () => {
    const repository = new InMemoryOrganisationRepository();
    const command = {
      id: 'shop-one',
      type: 'SHOP' as const,
      displayName: 'Shop One',
    };

    await registerOrganisationUseCase(command, repository);
    await expect(registerOrganisationUseCase(command, repository)).rejects.toThrow(
      OrganisationAlreadyExists,
    );
  });
});
