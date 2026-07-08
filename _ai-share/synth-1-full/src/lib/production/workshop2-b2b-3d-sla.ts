/**
 * Wave 49/53: B2B 3D session SLA — aggregates из journal_only .planning/.
 */
import fs from 'node:fs';
import path from 'node:path';

const SESSION_JOURNAL_BASENAME = '.planning/workshop2-b2b-3d-session-journal.json';

function sessionJournalPath(): string {
  return path.join(process.cwd(), SESSION_JOURNAL_BASENAME);
}

export type Workshop2B2b3dSessionJournalEntry = {
  sessionId?: string;
  durationSec?: number;
  error?: boolean;
  errorCode?: string;
  at?: string;
};

export type Workshop2B2b3dSlaSummary = {
  sessionCount: number;
  avgDurationSec: number;
  errorCount: number;
  errorRatePct: number;
  labelRu: string;
};

function loadSessionEntries(): Workshop2B2b3dSessionJournalEntry[] {
  try {
    if (!fs.existsSync(sessionJournalPath())) return [];
    const parsed = JSON.parse(fs.readFileSync(sessionJournalPath(), 'utf8')) as {
      sessions?: Workshop2B2b3dSessionJournalEntry[];
      entries?: Workshop2B2b3dSessionJournalEntry[];
    };
    const rows = parsed.sessions ?? parsed.entries ?? [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

/** Агрегаты SLA 3D showroom из file journal (fail-closed без fake metrics). */
export function summarizeWorkshop2B2b3dSlaFromJournal(): Workshop2B2b3dSlaSummary {
  const entries = loadSessionEntries();
  const sessionCount = entries.length;
  const durations = entries
    .map((e) => Number(e.durationSec ?? 0))
    .filter((n) => Number.isFinite(n) && n >= 0);
  const avgDurationSec =
    durations.length > 0
      ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
      : 0;
  const errorCount = entries.filter((e) => e.error === true).length;
  const errorRatePct = sessionCount > 0 ? Math.round((errorCount / sessionCount) * 1000) / 10 : 0;

  return {
    sessionCount,
    avgDurationSec,
    errorCount,
    errorRatePct,
    labelRu:
      sessionCount === 0
        ? 'Нет 3D-сессий в journal — метрики появятся после b2b.3d.session.'
        : `${sessionCount} сессий, ошибок ${errorRatePct}%`,
  };
}
