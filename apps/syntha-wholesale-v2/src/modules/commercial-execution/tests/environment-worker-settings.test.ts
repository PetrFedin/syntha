import { describe, expect, it } from "vitest";

import { EnvironmentIntegrationWorkerSettingsProvider } from "../index";

describe("EnvironmentIntegrationWorkerSettingsProvider", () => {
  it("loads bounded server-only worker settings", async () => {
    const provider = new EnvironmentIntegrationWorkerSettingsProvider({
      SYNTHA_INTEGRATION_WORKER_ID: "worker-eu-1",
      SYNTHA_INTEGRATION_WORKER_MAX_COMMANDS: "75",
    });

    await expect(provider.load()).resolves.toEqual({
      workerId: "worker-eu-1",
      maximumCommands: 75,
    });
  });

  it("rejects unbounded worker batches", async () => {
    const provider = new EnvironmentIntegrationWorkerSettingsProvider({
      SYNTHA_INTEGRATION_WORKER_ID: "worker-eu-1",
      SYNTHA_INTEGRATION_WORKER_MAX_COMMANDS: "5000",
    });

    await expect(provider.load()).rejects.toThrow("1 to 1000");
  });
});
