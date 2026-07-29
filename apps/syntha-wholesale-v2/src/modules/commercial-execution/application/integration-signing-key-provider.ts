import type { IntegrationSigningKey } from "../infrastructure/hmac-integration-callback-verifier";

export interface IntegrationSigningKeyProvider {
  load(integrationId?: string): Promise<readonly IntegrationSigningKey[]>;
}
