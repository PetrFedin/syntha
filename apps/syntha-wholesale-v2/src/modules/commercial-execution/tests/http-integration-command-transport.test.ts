import { describe, expect, it, vi } from "vitest";

import type { RecommendedAction } from "@/domain/decision/decision";
import {
  createIntegrationCommand,
  HttpIntegrationCommandTransport,
  IntegrationTransportError,
} from "../index";

const action: RecommendedAction = {
  type: "create_purchase_order",
  priority: "medium",
  title: "Create PO",
  description: "Create order",
};

function command() {
  return createIntegrationCommand({
    id: "CMD-1",
    workflowId: "WF-1",
    integrationId: "erp",
    action,
    idempotencyKey: "IDEMP-1",
    createdAt: "2026-07-29T00:00:00.000Z",
  });
}

describe("HttpIntegrationCommandTransport", () => {
  it("sends an idempotent command and returns the external reference", async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ externalReference: "ERP-100" }), {
        status: 200,
      }),
    );
    const transport = new HttpIntegrationCommandTransport(
      { integrationId: "erp", endpoint: "https://erp.example.test/orders" },
      fetcher as typeof fetch,
    );

    const result = await transport.execute(command());

    expect(result.externalReference).toBe("ERP-100");
    expect(fetcher.mock.calls[0]?.[1]?.headers).toMatchObject({
      "idempotency-key": "IDEMP-1",
    });
  });

  it("marks server failures as retryable", async () => {
    const transport = new HttpIntegrationCommandTransport(
      { integrationId: "erp", endpoint: "https://erp.example.test/orders" },
      (async () => new Response("unavailable", { status: 503 })) as typeof fetch,
    );

    await expect(transport.execute(command())).rejects.toMatchObject<
      Partial<IntegrationTransportError>
    >({ retryable: true, status: 503 });
  });
});
