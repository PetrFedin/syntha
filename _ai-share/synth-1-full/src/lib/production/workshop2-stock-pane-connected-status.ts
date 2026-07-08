/**
 * Wave 17 RU: одна строка статуса вкладки «Приёмка» — internal WMS + подсказка МойСклад (reuse dossier mirrors).
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import type { Workshop2InternalWmsMemoryJournalEntry } from '@/lib/production/workshop2-internal-wms-memory-journal';

/** Сводка подключения склада без новых API — только mirrors / PG balances count. */
export function summarizeWorkshop2StockPaneConnectedStatusRu(input: {
  dossier?: Workshop2DossierPhase1 | null;
  wmsBalanceCount?: number;
  wmsFailClosed?: boolean;
}): string {
  const parts: string[] = [];
  const internal = input.dossier?.internalWmsMirror;
  const ledger = input.dossier?.stockWmsLedger;

  if (input.wmsFailClosed) {
    parts.push('Internal WMS: fail-closed (PG недоступен)');
  } else if (internal?.mirroredAt) {
    parts.push(
      `Internal WMS: ${internal.itemCount} поз. · резерв ${internal.reservedQty ?? 0} · on-hand ${internal.onHandQty ?? '—'}`
    );
  } else if ((input.wmsBalanceCount ?? 0) > 0) {
    parts.push(`Internal WMS: ${input.wmsBalanceCount} поз. (PG balances)`);
  } else if (ledger?.ledgerAt) {
    parts.push(
      `Internal WMS: ledger · ${ledger.movementCount} движ. · остаток ${ledger.qtyOnHand}`
    );
  } else {
    parts.push('Internal WMS: не подключён — резерв на «Снабжение»');
  }

  const memoryJournal = internal?.memoryJournal;
  const journalRows: Workshop2InternalWmsMemoryJournalEntry[] = Array.isArray(memoryJournal)
    ? (memoryJournal as Workshop2InternalWmsMemoryJournalEntry[])
    : [];
  const moyJournal = [...journalRows].reverse().find((j) => {
    const msg = typeof j?.messageRu === 'string' ? j.messageRu : '';
    return msg.includes('МойСклад') || j?.kind === 'sync';
  });
  const moyMsg = typeof moyJournal?.messageRu === 'string' ? moyJournal.messageRu.trim() : '';
  const ledgerHint = ledger ? workshop2PgMirrorStr(ledger, 'hintRu') : '';
  if (moyMsg) {
    parts.push(`МойСклад: ${moyMsg}`);
  } else if (ledgerHint.includes('МойСклад')) {
    parts.push(`МойСклад: ${ledgerHint.trim()}`);
  } else {
    parts.push('МойСклад: импорт остатков — кнопка на «Снабжение»');
  }

  return parts.join(' · ');
}
