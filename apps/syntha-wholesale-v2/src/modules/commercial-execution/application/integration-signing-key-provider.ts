import type { IntegrationSigningKey } from "../infrastructure/hmac-integration-callback-verifier";

export interface IntegrationSigningKeyProvider {
  load(
    integrationId?: string,
    organizationId?: string,
  ): Promise<readonly IntegrationSigningKey[]>;
}
