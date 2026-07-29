export const lifecycleE2eOrganisationId = 'ORG-E2E';
export const lifecycleE2eCredentialId = 'lifecycle-e2e-operator';
export const lifecycleE2eToken = 'syntha-e2e-lifecycle-token-not-secret';

export const lifecycleE2eCredentialsJson = JSON.stringify([
  {
    credentialId: lifecycleE2eCredentialId,
    token: lifecycleE2eToken,
    organizations: [lifecycleE2eOrganisationId],
    permissions: ['read', 'operate'],
  },
]);

export const lifecycleE2eHeaders = Object.freeze({
  authorization: `Bearer ${lifecycleE2eToken}`,
  'x-syntha-organization-id': lifecycleE2eOrganisationId,
});
