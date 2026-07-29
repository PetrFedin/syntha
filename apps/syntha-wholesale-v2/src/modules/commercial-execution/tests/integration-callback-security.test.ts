import { describe, expect, it } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";

import {
  createCommercialWorkflowState,
  createHmacIntegrationSignature,
  createIntegrationCommand,
  HmacIntegrationCallbackVerifier,
  InMemoryCommercialWorkflowRepository,
  verifyAndReconcileIntegrationCallback,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create purchase order in ERP.",
};

async function repositoryWithCommand() {
  const repository = new InMemoryCommercialWorkflowRepository();
  const state = createCommercialWorkflowState({
    id: "WF-1",
    createdAt: "2026-07-29T00:00:00.000Z",
  });
  await repository.save(
    Object.freeze({
      ...state,
      integrationCommands: Object.freeze([
        createIntegrationCommand({
          id: "CMD-1",
          workflowId: "WF-1",
          integrationId: "erp",
          action,
          idempotencyKey: "IDEMP-1",
          createdAt: "2026-07-29T00:00:00.000Z",
        }),
      ]),
    }),
    0,
  );
  return repository;
}

const callback = {
  externalEventId: "ERP-EVENT-1",
  integrationId: "erp",
  outcome: "succeeded" as const,
  occurredAt: "2026-07-29T00:05:00.000Z",
  commandId: "CMD-1",
  externalReference: "ERP-PO-100",
};
const rawBody = JSON.stringify(callback);
const timestamp = "2026-07-29T00:05:01.000Z";

describe("integration callback security", () => {
  it("verifies a signed callback before reconciliation", async () => {
    const repository = await repositoryWithCommand();
    const verifier = new HmacIntegrationCallbackVerifier([
      { keyId: "key-current", integrationId: "erp", secret: "secret-current" },
    ]);
    const result = await verifyAndReconcileIntegrationCallback({
      verifier,
      repository,
      workflowId: "WF-1",
      callback,
      receivedAt: timestamp,
      verificationRequest: {
        integrationId: "erp",
        keyId: "key-current",
        timestamp,
        rawBody,
        signature: createHmacIntegrationSignature({
          secret: "secret-current",
          timestamp,
          rawBody,
        }),
      },
    });

    expect(result.status).toBe("reconciled");
    const state = await repository.findById("WF-1");
    expect(state?.integrationInbox).toHaveLength(1);
  });

  it("rejects an invalid signature without mutating workflow state", async () => {
    const repository = await repositoryWithCommand();
    const verifier = new HmacIntegrationCallbackVerifier([
      { keyId: "key-current", integrationId: "erp", secret: "secret-current" },
    ]);
    const result = await verifyAndReconcileIntegrationCallback({
      verifier,
      repository,
      workflowId: "WF-1",
      callback,
      receivedAt: timestamp,
      verificationRequest: {
        integrationId: "erp",
        keyId: "key-current",
        timestamp,
        rawBody,
        signature: `sha256=${"0".repeat(64)}`,
      },
    });

    expect(result.status).toBe("rejected");
    const state = await repository.findById("WF-1");
    expect(state?.integrationInbox).toHaveLength(0);
  });

  it("supports signing-key rotation and rejects stale callbacks", async () => {
    const verifier = new HmacIntegrationCallbackVerifier(
      [
        {
          keyId: "key-old",
          integrationId: "erp",
          secret: "secret-old",
          activeUntil: "2026-07-29T00:10:00.000Z",
        },
        {
          keyId: "key-new",
          integrationId: "erp",
          secret: "secret-new",
          activeFrom: "2026-07-29T00:04:00.000Z",
        },
      ],
      { toleranceSeconds: 300 },
    );
    const rotated = await verifier.verify(
      {
        integrationId: "erp",
        keyId: "key-old",
        timestamp,
        rawBody,
        signature: createHmacIntegrationSignature({
          secret: "secret-old",
          timestamp,
          rawBody,
        }),
      },
      "2026-07-29T00:05:02.000Z",
    );
    const stale = await verifier.verify(
      {
        integrationId: "erp",
        keyId: "key-new",
        timestamp,
        rawBody,
        signature: createHmacIntegrationSignature({
          secret: "secret-new",
          timestamp,
          rawBody,
        }),
      },
      "2026-07-29T00:20:00.000Z",
    );

    expect(rotated.verified).toBe(true);
    expect(rotated.keyId).toBe("key-old");
    expect(stale.verified).toBe(false);
    expect(stale.reason).toContain("replay-protection");
  });
});
