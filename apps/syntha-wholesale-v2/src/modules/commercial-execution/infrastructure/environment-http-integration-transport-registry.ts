import type { IntegrationCommandTransport } from "../application/integration-command-dispatcher";
import type { IntegrationTransportRegistry } from "../application/run-integration-worker-cycle";
import {
  HttpIntegrationCommandTransport,
  type HttpIntegrationTransportConfiguration,
} from "./http-integration-command-transport";

function configurations(raw: string): readonly HttpIntegrationTransportConfiguration[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("SYNTHA_INTEGRATION_TRANSPORTS_JSON must contain a JSON array.");
  }
  const seen = new Set<string>();
  return Object.freeze(
    parsed.map((value, index) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`Transport at index ${index} must be an object.`);
      }
      const candidate = value as Record<string, unknown>;
      if (typeof candidate.integrationId !== "string" || !candidate.integrationId.trim()) {
        throw new Error(`Transport at index ${index} requires integrationId.`);
      }
      if (typeof candidate.endpoint !== "string" || !candidate.endpoint.trim()) {
        throw new Error(`Transport at index ${index} requires endpoint.`);
      }
      if (seen.has(candidate.integrationId)) {
        throw new Error(`Duplicate integration transport: ${candidate.integrationId}.`);
      }
      seen.add(candidate.integrationId);
      const headers = candidate.headers;
      if (
        headers !== undefined &&
        (!headers || typeof headers !== "object" || Array.isArray(headers))
      ) {
        throw new Error(`Transport headers at index ${index} must be an object.`);
      }
      return Object.freeze({
        integrationId: candidate.integrationId,
        endpoint: candidate.endpoint,
        bearerToken:
          typeof candidate.bearerToken === "string" ? candidate.bearerToken : undefined,
        headers: headers as Readonly<Record<string, string>> | undefined,
        timeoutMs:
          candidate.timeoutMs === undefined ? undefined : Number(candidate.timeoutMs),
        allowInsecureHttp: candidate.allowInsecureHttp === true,
      });
    }),
  );
}

export class EnvironmentHttpIntegrationTransportRegistry
  implements IntegrationTransportRegistry
{
  private readonly transports: ReadonlyMap<string, IntegrationCommandTransport>;

  constructor(
    environment: Readonly<Record<string, string | undefined>> = process.env,
    fetcher: typeof fetch = fetch,
  ) {
    const raw = environment.SYNTHA_INTEGRATION_TRANSPORTS_JSON;
    if (!raw?.trim()) {
      throw new Error("SYNTHA_INTEGRATION_TRANSPORTS_JSON is not configured.");
    }
    this.transports = new Map(
      configurations(raw).map((configuration) => [
        configuration.integrationId,
        new HttpIntegrationCommandTransport(configuration, fetcher),
      ]),
    );
  }

  get(integrationId: string): IntegrationCommandTransport | null {
    return this.transports.get(integrationId) ?? null;
  }

  integrationIds(): readonly string[] {
    return Object.freeze([...this.transports.keys()].sort());
  }
}
