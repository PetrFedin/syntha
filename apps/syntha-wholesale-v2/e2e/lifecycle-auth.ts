export const lifecycleE2eOrganisationId = 'ORG-E2E';
export const selectionE2eBuyerOrganisationId = 'ORG-E2E-BUYER';
export const lifecycleE2eCredentialId = 'lifecycle-e2e-operator';
export const lifecycleE2eToken = 'syntha-e2e-lifecycle-token-not-secret';

export const lifecycleE2eCredentialsJson = JSON.stringify([
  {
    credentialId: lifecycleE2eCredentialId,
    token: lifecycleE2eToken,
    organizations: [lifecycleE2eOrganisationId, selectionE2eBuyerOrganisationId],
    permissions: ['read', 'operate'],
  },
]);

export const lifecycleE2eHeaders = Object.freeze({
  authorization: `Bearer ${lifecycleE2eToken}`,
  'x-syntha-organization-id': lifecycleE2eOrganisationId,
});

export const selectionE2eBuyerHeaders = Object.freeze({
  authorization: `Bearer ${lifecycleE2eToken}`,
  'x-syntha-organization-id': selectionE2eBuyerOrganisationId,
});
