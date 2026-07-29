export interface IntegrationCallbackVerificationRequest {
  readonly integrationId: string;
  readonly timestamp: string;
  readonly signature: string;
  readonly rawBody: string;
  readonly keyId?: string;
}

export interface IntegrationCallbackVerificationResult {
  readonly verified: boolean;
  readonly reason: string;
  readonly keyId?: string;
}

export interface IntegrationCallbackVerifier {
  verify(
    request: IntegrationCallbackVerificationRequest,
    now?: string,
  ): Promise<IntegrationCallbackVerificationResult>;
}
