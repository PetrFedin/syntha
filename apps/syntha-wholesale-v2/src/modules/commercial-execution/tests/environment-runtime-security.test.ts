import { describe, expect, it } from "vitest";

import {
  EnvironmentCommercialOperationsAuthorizer,
  EnvironmentIntegrationSigningKeyProvider,
} from "../index";

describe("commercial execution environment security", () => {
  it("loads and filters validated signing keys", async () => {
    const provider = new EnvironmentIntegrationSigningKeyProvider({
      SYNTHA_INTEGRATION_SIGNING_KEYS_JSON: JSON.stringify([
        {
          keyId: "current",
          integrationId: "erp",
          secret: "1234567890abcdef",
          activeFrom: "2026-07-01T00:00:00.000Z",
        },
        {
          keyId: "oms-current",
          integrationId: "oms",
          secret: "abcdef1234567890",
        },
      ]),
    });

    const keys = await provider.load("erp");

    expect(keys).toHaveLength(1);
    expect(keys[0]?.keyId).toBe("current");
  });

  it("requires a constant-time bearer token authorizer", async () => {
    const authorizer = new EnvironmentCommercialOperationsAuthorizer({
      SYNTHA_OPERATIONS_API_TOKEN: "a-very-long-operations-token",
    });

    await expect(
      authorizer.authorize(
        new Request("https://example.test", {
          headers: { authorization: "Bearer a-very-long-operations-token" },
        }),
      ),
    ).resolves.toBe(true);
    await expect(
      authorizer.authorize(
        new Request("https://example.test", {
          headers: { authorization: "Bearer wrong" },
        }),
      ),
    ).resolves.toBe(false);
  });
});
