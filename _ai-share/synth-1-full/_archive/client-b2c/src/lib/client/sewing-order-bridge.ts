import { readSewingPatternIntentV1 } from '@/lib/pattern-drafting/sewing-pattern-leaf-storage';
import type { SewingPatternIntentV1 } from '@/lib/pattern-drafting/sewing-pattern-leaf-storage';
import type { OrderSewingIntentSnapshot } from '@/lib/types';

function sewingIntentMeasuresAsNumbers(
  measures: SewingPatternIntentV1['measures']
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(measures)) {
    const n = Number.parseFloat(String(raw).replace(',', '.'));
    if (Number.isFinite(n)) out[key] = n;
  }
  return out;
}

/**
 * Снимок категории+мерок из localStorage для передачи в `createOrder` (мок-репозиторий, далее OMS/CRM).
 * Только в браузере; на SSR возвращает `null`.
 */
export function getSewingIntentForOrder(): OrderSewingIntentSnapshot | null {
  if (typeof window === 'undefined') return null;
  const i = readSewingPatternIntentV1();
  if (!i?.handbookLeafId) return null;
  return {
    clientSewingIntentHandbookLeafId: i.handbookLeafId,
    clientSewingIntentPathLabel: i.pathLabel,
    clientSewingIntentSnapshotAt: i.updatedAt,
    clientSewingIntentMeasures: sewingIntentMeasuresAsNumbers(i.measures),
  };
}
