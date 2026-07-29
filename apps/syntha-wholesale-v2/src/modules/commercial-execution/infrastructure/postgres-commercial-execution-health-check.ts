import type {
  CommercialExecutionHealthCheck,
  CommercialExecutionHealthComponent,
  CommercialExecutionHealthReport,
} from "../application/commercial-execution-health-check";
import type { IntegrationSigningKeyProvider } from "../application/integration-signing-key-provider";
import type { IntegrationTransportRegistry } from "../application/run-integration-worker-cycle";
import type { TransactionalSqlPool } from "./postgres-commercial-execution-unit-of-work";

function component(
  status: CommercialExecutionHealthComponent["status"],
  message: string,
  metadata?: Readonly<Record<string, string | number | boolean>>,
): CommercialExecutionHealthComponent {
  return Object.freeze({ status, message, metadata });
}

export class PostgresCommercialExecutionHealthCheck
  implements CommercialExecutionHealthCheck
{
  constructor(
    private readonly pool: TransactionalSqlPool,
    private readonly transports: IntegrationTransportRegistry,
    private readonly signingKeys: IntegrationSigningKeyProvider,
  ) {}

  async check(
    checkedAt: string = new Date().toISOString(),
  ): Promise<CommercialExecutionHealthReport> {
    const normalizedCheckedAt = new Date(checkedAt).toISOString();
    let database: CommercialExecutionHealthComponent;
    try {
      await this.pool.query("SELECT 1");
      database = component("up", "PostgreSQL is reachable.");
    } catch {
      database = component("down", "PostgreSQL is not reachable.");
    }

    const transportIds = this.transports.integrationIds?.() ?? [];
    const transports =
      transportIds.length > 0
        ? component("up", "Integration transports are configured.", {
            configured: transportIds.length,
          })
        : component("warning", "No integration transports are configured.", {
            configured: 0,
          });

    let signingKeys: CommercialExecutionHealthComponent;
    try {
      const keys = await this.signingKeys.load();
      signingKeys =
        keys.length > 0
          ? component("up", "Integration signing keys are configured.", {
              configured: keys.length,
            })
          : component("warning", "No integration signing keys are configured.", {
              configured: 0,
            });
    } catch {
      signingKeys = component(
        "warning",
        "Integration signing keys could not be loaded.",
      );
    }

    const status: CommercialExecutionHealthReport["status"] =
      database.status === "down"
        ? "not_ready"
        : transports.status === "warning" || signingKeys.status === "warning"
          ? "degraded"
          : "ready";
    return Object.freeze({
      status,
      checkedAt: normalizedCheckedAt,
      components: Object.freeze({ database, transports, signingKeys }),
    });
  }
}
