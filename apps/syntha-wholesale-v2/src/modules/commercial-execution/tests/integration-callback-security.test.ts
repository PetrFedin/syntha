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
          organizationId: "ORG-A",
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
const rawBody = JSON.stringify({ organizationId: "ORG-A", ...callback });
const timestamp = "2026-07-29T00:05:01.000Z";

function verifier() {
  return new HmacIntegrationCallbackVerifier([
    {
      keyId: "key-current",
      organizationId: "ORG-A",
      integrationId: "erp",
      secret: "secret-current",
    },
  ]);
}

describe("integration callback security", () => {
  it("verifies a tenant-scoped signed callback before reconciliation", async () => {
    const repository = await repositoryWithCommand();
    const result = await verifyAndReconcileIntegrationCallback({
      verifier: verifier(),
      repository,
      workflowId: "WF-1",
      callback,
      receivedAt: timestamp,
      verificationRequest: {
        organizationId: "ORG-A",
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
    expect((await repository.findById("WF-1"))?.integrationInbox).toHaveLength(1);
  });

  it("rejects a valid signature when the key belongs to another tenant", async () => {
    const result = await verifier().verify(
      {
        organizationId: "ORG-B",
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
      "2026-07-29T00:05:02.000Z",
    );

    expect(result.verified).toBe(false);
    expect(result.reason).toContain("tenant signing key");
  });

  it("supports tenant key rotation and replay protection", async () => {
    const rotatedVerifier = new HmacIntegrationCallbackVerifier(
      [
        {
          keyId: "key-old",
          organizationId: "ORG-A",
          integrationId: "erp",
          secret: "secret-old",
          activeUntil: "2026-07-29T00:10:00.000Z",
        },
        {
          keyId: "key-new",
          organizationId: "ORG-A",
          integrationId: "erp",
          secret: "secret-new",
          activeFrom: "2026-07-29T00:04:00.000Z",
        },
      ],
      { toleranceSeconds: 300 },
    );
    const rotated = await rotatedVerifier.verify(
      {
        organizationId: "ORG-A",
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
    const stale = await rotatedVerifier.verify(
      {
        organizationId: "ORG-A",
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
    expect(stale.verified).toBe(false);
    expect(stale.reason).toContain("replay-protection");
  });
});
