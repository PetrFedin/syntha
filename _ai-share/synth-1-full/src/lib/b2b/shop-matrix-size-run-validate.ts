/** Per-size MOQ check for matrix size run (shop CO). */
export function validateShopMatrixSizeRunMoq(input: {
  qtyBySize: Record<string, number>;
  moqPerCell?: number;
}): { ok: boolean; violations: string[]; messageRu: string } {
  const moq = Math.max(1, input.moqPerCell ?? 1);
  const violations: string[] = [];
  for (const [size, qty] of Object.entries(input.qtyBySize)) {
    if (qty <= 0) continue;
    if (qty < moq) {
      violations.push(`${size}: MOQ ${moq} шт., указано ${qty}`);
    }
  }
  return {
    ok: violations.length === 0,
    violations,
    messageRu:
      violations.length > 0 ? `MOQ: ${violations.length} замечаний по размерам` : 'MOQ по размерам соблюдён.',
  };
}

export function mergeShopMatrixSizeRunValidationResults(
  parts: Array<{ ok: boolean; violations: string[]; messageRu: string }>
): { ok: boolean; violations: string[]; messageRu: string } {
  const violations = parts.flatMap((p) => p.violations);
  const failed = parts.filter((p) => !p.ok);
  return {
    ok: violations.length === 0,
    violations,
    messageRu:
      failed.length === 0
        ? 'Size run соответствует кривой и MOQ.'
        : failed.map((p) => p.messageRu).join(' · '),
  };
}

/** Size run validation vs W2 size curve (shop matrix). */
export function validateShopMatrixSizeRunDistribution(input: {
  qtyBySize: Record<string, number>;
  expectedCurve: Record<string, number>;
  tolerancePct?: number;
}): { ok: boolean; violations: string[]; messageRu: string } {
  const tolerance = input.tolerancePct ?? 0.18;
  const total = Object.values(input.qtyBySize).reduce((s, n) => s + Math.max(0, n), 0);
  if (total <= 0) {
    return { ok: true, violations: [], messageRu: 'Size run пуст — проверка не требуется.' };
  }

  const expectedTotal = Object.values(input.expectedCurve).reduce((s, n) => s + Math.max(0, n), 0);
  if (expectedTotal <= 0) {
    return { ok: true, violations: [], messageRu: 'Кривая не задана — проверка пропущена.' };
  }

  const violations: string[] = [];
  const curveSizes = new Set(Object.keys(input.expectedCurve));

  for (const [size, qty] of Object.entries(input.qtyBySize)) {
    if (qty <= 0) continue;
    if (!curveSizes.has(size)) {
      violations.push(`${size}: размер вне кривой коллекции`);
      continue;
    }
    const actualPct = qty / total;
    const expectedPct = (input.expectedCurve[size] ?? 0) / expectedTotal;
    const delta = Math.abs(actualPct - expectedPct);
    if (delta > tolerance) {
      violations.push(
        `${size}: отклонение ${Math.round(delta * 100)}% от кривой (ожид. ~${Math.round(expectedPct * 100)}%)`
      );
    }
  }

  for (const size of curveSizes) {
    const expectedPct = (input.expectedCurve[size] ?? 0) / expectedTotal;
    if (expectedPct >= 0.12 && (input.qtyBySize[size] ?? 0) <= 0) {
      violations.push(`${size}: отсутствует в size run при доле кривой ~${Math.round(expectedPct * 100)}%`);
    }
  }

  return {
    ok: violations.length === 0,
    violations,
    messageRu:
      violations.length > 0
        ? `Size run: ${violations.length} замечаний`
        : 'Size run соответствует кривой коллекции.',
  };
}
