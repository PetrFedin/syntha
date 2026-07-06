/** SLA ответа поставщика на Centric RFQ (Platform Core wave UF). */
export const SUPPLIER_RFQ_SLA_HOURS = 48;

export type SupplierRfqSlaTimerState = {
  rfqId: string | null;
  deadlineIso: string | null;
  remainingMs: number;
  overdue: boolean;
  warnWindow: boolean;
  labelRu: string;
  countdownRu: string;
};

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function formatSupplierRfqSlaCountdownRu(remainingMs: number, overdue: boolean): string {
  if (overdue) {
    const overdueMs = Math.abs(remainingMs);
    const hours = Math.floor(overdueMs / 3_600_000);
    const minutes = Math.floor((overdueMs % 3_600_000) / 60_000);
    return `просрочено ${pad2(hours)}:${pad2(minutes)}`;
  }
  const hours = Math.floor(remainingMs / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  return `${pad2(hours)}:${pad2(minutes)}`;
}

export type SupplierRfqSlaAnchorSource = 'centric_imported_at' | 'thread_created_at' | 'none';

export function resolveSupplierRfqSlaAnchor(input: {
  importedAt?: string | null;
  threadCreatedAt?: string | null;
}): { anchorAt: string | null; anchorSource: SupplierRfqSlaAnchorSource } {
  const importedAt = input.importedAt?.trim();
  if (importedAt) {
    const started = new Date(importedAt);
    if (!Number.isNaN(started.getTime())) {
      return { anchorAt: importedAt, anchorSource: 'centric_imported_at' };
    }
  }
  const threadCreatedAt = input.threadCreatedAt?.trim();
  if (threadCreatedAt) {
    const started = new Date(threadCreatedAt);
    if (!Number.isNaN(started.getTime())) {
      return { anchorAt: threadCreatedAt, anchorSource: 'thread_created_at' };
    }
  }
  return { anchorAt: null, anchorSource: 'none' };
}

export function computeSupplierRfqSlaTimer(input: {
  rfqId?: string | null;
  importedAt?: string | null;
  threadCreatedAt?: string | null;
  now?: Date;
  slaHours?: number;
}): SupplierRfqSlaTimerState {
  const slaHours = input.slaHours ?? SUPPLIER_RFQ_SLA_HOURS;
  const { anchorAt, anchorSource } = resolveSupplierRfqSlaAnchor({
    importedAt: input.importedAt,
    threadCreatedAt: input.threadCreatedAt,
  });
  const importedAt = anchorAt;
  if (!importedAt) {
    return {
      rfqId: input.rfqId?.trim() || null,
      deadlineIso: null,
      remainingMs: 0,
      overdue: false,
      warnWindow: false,
      labelRu: 'RFQ не найден — SLA не запущен',
      countdownRu: '—',
    };
  }

  const started = new Date(importedAt);
  if (Number.isNaN(started.getTime())) {
    return {
      rfqId: input.rfqId?.trim() || null,
      deadlineIso: null,
      remainingMs: 0,
      overdue: false,
      warnWindow: false,
      labelRu: 'Некорректная дата RFQ',
      countdownRu: '—',
    };
  }

  const now = input.now ?? new Date();
  const deadline = new Date(started.getTime() + slaHours * 3_600_000);
  const remainingMs = deadline.getTime() - now.getTime();
  const overdue = remainingMs <= 0;
  const warnWindow = !overdue && remainingMs <= 12 * 3_600_000;
  const countdownRu = formatSupplierRfqSlaCountdownRu(remainingMs, overdue);

  return {
    rfqId: input.rfqId?.trim() || null,
    deadlineIso: deadline.toISOString(),
    remainingMs,
    overdue,
    warnWindow,
    labelRu: overdue
      ? `SLA ${slaHours} ч · просрочен ответ на RFQ`
      : warnWindow
        ? `SLA ${slaHours} ч · осталось мало времени`
        : anchorSource === 'thread_created_at'
          ? `SLA ${slaHours} ч · тред RFQ (от created_at)`
          : `SLA ${slaHours} ч · ответ на RFQ`,
    countdownRu,
  };
}
