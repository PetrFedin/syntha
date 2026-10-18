import type { CommercialWorkflowRepository } from "./commercial-workflow-repository";
import type {
  IntegrationCallbackVerificationRequest,
  IntegrationCallbackVerificationResult,
  IntegrationCallbackVerifier,
} from "./integration-callback-verifier";
import {
  reconcileIntegrationCallback,
  type IntegrationCallback,
  type IntegrationCallbackResult,
} from "./reconcile-integration-callback";

export type VerifiedIntegrationCallbackResult =
  | {
      readonly status: "rejected";
      readonly verification: IntegrationCallbackVerificationResult;
    }
  | {
      readonly status: "reconciled";
      readonly verification: IntegrationCallbackVerificationResult;
      readonly reconciliation: IntegrationCallbackResult;
    };

export async function verifyAndReconcileIntegrationCallback(input: {
  readonly verifier: IntegrationCallbackVerifier;
  readonly verificationRequest: IntegrationCallbackVerificationRequest;
  readonly repository: CommercialWorkflowRepository;
  readonly workflowId: string;
  readonly callback: IntegrationCallback;
  readonly receivedAt?: string;
  readonly maximumSaveAttempts?: number;
}): Promise<VerifiedIntegrationCallbackResult> {
  if (
    input.verificationRequest.integrationId !== input.callback.integrationId
  ) {
    return Object.freeze({
      status: "rejected",
      verification: Object.freeze({
        verified: false,
        reason: "Verified integration id does not match the callback payload.",
      }),
    });
  }

  const verification = await input.verifier.verify(
    input.verificationRequest,
    input.receivedAt,
  );
  if (!verification.verified) {
    return Object.freeze({ status: "rejected", verification });
  }

  const reconciliation = await reconcileIntegrationCallback({
    repository: input.repository,
    workflowId: input.workflowId,
    callback: input.callback,
    receivedAt: input.receivedAt,
    maximumSaveAttempts: input.maximumSaveAttempts,
  });
  return Object.freeze({
    status: "reconciled",
    verification,
    reconciliation,
  });
}
