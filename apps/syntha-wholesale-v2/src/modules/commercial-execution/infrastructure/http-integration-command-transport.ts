import type { IntegrationCommand } from "../domain/integration-command";
import type { IntegrationCommandTransport } from "../application/integration-command-dispatcher";

export interface HttpIntegrationTransportConfiguration {
  readonly integrationId: string;
  readonly endpoint: string;
  readonly bearerToken?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly timeoutMs?: number;
  readonly allowInsecureHttp?: boolean;
}

export class IntegrationTransportError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "IntegrationTransportError";
  }
}

export function isRetryableIntegrationTransportError(error: unknown): boolean {
  return error instanceof IntegrationTransportError && error.retryable;
}

function retryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function endpoint(value: string, allowInsecureHttp: boolean): string {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:" &&
    !(allowInsecureHttp && parsed.protocol === "http:")
  ) {
    throw new Error("Integration endpoint must use HTTPS.");
  }
  return parsed.toString();
}

function externalReference(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return undefined;
  }
  const record = payload as Record<string, unknown>;
  for (const key of ["externalReference", "reference", "id"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

export class HttpIntegrationCommandTransport
  implements IntegrationCommandTransport
{
  private readonly configuration: Required<
    Pick<HttpIntegrationTransportConfiguration, "integrationId" | "endpoint" | "timeoutMs">
  > &
    HttpIntegrationTransportConfiguration;

  constructor(
    configuration: HttpIntegrationTransportConfiguration,
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (!configuration.integrationId.trim()) {
      throw new Error("HTTP integration id is required.");
    }
    this.configuration = Object.freeze({
      ...configuration,
      endpoint: endpoint(
        configuration.endpoint,
        configuration.allowInsecureHttp ?? false,
      ),
      timeoutMs: Math.max(100, Math.floor(configuration.timeoutMs ?? 10_000)),
    });
  }

  async execute(command: IntegrationCommand): Promise<{
    readonly externalReference?: string;
  }> {
    if (command.integrationId !== this.configuration.integrationId) {
      throw new IntegrationTransportError(
        "Command integration does not match the configured transport.",
        null,
        false,
      );
    }
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.configuration.timeoutMs,
    );
    try {
      const response = await this.fetcher(this.configuration.endpoint, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "idempotency-key": command.idempotencyKey,
          "x-syntha-command-id": command.id,
          ...(this.configuration.bearerToken
            ? { authorization: `Bearer ${this.configuration.bearerToken}` }
            : {}),
          ...(this.configuration.headers ?? {}),
        },
        body: JSON.stringify({
          commandId: command.id,
          workflowId: command.workflowId,
          actionType: command.actionType,
          payload: command.payload,
        }),
      });
      const raw = await response.text();
      let payload: unknown;
      try {
        payload = raw ? JSON.parse(raw) : undefined;
      } catch {
        payload = undefined;
      }
      if (!response.ok) {
        throw new IntegrationTransportError(
          `Integration ${command.integrationId} returned HTTP ${response.status}.`,
          response.status,
          retryableStatus(response.status),
        );
      }
      return Object.freeze({ externalReference: externalReference(payload) });
    } catch (error) {
      if (error instanceof IntegrationTransportError) throw error;
      const aborted = error instanceof Error && error.name === "AbortError";
      throw new IntegrationTransportError(
        aborted
          ? `Integration ${command.integrationId} timed out.`
          : `Integration ${command.integrationId} request failed.`,
        null,
        true,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
