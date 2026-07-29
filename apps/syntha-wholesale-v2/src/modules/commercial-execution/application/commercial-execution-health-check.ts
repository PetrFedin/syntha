export type CommercialExecutionHealthStatus =
  | "ready"
  | "degraded"
  | "not_ready";

export interface CommercialExecutionHealthComponent {
  readonly status: "up" | "warning" | "down";
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}

export interface CommercialExecutionHealthReport {
  readonly status: CommercialExecutionHealthStatus;
  readonly checkedAt: string;
  readonly components: Readonly<{
    database: CommercialExecutionHealthComponent;
    transports: CommercialExecutionHealthComponent;
    signingKeys: CommercialExecutionHealthComponent;
  }>;
}

export interface CommercialExecutionHealthCheck {
  check(checkedAt?: string): Promise<CommercialExecutionHealthReport>;
}
