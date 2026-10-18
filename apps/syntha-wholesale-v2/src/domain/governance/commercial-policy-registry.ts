import { createStableFingerprint } from "@/domain/execution/stable-fingerprint";

export type CommercialPolicyKind =
  | "data_quality"
  | "forecast"
  | "inventory_health"
  | "replenishment"
  | "purchase"
  | "supplier_selection"
  | "otb_allocation"
  | "execution"
  | "approval";

export type CommercialPolicyStatus = "draft" | "active" | "retired";

export interface CommercialPolicyVersion {
  readonly id: string;
  readonly kind: CommercialPolicyKind;
  readonly version: number;
  readonly status: CommercialPolicyStatus;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly config: Readonly<Record<string, unknown>>;
  readonly configFingerprint: string;
  readonly createdAt: string;
  readonly activatedAt?: string;
  readonly retiredAt?: string;
}

export interface CommercialPolicyRegistry {
  readonly policies: readonly CommercialPolicyVersion[];
}

function parseDate(value: string, field: string): Date {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${field} must be a valid ISO date string.`);
  }
  return new Date(timestamp);
}

function cloneReadonly(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneReadonly(item)));
  }
  const record = value as Record<string, unknown>;
  return Object.freeze(
    Object.fromEntries(
      Object.keys(record)
        .sort()
        .filter((key) => record[key] !== undefined)
        .map((key) => [key, cloneReadonly(record[key])]),
    ),
  );
}

function validatePolicy(policy: CommercialPolicyVersion): void {
  if (!policy.id.trim()) throw new Error("Commercial policy id is required.");
  if (!Number.isInteger(policy.version) || policy.version <= 0) {
    throw new Error("Commercial policy version must be a positive integer.");
  }
  const effectiveFrom = parseDate(policy.effectiveFrom, "Policy effective-from");
  if (policy.effectiveTo) {
    const effectiveTo = parseDate(policy.effectiveTo, "Policy effective-to");
    if (effectiveTo <= effectiveFrom) {
      throw new Error("Policy effective-to must be after effective-from.");
    }
  }
  parseDate(policy.createdAt, "Policy creation time");
  if (policy.configFingerprint !== createStableFingerprint(policy.config)) {
    throw new Error(`Policy config fingerprint mismatch: ${policy.id}`);
  }
}

export function createCommercialPolicyRegistry(
  policies: readonly CommercialPolicyVersion[] = [],
): CommercialPolicyRegistry {
  const ids = new Set<string>();
  const versions = new Set<string>();
  for (const policy of policies) {
    validatePolicy(policy);
    if (ids.has(policy.id)) throw new Error(`Duplicate policy id: ${policy.id}`);
    const versionKey = `${policy.kind}:${policy.version}`;
    if (versions.has(versionKey)) {
      throw new Error(`Duplicate policy version: ${versionKey}`);
    }
    ids.add(policy.id);
    versions.add(versionKey);
  }
  return Object.freeze({ policies: Object.freeze([...policies]) });
}

export function registerCommercialPolicy(input: {
  readonly registry: CommercialPolicyRegistry;
  readonly kind: CommercialPolicyKind;
  readonly config: Readonly<Record<string, unknown>>;
  readonly id?: string;
  readonly version?: number;
  readonly effectiveFrom?: string;
  readonly createdAt?: string;
}): { readonly registry: CommercialPolicyRegistry; readonly policy: CommercialPolicyVersion } {
  const createdAt = parseDate(
    input.createdAt ?? new Date().toISOString(),
    "Policy creation time",
  ).toISOString();
  const currentMaximum = input.registry.policies
    .filter((policy) => policy.kind === input.kind)
    .reduce((maximum, policy) => Math.max(maximum, policy.version), 0);
  const version = input.version ?? currentMaximum + 1;
  if (!Number.isInteger(version) || version <= 0) {
    throw new Error("Commercial policy version must be a positive integer.");
  }
  const id = input.id ?? `${input.kind}:v${version}`;
  const config = cloneReadonly(input.config) as Readonly<Record<string, unknown>>;
  const policy: CommercialPolicyVersion = Object.freeze({
    id,
    kind: input.kind,
    version,
    status: "draft",
    effectiveFrom: parseDate(
      input.effectiveFrom ?? createdAt,
      "Policy effective-from",
    ).toISOString(),
    config,
    configFingerprint: createStableFingerprint(config),
    createdAt,
  });
  return Object.freeze({
    policy,
    registry: createCommercialPolicyRegistry([
      ...input.registry.policies,
      policy,
    ]),
  });
}

export function activateCommercialPolicy(input: {
  readonly registry: CommercialPolicyRegistry;
  readonly policyId: string;
  readonly activatedAt?: string;
}): CommercialPolicyRegistry {
  const target = input.registry.policies.find(
    (policy) => policy.id === input.policyId,
  );
  if (!target) throw new Error("Commercial policy was not found.");
  if (target.status === "retired") {
    throw new Error("A retired commercial policy cannot be activated.");
  }
  if (target.status === "active") return input.registry;
  const activatedAt = parseDate(
    input.activatedAt ?? new Date().toISOString(),
    "Policy activation time",
  ).toISOString();
  const targetStart = parseDate(target.effectiveFrom, "Policy effective-from");

  const policies = input.registry.policies.map((policy) => {
    if (policy.id === target.id) {
      return Object.freeze({
        ...policy,
        status: "active" as const,
        activatedAt,
      });
    }
    if (policy.kind !== target.kind || policy.status !== "active") return policy;
    const activeStart = parseDate(policy.effectiveFrom, "Active policy start");
    if (targetStart <= activeStart) {
      throw new Error(
        "A new active policy must start after the current active version.",
      );
    }
    return Object.freeze({
      ...policy,
      status: "retired" as const,
      effectiveTo: target.effectiveFrom,
      retiredAt: activatedAt,
    });
  });
  return createCommercialPolicyRegistry(policies);
}

export function retireCommercialPolicy(input: {
  readonly registry: CommercialPolicyRegistry;
  readonly policyId: string;
  readonly retiredAt?: string;
}): CommercialPolicyRegistry {
  const target = input.registry.policies.find(
    (policy) => policy.id === input.policyId,
  );
  if (!target) throw new Error("Commercial policy was not found.");
  if (target.status === "retired") return input.registry;
  const retiredAt = parseDate(
    input.retiredAt ?? new Date().toISOString(),
    "Policy retirement time",
  );
  if (retiredAt <= parseDate(target.effectiveFrom, "Policy effective-from")) {
    throw new Error("Policy retirement must be after effective-from.");
  }
  return createCommercialPolicyRegistry(
    input.registry.policies.map((policy) =>
      policy.id === target.id
        ? Object.freeze({
            ...policy,
            status: "retired" as const,
            effectiveTo: retiredAt.toISOString(),
            retiredAt: retiredAt.toISOString(),
          })
        : policy,
    ),
  );
}

export function resolveCommercialPolicy(input: {
  readonly registry: CommercialPolicyRegistry;
  readonly kind: CommercialPolicyKind;
  readonly at?: string;
}): CommercialPolicyVersion | undefined {
  const at = parseDate(
    input.at ?? new Date().toISOString(),
    "Policy resolution time",
  ).getTime();
  return input.registry.policies
    .filter((policy) => {
      if (policy.kind !== input.kind || policy.status === "draft") return false;
      const starts = Date.parse(policy.effectiveFrom) <= at;
      const ends = policy.effectiveTo ? at < Date.parse(policy.effectiveTo) : true;
      return starts && ends;
    })
    .sort((left, right) => right.version - left.version)[0];
}
