import type { IntegrationResiliencePolicy } from "@/domain/execution/integration-resilience";

import type { IntegrationCommandTransport } from "./integration-command-dispatcher";
import {
  dispatchNextIntegrationCommand,
  type IntegrationDispatchResult,
} from "./integration-command-dispatcher";
import type { CommercialWorkflowRepository } from "./commercial-workflow-repository";

export interface IntegrationTransportRegistry {
  get(integrationId: string): IntegrationCommandTransport | null;
  integrationIds?(): readonly string[];
}

export interface IntegrationWorkerCycleResult {
  readonly workflowId: string;
  readonly workerId: string;
  readonly processedCommands: number;
  readonly results: readonly IntegrationDispatchResult[];
  readonly missingIntegrations: readonly string[];
  readonly exhausted: boolean;
}

export async function runIntegrationWorkerCycle(input: {
  readonly repository: CommercialWorkflowRepository;
  readonly transports: IntegrationTransportRegistry;
  readonly workflowId: string;
  readonly integrationIds: readonly string[];
  readonly workerId: string;
  readonly policy?: IntegrationResiliencePolicy;
  readonly now?: string;
  readonly maximumCommands?: number;
  readonly leaseSeconds?: number;
  readonly retryable?: (error: unknown) => boolean;
}): Promise<IntegrationWorkerCycleResult> {
  if (!input.workerId.trim()) throw new Error("Integration worker id is required.");
  const maximumCommands = Math.max(1, Math.floor(input.maximumCommands ?? 100));
  const integrationIds = [...new Set(input.integrationIds.filter(Boolean))];
  const active = new Set(integrationIds);
  const missingIntegrations: string[] = [];
  const results: IntegrationDispatchResult[] = [];

  for (const integrationId of integrationIds) {
    if (!input.transports.get(integrationId)) {
      missingIntegrations.push(integrationId);
      active.delete(integrationId);
    }
  }

  while (active.size > 0 && results.length < maximumCommands) {
    let madeProgress = false;
    for (const integrationId of [...active]) {
      if (results.length >= maximumCommands) break;
      const transport = input.transports.get(integrationId);
      if (!transport) {
        active.delete(integrationId);
        continue;
      }
      const result = await dispatchNextIntegrationCommand({
        repository: input.repository,
        transport,
        workflowId: input.workflowId,
        integrationId,
        workerId: input.workerId,
        policy: input.policy,
        now: input.now,
        leaseSeconds: input.leaseSeconds,
        retryable: input.retryable,
      });
      results.push(result);
      if (result.status === "succeeded" || result.status === "dead_letter") {
        madeProgress = true;
        continue;
      }
      active.delete(integrationId);
    }
    if (!madeProgress) break;
  }

  return Object.freeze({
    workflowId: input.workflowId,
    workerId: input.workerId,
    processedCommands: results.filter(
      (result) => result.status === "succeeded" || result.status === "dead_letter",
    ).length,
    results: Object.freeze(results),
    missingIntegrations: Object.freeze(missingIntegrations),
    exhausted: results.length >= maximumCommands && active.size > 0,
  });
}
