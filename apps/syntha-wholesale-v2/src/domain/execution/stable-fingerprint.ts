function canonicalize(
  value: unknown,
  stack: Set<object>,
  inArray = false,
): string | undefined {
  if (value === null) return "null";
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return inArray ? "null" : undefined;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (Number.isNaN(value)) return JSON.stringify("$number:NaN");
    if (value === Infinity) return JSON.stringify("$number:Infinity");
    if (value === -Infinity) return JSON.stringify("$number:-Infinity");
    if (Object.is(value, -0)) return "0";
    return JSON.stringify(value);
  }
  if (typeof value === "bigint") return JSON.stringify(`$bigint:${value.toString()}`);
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return JSON.stringify("$date:Invalid");
    return JSON.stringify(`$date:${value.toISOString()}`);
  }
  if (typeof value !== "object") return JSON.stringify(String(value));
  if (stack.has(value)) throw new Error("Cannot fingerprint a cyclic value.");

  stack.add(value);
  try {
    if (Array.isArray(value)) {
      return `[${value
        .map((item) => canonicalize(item, stack, true) ?? "null")
        .join(",")}]`;
    }

    const record = value as Record<string, unknown>;
    const fields = Object.keys(record)
      .sort()
      .flatMap((key) => {
        const serialized = canonicalize(record[key], stack, false);
        return serialized === undefined
          ? []
          : [`${JSON.stringify(key)}:${serialized}`];
      });
    return `{${fields.join(",")}}`;
  } finally {
    stack.delete(value);
  }
}

export function canonicalStringify(value: unknown): string {
  return canonicalize(value, new Set<object>(), false) ?? "null";
}

export function createStableFingerprint(value: unknown): string {
  const bytes = new TextEncoder().encode(canonicalStringify(value));
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;

  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = BigInt.asUintN(64, hash * prime);
  }

  return `fnv1a64:${hash.toString(16).padStart(16, "0")}`;
}
