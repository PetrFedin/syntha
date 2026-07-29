import { describe, expect, it } from "vitest";

import {
  EnvironmentCommercialOperationsAuthorizer,
  EnvironmentIntegrationSigningKeyProvider,
} from "../index";

const request = (token: string) =>
  new Request("https://example.test", {
    headers: { authorization: `Bearer ${token}` },
  });

describe("commercial execution environment security", () => {
  it("loads tenant-specific signing keys", async () => {
    const provider = new EnvironmentIntegrationSigningKeyProvider({
      SYNTHA_INTEGRATION_SIGNING_KEYS_JSON: JSON.stringify([
        {
          keyId: "current",
          organizationId: "ORG-A",
          integrationId: "erp",
          secret: "1234567890abcdef",
        },
        {
          keyId: "current",
          organizationId: "ORG-B",
          integrationId: "erp",
          secret: "abcdef1234567890",
        },
      ]),
    });

    const keys = await provider.load("erp", "ORG-A");

    expect(keys).toHaveLength(1);
    expect(keys[0]?.organizationId).toBe("ORG-A");
  });

  it("authorizes only the configured organization and permission", async () => {
    const token = "a-very-long-operations-token";
    const authorizer = new EnvironmentCommercialOperationsAuthorizer({
      SYNTHA_OPERATIONS_CREDENTIALS_JSON: JSON.stringify([
        {
          credentialId: "org-a-operator",
          token,
          organizations: ["ORG-A"],
          permissions: ["read", "operate"],
        },
      ]),
    });

    await expect(authorizer.authorize(request(token))).resolves.toBe(true);
    await expect(authorizer.identifyCredential(request(token))).resolves.toBe(
      "org-a-operator",
    );
    await expect(
      authorizer.authorizeAccess(request(token), {
        organizationId: "ORG-A",
        permission: "read",
      }),
    ).resolves.toBe(true);
    await expect(
      authorizer.authorizeAccess(request(token), {
        organizationId: "ORG-B",
        permission: "read",
      }),
    ).resolves.toBe(false);
    await expect(
      authorizer.authorizeAccess(request(token), {
        organizationId: "ORG-A",
        permission: "worker",
      }),
    ).resolves.toBe(false);
    await expect(authorizer.authorize(request("wrong"))).resolves.toBe(false);
    await expect(authorizer.identifyCredential(request("wrong"))).resolves.toBeNull();
  });
});
