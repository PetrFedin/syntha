import { describe, expect, it } from "vitest";

import { parseIntegrationCallbackRequest } from "../index";

describe("parseIntegrationCallbackRequest", () => {
  it("builds verification and reconciliation inputs from raw HTTP data", () => {
    const rawBody = JSON.stringify({
      integrationId: "erp",
      externalEventId: "EVENT-1",
      outcome: "succeeded",
      occurredAt: "2026-07-29T00:00:00.000Z",
      commandId: "CMD-1",
      payload: { purchaseOrderId: "PO-1" },
    });

    const parsed = parseIntegrationCallbackRequest({
      integrationId: "erp",
      rawBody,
      signature: "sha256=abc",
      timestamp: "2026-07-29T00:00:01.000Z",
      keyId: "current",
    });

    expect(parsed.callback.commandId).toBe("CMD-1");
    expect(parsed.callback.payload).toEqual({ purchaseOrderId: "PO-1" });
    expect(parsed.verificationRequest.rawBody).toBe(rawBody);
  });

  it("rejects an integration id mismatch before verification", () => {
    expect(() =>
      parseIntegrationCallbackRequest({
        integrationId: "erp",
        rawBody: JSON.stringify({
          integrationId: "oms",
          externalEventId: "EVENT-1",
          outcome: "succeeded",
          occurredAt: "2026-07-29T00:00:00.000Z",
        }),
        signature: "sha256=abc",
        timestamp: "2026-07-29T00:00:01.000Z",
      }),
    ).toThrow("does not match");
  });
});
