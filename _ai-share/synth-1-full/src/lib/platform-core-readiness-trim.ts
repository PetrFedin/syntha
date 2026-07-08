/** Лимиты списков good/bad/fix на уровне ячейки (tooltip). */
export const READINESS_AUDIT_LIST_LIMITS = { good: 3, bad: 2, fix: 1 } as const;
/** Разделы в развороте матрицы — полнее, по факту функционала. */
export const READINESS_SECTION_LIST_LIMITS = { good: 8, bad: 4, fix: 2 } as const;
export const READINESS_SUMMARY_MAX_LEN = 96;
export const READINESS_SECTION_SUMMARY_MAX_LEN = 140;

export function trimReadinessSummary(summary: string): string {
  const s = summary.trim();
  if (s.length <= READINESS_SUMMARY_MAX_LEN) return s;
  return `${s.slice(0, READINESS_SUMMARY_MAX_LEN - 1).trim()}…`;
}

export function trimReadinessAuditLists<T extends { good: string[]; bad: string[]; fix: string[] }>(
  entry: T,
  limits: { good: number; bad: number; fix: number } = READINESS_AUDIT_LIST_LIMITS
): T {
  return {
    ...entry,
    good: (entry.good ?? []).slice(0, limits.good),
    bad: (entry.bad ?? []).slice(0, limits.bad),
    fix: (entry.fix ?? []).slice(0, limits.fix),
  };
}

export function trimReadinessSectionLists<
  T extends { good: string[]; bad: string[]; fix: string[] },
>(entry: T): T {
  return trimReadinessAuditLists(entry, READINESS_SECTION_LIST_LIMITS);
}
