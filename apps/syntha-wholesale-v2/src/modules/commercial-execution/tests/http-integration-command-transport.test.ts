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
    organizationId: "ORG-A",
    integrationId: "erp",
    action,
    idempotencyKey: "org:ORG-A:IDEMP-1",
    createdAt: "2026-07-29T00:00:00.000Z",
  });
}

describe("HttpIntegrationCommandTransport", () => {
  it("sends an idempotent tenant-scoped command", async () => {
    const fetcher = vi.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ externalReference: "ERP-100" }), {
        status: 200,
      }),
    );
    const transport = new HttpIntegrationCommandTransport(
      { integrationId: "erp", endpoint: "https://erp.example.test/orders" },
      fetcher,
    );

    const result = await transport.execute(command());
    const options = fetcher.mock.calls[0]?.[1];

    expect(result.externalReference).toBe("ERP-100");
    expect(options?.headers).toMatchObject({
      "idempotency-key": "org:ORG-A:IDEMP-1",
      "x-syntha-organization-id": "ORG-A",
    });
    expect(JSON.parse(String(options?.body))).toMatchObject({
      organizationId: "ORG-A",
    });
  });

  it("marks server failures as retryable", async () => {
    const transport = new HttpIntegrationCommandTransport(
      { integrationId: "erp", endpoint: "https://erp.example.test/orders" },
      (async () => new Response("unavailable", { status: 503 })) as typeof fetch,
    );

    const rejection = expect(transport.execute(command())).rejects;
    await rejection.toMatchObject({ retryable: true, status: 503 });
    await rejection.toBeInstanceOf(IntegrationTransportError);
  });
});
