/**
 * Wave E: единый chip «PG mirror» для operational panels — реальный статус, не amber-success.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export type Workshop2OperationalPgMirrorTone = 'emerald' | 'amber' | 'slate' | 'rose';

export type Workshop2OperationalPgMirrorChip = {
  label: string;
  tone: Workshop2OperationalPgMirrorTone;
  title?: string;
};

function toneFromSynced(
  synced: boolean,
  drift?: boolean,
  offline?: boolean
): Workshop2OperationalPgMirrorTone {
  if (offline) return 'rose';
  if (drift) return 'amber';
  return synced ? 'emerald' : 'slate';
}

function mirrorTitle(
  mirror: Record<string, unknown> | undefined,
  key: string,
  fallback?: string
): string | undefined {
  const value = workshop2PgMirrorStr(mirror, key);
  return value || fallback;
}

/** Hub onboarding mirror (#4). */
export function summarizeWorkshop2HubOnboardingPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.hubOnboardingMirror;
  if (!mirror) {
    return {
      label: 'Онбординг: не в PG',
      tone: 'slate',
      title: 'Откройте workspace после онбординга для PUT hub_onboarding_mirror.',
    };
  }
  if (mirror.driftDetected === true) {
    return {
      label: 'Онбординг: drift local↔PG',
      tone: 'amber',
      title: mirrorTitle(mirror, 'hintRu'),
    };
  }
  if (mirror.pgPrimary === true && mirror.done === true) {
    return {
      label: 'Онбординг: PG',
      tone: 'emerald',
      title: mirrorTitle(mirror, 'hintRu'),
    };
  }
  return {
    label:
      workshop2PgMirrorStr(mirror, 'source') === 'browser_storage'
        ? 'Онбординг: LS cache'
        : 'Онбординг: pending PG',
    tone: 'amber',
    title: mirrorTitle(mirror, 'hintRu', 'Завершите онбординг и сохраните mirror в PG.'),
  };
}

/** Inspector report mirror (#68). */
export function summarizeWorkshop2InspectorPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.inspectorReportMirror;
  if (!mirror) {
    return {
      label: 'Инспектор: не в PG',
      tone: 'slate',
      title: 'Сохраните отчёт инспектора (PWA или кнопка в workspace).',
    };
  }
  if (mirror.offlineOnly === true || mirror.pgSynced !== true) {
    return {
      label: 'Инспектор: offline/queue',
      tone: 'rose',
      title: mirrorTitle(mirror, 'hintRu'),
    };
  }
  const checkedCount = workshop2PgMirrorNum(mirror, 'checkedCount');
  const totalItems = workshop2PgMirrorNum(mirror, 'totalItems');
  return {
    label: `Инспектор: PG · ${checkedCount}/${totalItems}`,
    tone: toneFromSynced(true),
    title: mirrorTitle(mirror, 'hintRu'),
  };
}

/** Factory ERP sync + staging journal (#66). */
export function summarizeWorkshop2FactoryErpPgMirror(input: {
  dossier: Workshop2DossierPhase1 | null | undefined;
  syncStatus?: string;
  erpOrderId?: string | null;
}): Workshop2OperationalPgMirrorChip {
  const staging = input.dossier?.factoryErpStagingMirror;
  const sync = input.dossier?.factoryErpSync;
  const erpId = (input.erpOrderId ?? workshop2PgMirrorStr(sync, 'erpOrderId')).trim() || undefined;

  if (erpId) {
    return {
      label: `ERP: ${erpId}`,
      tone: 'emerald',
      title: mirrorTitle(sync, 'hintRu', 'erpOrderId подтверждён в PG (live POST или manual ack).'),
    };
  }

  const partnerAckId = workshop2PgMirrorStr(staging, 'partnerAckId');
  if (staging?.partnerAckRecorded === true && partnerAckId) {
    return {
      label: `ERP staging: ${partnerAckId}`,
      tone: 'amber',
      title: mirrorTitle(staging, 'hintRu', 'Staging contract ACK — prod live POST отдельно.'),
    };
  }

  if (input.syncStatus === 'not_configured' || (!staging && !sync)) {
    return {
      label: 'ERP: не настроен',
      tone: 'slate',
      title:
        'WORKSHOP2_FACTORY_ERP_BASE_URL не задан — live POST /purchase-orders недоступен (fail-closed, без fake ACK).',
    };
  }

  if (input.syncStatus === 'error') {
    return {
      label: 'ERP: error',
      tone: 'rose',
      title:
        mirrorTitle(sync, 'lastError') ||
        mirrorTitle(sync, 'hintRu') ||
        'POST /purchase-orders без erpOrderId.',
    };
  }

  return {
    label: 'ERP: configured (no ACK)',
    tone: 'amber',
    title: 'URL задан — erpOrderId только после POST /purchase-orders.',
  };
}

/** AQL qcAqlMirror (#69). */
export function summarizeWorkshop2AqlPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.qcAqlMirror;
  if (!workshop2PgMirrorStr(mirror, 'recordedAt')) {
    return {
      label: 'AQL: не в PG',
      tone: 'slate',
      title: 'Сохраните расчёт AQL — «AQL → PG» на вкладке ОТК.',
    };
  }
  if (mirror?.isFail === true) {
    return {
      label: 'AQL: брак в PG',
      tone: 'rose',
      title: mirrorTitle(mirror, 'hintRu', 'AQL fail — sample/handoff gates заблокированы.'),
    };
  }
  const sampleSize = workshop2PgMirrorNum(mirror, 'sampleSize');
  const recordedAt = workshop2PgMirrorStr(mirror, 'recordedAt');
  const orderQty = workshop2PgMirrorNum(mirror, 'orderQty');
  return {
    label: `AQL: PG · n=${sampleSize}`,
    tone: 'emerald',
    title: mirrorTitle(mirror, 'hintRu') || `Запись ${recordedAt} · qty ${orderQty || '—'}.`,
  };
}

/** Grading apply mirror (#39). */
export function summarizeWorkshop2GradingApplyPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.gradingApplyMirror;
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'Градация: не в PG',
      tone: 'slate',
      title: '«Градация → PG» после apply smart grading.',
    };
  }
  const state = workshop2PgMirrorStr(mirror, 'state');
  if (mirror?.blockerExport === true || state === 'partial') {
    return {
      label: `Градация: ${state || 'partial'}`,
      tone: 'amber',
      title: mirrorTitle(mirror, 'hintRu', 'Градация частична — export/handoff gates.'),
    };
  }
  if (state === 'empty') {
    return {
      label: 'Градация: пусто',
      tone: 'slate',
      title: mirrorTitle(mirror, 'hintRu', 'Нет правил градации в mirror.'),
    };
  }
  const ruleCount = workshop2PgMirrorNum(mirror, 'ruleCount');
  const sizeCount = workshop2PgMirrorNum(mirror, 'sizeCount');
  const lastAppliedAt = workshop2PgMirrorStr(mirror, 'lastAppliedAt');
  const mirroredAt = workshop2PgMirrorStr(mirror, 'mirroredAt');
  return {
    label: `Градация: PG · ${ruleCount}×${sizeCount}`,
    tone: 'emerald',
    title: mirrorTitle(mirror, 'hintRu') || `Apply ${lastAppliedAt || mirroredAt}.`,
  };
}

/** BOM nodes mirror (#36). */
export function summarizeWorkshop2BomNodesPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.bomNodesMirror;
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'BOM: не в PG',
      tone: 'slate',
      title: '«BOM → PG» после синхронизации mat → BOM.',
    };
  }
  const state = workshop2PgMirrorStr(mirror, 'state');
  const nodeCount = workshop2PgMirrorNum(mirror, 'nodeCount');
  const materialLineCount = workshop2PgMirrorNum(mirror, 'materialLineCount');
  if (mirror?.blockerSampleOrder === true || state !== 'ready') {
    return {
      label: `BOM: ${state || 'partial'}`,
      tone: state === 'empty' ? 'slate' : 'amber',
      title:
        mirrorTitle(mirror, 'hintRu') ||
        `Узлов ${nodeCount} · мат. ${materialLineCount} — дозаполните BOM.`,
    };
  }
  const estimatedFob = workshop2PgMirrorNum(mirror, 'estimatedFob');
  const fobLabel = estimatedFob > 0 ? estimatedFob.toFixed(2) : '—';
  return {
    label: `BOM: PG · ${nodeCount}/${materialLineCount}`,
    tone: 'emerald',
    title: mirrorTitle(mirror, 'hintRu') || `FOB ~${fobLabel}.`,
  };
}

/** Change requests mirror (#28). */
export function summarizeWorkshop2ChangeRequestPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.changeRequestMirror;
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'CR: не в PG',
      tone: 'slate',
      title: '«CR → PG» — mirror для sample-order gate.',
    };
  }
  const pendingCount = workshop2PgMirrorNum(mirror, 'pendingCount');
  const totalRequests = workshop2PgMirrorNum(mirror, 'totalRequests');
  if (mirror?.blockerSampleOrder === true) {
    return {
      label: `CR: pending ${pendingCount}`,
      tone: 'rose',
      title: mirrorTitle(mirror, 'hintRu', 'Открытые CR блокируют sample-order.'),
    };
  }
  return {
    label: totalRequests > 0 ? `CR: PG · ${totalRequests}` : 'CR: PG · 0',
    tone: 'emerald',
    title: mirrorTitle(mirror, 'hintRu', 'Все CR закрыты.'),
  };
}

/** Stock WMS ledger + internal reserve mirror (#71). */
export function summarizeWorkshop2StockWmsPgMirror(input: {
  dossier: Workshop2DossierPhase1 | null | undefined;
  wmsFailClosed?: boolean;
}): Workshop2OperationalPgMirrorChip {
  const internal = input.dossier?.internalWmsMirror;
  const ledger = input.dossier?.stockWmsLedger;

  if (input.wmsFailClosed) {
    return {
      label: 'WMS: fail-closed',
      tone: 'rose',
      title: 'Internal WMS API недоступен — 503 без fake reserve.',
    };
  }

  if (workshop2PgMirrorStr(internal, 'mirroredAt')) {
    const deficit = workshop2PgMirrorNum(internal, 'reserveDeficitCount');
    const reservedQty = workshop2PgMirrorNum(internal, 'reservedQty');
    const itemCount = workshop2PgMirrorNum(internal, 'itemCount');
    const onHandQty = workshop2PgMirrorNum(internal, 'onHandQty');
    return {
      label: deficit > 0 ? `WMS: дефицит ${deficit}` : `WMS: резерв ${reservedQty}`,
      tone: deficit > 0 ? 'amber' : 'emerald',
      title:
        mirrorTitle(internal, 'hintRu') ||
        `Позиций ${itemCount} · on-hand ${onHandQty > 0 ? onHandQty : '—'}.`,
    };
  }

  if (workshop2PgMirrorStr(ledger, 'ledgerAt')) {
    const movementCount = workshop2PgMirrorNum(ledger, 'movementCount');
    const qtyOnHand =
      workshop2PgMirrorStr(ledger, 'qtyOnHand') || workshop2PgMirrorNum(ledger, 'qtyOnHand');
    const wmsSyncStatus = workshop2PgMirrorStr(ledger, 'wmsSyncStatus');
    return {
      label: ledger?.negativeBalance === true ? 'WMS: ledger −' : 'WMS: ledger draft',
      tone:
        ledger?.negativeBalance === true
          ? 'rose'
          : wmsSyncStatus === 'internal_pg'
            ? 'emerald'
            : 'amber',
      title:
        mirrorTitle(ledger, 'hintRu') || `Движений ${movementCount} · остаток ${qtyOnHand || '—'}.`,
    };
  }

  return {
    label: 'WMS: не в PG',
    tone: 'slate',
    title: '«WMS ledger → PG» или резерв под образец на Снабжении.',
  };
}

/** Supplier QC scorecard mirror (#70, Wave V). */
export function summarizeWorkshop2SupplierQcPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const snap = dossier?.supplierQcSnapshot;
  if (!workshop2PgMirrorStr(snap, 'snapshotAt')) {
    return {
      label: 'Scorecard: не в PG',
      tone: 'slate',
      title: 'Снимок PO scorecard не записан — «Сохранить в досье» на панели ОТК.',
    };
  }
  const passRate = workshop2PgMirrorNum(snap, 'passRate');
  if (passRate > 0 && passRate < 85) {
    return {
      label: `Scorecard: ${passRate.toFixed(0)}% pass`,
      tone: 'amber',
      title: mirrorTitle(snap, 'hintRu', 'Pass rate ниже порога handoff — проверьте PO.'),
    };
  }
  const totalBatches = workshop2PgMirrorNum(snap, 'totalBatches');
  const source = workshop2PgMirrorStr(snap, 'source') || 'purchase_orders';
  const passLabel = passRate > 0 ? `${passRate.toFixed(0)}%` : '—';
  return {
    label: `Scorecard: PG · ${passLabel}`,
    tone: 'emerald',
    title: mirrorTitle(snap, 'hintRu') || `Партий ${totalBatches} · source ${source}.`,
  };
}

/** TZ general — InfoPick matrix mirror (Wave V dossier section honesty). */
export function summarizeWorkshop2TzGeneralPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.infopickMatrixMirror;
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'InfoPick: не в PG',
      tone: 'slate',
      title: 'Матрица InfoPick — сохраните mirror в досье с вкладки «Паспорт».',
    };
  }
  const gaps =
    workshop2PgMirrorNum(mirror, 'missingCount') ||
    workshop2PgMirrorNum(mirror, 'missingMatrixCount');
  return {
    label: gaps ? `InfoPick: PG · ${gaps} gap` : 'InfoPick: PG',
    tone: gaps ? 'amber' : 'emerald',
    title: mirrorTitle(mirror, 'hintRu'),
  };
}

/** TZ construction — CAD vault mirror (Wave V). */
export function summarizeWorkshop2TzConstructionPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.cadVaultLinkMirror;
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'CAD: не в PG',
      tone: 'slate',
      title: 'cadVaultLinkMirror отсутствует — загрузите CAD и сохраните mirror.',
    };
  }
  if (mirror?.vaultReady !== true || mirror?.proprietaryDemoOnly === true) {
    return {
      label: mirror?.proprietaryDemoOnly === true ? 'CAD: demo only' : 'CAD: partial',
      tone: 'amber',
      title: mirrorTitle(mirror, 'hintRu', 'Production .glb ingest не завершён.'),
    };
  }
  const vaultCadCount = workshop2PgMirrorNum(mirror, 'vaultCadCount');
  return {
    label: vaultCadCount ? `CAD: PG · ${vaultCadCount} doc` : 'CAD: PG',
    tone: 'emerald',
    title: mirrorTitle(mirror, 'hintRu'),
  };
}

/** TZ assignment — factory handoff bundle mirror (Wave V). */
export function summarizeWorkshop2TzAssignmentPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.factoryHandoffBundleMirror;
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'Handoff: не в PG',
      tone: 'slate',
      title: 'factoryHandoffBundleMirror — commit gate + «Сохранить в досье» на вкладке «Задание».',
    };
  }
  const pendingAckCount = workshop2PgMirrorNum(mirror, 'pendingAckCount');
  const bundleState = workshop2PgMirrorStr(mirror, 'bundleState');
  if (bundleState === 'draft' || pendingAckCount > 0) {
    return {
      label: 'Handoff: partial PG',
      tone: 'amber',
      title: mirrorTitle(mirror, 'hintRu', 'Пакет передачи неполный — проверьте gate checks.'),
    };
  }
  return {
    label: 'Handoff: PG',
    tone: 'emerald',
    title: mirrorTitle(mirror, 'hintRu'),
  };
}

/** T&A plan mirror — обёртка над taMilestonesMirror (Wave V TZ section). */
export function summarizeWorkshop2TzTimeAndActionPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.taMilestonesMirror;
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'T&A: не в PG',
      tone: 'slate',
      title: 'taMilestonesMirror — сохраните milestones на вкладке «План заказа».',
    };
  }
  const milestoneCount = workshop2PgMirrorNum(mirror, 'milestoneCount');
  return {
    label: `T&A: PG · ${milestoneCount} вех`,
    tone: 'emerald',
    title: mirrorTitle(mirror, 'hintRu'),
  };
}

/** Matchmaker mirror (#28 wave). */
export function summarizeWorkshop2MatchmakerPgMirror(
  dossier: Workshop2DossierPhase1 | null | undefined
): Workshop2OperationalPgMirrorChip {
  const mirror = dossier?.matchmakerMirror;
  const hasResult = Boolean(dossier?.matchmakerResult?.syncedAt);
  if (!hasResult) {
    return {
      label: 'Matchmaker: не запускали',
      tone: 'slate',
      title: 'Подбор подрядчика ещё не выполнялся.',
    };
  }
  if (!workshop2PgMirrorStr(mirror, 'mirroredAt')) {
    return {
      label: 'Matchmaker: не в PG',
      tone: 'amber',
      title: 'Результат в досье · mirror не записан — «Matchmaker → PG».',
    };
  }
  const recommendedContractorId = workshop2PgMirrorStr(mirror, 'recommendedContractorId');
  return {
    label: recommendedContractorId
      ? `Matchmaker: PG · ${recommendedContractorId}`
      : 'Matchmaker: PG',
    tone: 'emerald',
    title: dossier?.matchmakerResult?.syncedAt
      ? `Sync ${dossier.matchmakerResult.syncedAt}`
      : undefined,
  };
}
