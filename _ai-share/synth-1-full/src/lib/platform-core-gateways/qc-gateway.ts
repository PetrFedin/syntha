import 'server-only';

import {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
} from '@/lib/platform-core-ports/dossier-store';
import {
  listWorkshop2QcDefectsByArticle,
  type Workshop2QcDefectRecord,
} from '@/lib/platform-core-ports/qc-defects';
import {
  listWorkshop2SampleOrders,
  type Workshop2SampleOrderRecord,
} from '@/lib/platform-core-ports/sample-orders';

export type PlatformCoreQcGatewaySource = 'workshop2_qc_defects' | 'workshop2_dossier_mirror';

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreQcDefect = {
  id: string;
  severity: 'minor' | 'major' | 'critical';
  qtyAffected?: number;
  source: string;
  defectCode: string;
  defectLabel?: string;
  sampleOrderId?: string;
  createdAt: string;
};

type QcMirror = Record<string, unknown>;

type DossierQcShape = {
  qcPanelMirror?: QcMirror;
  qcAqlMirror?: QcMirror;
  qcAqlInspectionLog?: readonly QcMirror[];
  inspectorReportMirror?: QcMirror;
};

export type PlatformCoreQcSnapshot = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  batchId?: string;
  sampleOrderId?: string;
  supplierId?: string;
  version: number;
  updatedAt: string;
  source: PlatformCoreQcGatewaySource;
  inspectedQty?: number;
  panel?: QcMirror;
  aql?: QcMirror;
  inspector?: QcMirror;
  defects: PlatformCoreQcDefect[];
};

export type PlatformCoreQcEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
  passed: boolean;
  defectTotal: number;
  criticalDefectCount: number;
  majorDefectCount: number;
  minorDefectCount: number;
  defectRecordCount: number;
  completenessPct: number;
  shipmentBlocked: boolean;
  handoffBlocked: boolean;
  inspectorOffline: boolean;
  needsException: boolean;
};

export type PlatformCoreQcArticleResult =
  | {
      ok: true;
      collectionId: string;
      articleId: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      version: number;
      updatedAt: string;
      qc: PlatformCoreQcSnapshot;
      evaluation: PlatformCoreQcEvaluation;
    }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      collectionId?: string;
      articleId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
    };

function cleanString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function positiveNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

function mirrorNum(m: QcMirror | undefined, key: string): number | undefined {
  return positiveNumber(m?.[key]);
}

function mirrorBool(m: QcMirror | undefined, key: string): boolean | undefined {
  const v = m?.[key];
  return typeof v === 'boolean' ? v : undefined;
}

function adapterStatus(issues: PlatformCoreAdapterIssue[]): PlatformCoreQcEvaluation['status'] {
  if (issues.some((i) => i.severity === 'blocker')) return 'blocked';
  if (issues.some((i) => i.severity === 'warning')) return 'warning';
  return 'core_ready';
}

function defectsFromRecords(records: readonly Workshop2QcDefectRecord[]): PlatformCoreQcDefect[] {
  return records.map((r) => ({
    id: r.id,
    severity: r.severity,
    qtyAffected: r.qtyAffected,
    source: r.source,
    defectCode: r.defectCode,
    defectLabel: r.defectLabel,
    sampleOrderId: r.sampleOrderId,
    createdAt: r.createdAt,
  }));
}

function activeSampleOrder(
  orders: readonly Workshop2SampleOrderRecord[],
  activeId?: string
): Workshop2SampleOrderRecord | undefined {
  const id = cleanString(activeId);
  return orders.find((o) => o.id === id) ?? orders[0];
}

function defectQty(d: PlatformCoreQcDefect): number {
  return positiveNumber(d.qtyAffected) ?? 1;
}

function countBySeverity(defects: PlatformCoreQcDefect[], severity: PlatformCoreQcDefect['severity']): number {
  return defects.filter((d) => d.severity === severity).reduce((s, d) => s + defectQty(d), 0);
}

function buildSnapshot(input: {
  collectionId: string;
  articleId: string;
  version: number;
  updatedAt: string;
  dossier: DossierQcShape;
  defects: PlatformCoreQcDefect[];
  sampleOrders: Workshop2SampleOrderRecord[];
}): PlatformCoreQcSnapshot {
  const panel = input.dossier.qcPanelMirror;
  const aqlLog = input.dossier.qcAqlInspectionLog?.[0];
  const aqlMirror = input.dossier.qcAqlMirror;
  const inspector = input.dossier.inspectorReportMirror;
  const order = activeSampleOrder(
    input.sampleOrders,
    cleanString(panel?.activeSampleOrderId as string | undefined)
  );

  const aql =
    aqlLog || aqlMirror
      ? {
          ...(aqlMirror ?? {}),
          ...(aqlLog ?? {}),
          batchId: cleanString(aqlLog?.batchId) ?? cleanString(aqlMirror?.batchId as string),
          sampleSize: mirrorNum(aqlLog, 'sampleSize') ?? mirrorNum(aqlMirror, 'sampleSize'),
          isFail: mirrorBool(aqlLog, 'isFail') ?? mirrorBool(aqlMirror, 'isFail'),
          blockerHandoff:
            mirrorBool(aqlMirror, 'blockerHandoff') ?? mirrorBool(aqlMirror, 'blockerSampleOrder'),
        }
      : undefined;

  const sampleOrderId =
    order?.id ??
    cleanString(panel?.activeSampleOrderId as string) ??
    cleanString(inspector?.sampleOrderId as string);

  return {
    collectionId: input.collectionId,
    articleId: input.articleId,
    orderId: order?.id,
    batchId: cleanString(aql?.batchId as string),
    sampleOrderId,
    supplierId: cleanString(panel?.supplierId as string) ?? order?.contractorId,
    version: input.version,
    updatedAt: input.updatedAt,
    source: input.defects.length ? 'workshop2_qc_defects' : 'workshop2_dossier_mirror',
    inspectedQty:
      mirrorNum(inspector, 'checkedCount') ??
      mirrorNum(aql, 'sampleSize') ??
      order?.quantity,
    panel,
    aql,
    inspector,
    defects: input.defects,
  };
}

function evaluateQc(snapshot: PlatformCoreQcSnapshot): PlatformCoreQcEvaluation {
  const issues: PlatformCoreAdapterIssue[] = [];
  const defects = snapshot.defects;
  const criticalDefectCount =
    countBySeverity(defects, 'critical') || mirrorNum(snapshot.aql, 'criticalFound') || 0;
  const majorDefectCount =
    countBySeverity(defects, 'major') ||
    mirrorNum(snapshot.aql, 'majorFound') ||
    (mirrorBool(snapshot.aql, 'isFail') ? 1 : 0) ||
    mirrorNum(snapshot.panel, 'failedBatchCount') ||
    0;
  const minorDefectCount =
    countBySeverity(defects, 'minor') || mirrorNum(snapshot.aql, 'minorFound') || 0;
  const defectTotal = criticalDefectCount + majorDefectCount + minorDefectCount;
  const passed = criticalDefectCount === 0 && majorDefectCount === 0 && minorDefectCount <= 1;

  const sampleOrderLinked = Boolean(
    snapshot.sampleOrderId || mirrorBool(snapshot.panel, 'hasSampleOrder')
  );
  const supplierResolved = Boolean(
    snapshot.supplierId || snapshot.panel?.supplierSource === 'purchase_order'
  );
  const inspectedQty = snapshot.inspectedQty ?? 0;
  const hasEvidence =
    inspectedQty > 0 ||
    Boolean(snapshot.aql) ||
    Boolean(snapshot.inspector) ||
    mirrorNum(snapshot.panel, 'batchCount') ||
    defects.length > 0;

  if (!hasEvidence) {
    issues.push({
      id: 'qc.evidence.missing',
      severity: 'blocker',
      message: 'Нет QC evidence: нужны AQL, дефекты, инспектор или закрытая партия.',
    });
  }
  if (!sampleOrderLinked) {
    issues.push({
      id: 'qc.sample_order.missing',
      severity: 'blocker',
      message: 'QC не связан с sample/order.',
    });
  }
  if (!supplierResolved) {
    issues.push({
      id: 'qc.supplier.missing',
      severity: 'warning',
      message: 'Поставщик не определён для scorecard.',
    });
  }
  if (mirrorNum(snapshot.panel, 'pendingBatchCount')) {
    issues.push({
      id: 'qc.batch.pending',
      severity: 'blocker',
      message: 'Есть pending QC партии: shipment gate нельзя закрыть.',
    });
  }
  if (mirrorBool(snapshot.panel, 'blockerSampleOrder')) {
    issues.push({
      id: 'qc.sample_order.blocked',
      severity: 'blocker',
      message: cleanString(snapshot.panel?.hintRu as string) ?? 'QC mirror блокирует sample/order.',
    });
  }
  if (mirrorBool(snapshot.aql, 'blockerHandoff')) {
    issues.push({
      id: 'qc.aql.blocked',
      severity: 'blocker',
      message: cleanString(snapshot.aql?.hintRu as string) ?? 'AQL mirror блокирует handoff/shipment.',
    });
  }
  if (mirrorBool(snapshot.inspector, 'offlineOnly')) {
    issues.push({
      id: 'qc.inspector.offline_only',
      severity: 'blocker',
      message: cleanString(snapshot.inspector?.hintRu as string) ?? 'Отчёт инспектора не синхронизирован.',
    });
  }
  if (mirrorBool(snapshot.inspector, 'blockerHandoff')) {
    issues.push({
      id: 'qc.inspector.blocked',
      severity: 'blocker',
      message: cleanString(snapshot.inspector?.hintRu as string) ?? 'Инспектор блокирует handoff/shipment.',
    });
  }
  if (!passed) {
    issues.push({
      id: 'qc.failed',
      severity: 'blocker',
      message: 'QC не пройден: нужен exception или rework.',
    });
  }

  const checks = [
    sampleOrderLinked,
    supplierResolved,
    hasEvidence,
    !mirrorNum(snapshot.panel, 'pendingBatchCount'),
    !mirrorBool(snapshot.inspector, 'offlineOnly'),
    criticalDefectCount === 0 && majorDefectCount === 0,
  ];
  const completenessPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const handoffBlocked = Boolean(
    !passed ||
      !sampleOrderLinked ||
      !hasEvidence ||
      mirrorNum(snapshot.panel, 'pendingBatchCount') ||
      mirrorBool(snapshot.panel, 'blockerHandoff') ||
      mirrorBool(snapshot.aql, 'blockerHandoff') ||
      mirrorBool(snapshot.inspector, 'blockerHandoff') ||
      mirrorBool(snapshot.inspector, 'offlineOnly')
  );

  return {
    status: adapterStatus(issues),
    eventCreated: 'production.qc_recorded',
    nextOwnerLabel: passed ? 'Бренд' : 'Производство',
    issues,
    passed,
    defectTotal,
    criticalDefectCount,
    majorDefectCount,
    minorDefectCount,
    defectRecordCount: defects.length,
    completenessPct,
    shipmentBlocked: handoffBlocked,
    handoffBlocked,
    inspectorOffline: Boolean(mirrorBool(snapshot.inspector, 'offlineOnly')),
    needsException: !passed,
  };
}

export async function getPlatformCoreQcForArticle(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
}): Promise<PlatformCoreQcArticleResult> {
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();

  if (!collectionId || !articleId) {
    return { ok: false, reason: 'invalid_path', collectionId, articleId, storeMode };
  }

  const [record, defects, sampleOrders] = await Promise.all([
    getWorkshop2ServerDossierRecord(collectionId, articleId),
    listWorkshop2QcDefectsByArticle({ collectionId, articleId, limit: 50 }),
    listWorkshop2SampleOrders({ collectionId, articleId, organizationId: input.organizationId }),
  ]);

  if (!record?.dossier) {
    return { ok: false, reason: 'not_found', collectionId, articleId, storeMode };
  }

  const qc = buildSnapshot({
    collectionId,
    articleId,
    version: record.version ?? 0,
    updatedAt: record.updatedAt ?? new Date().toISOString(),
    dossier: record.dossier as DossierQcShape,
    defects: defectsFromRecords(defects),
    sampleOrders,
  });

  return {
    ok: true,
    collectionId,
    articleId,
    storeMode,
    version: qc.version,
    updatedAt: qc.updatedAt,
    qc,
    evaluation: evaluateQc(qc),
  };
}
