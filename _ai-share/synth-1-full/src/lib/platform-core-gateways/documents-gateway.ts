import 'server-only';

import {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
} from '@/lib/platform-core-ports/dossier-store';
import { getWorkshop2B2bOrder } from '@/lib/platform-core-ports/b2b-orders';

export type PlatformCoreDocumentKind =
  | 'tech_pack'
  | 'bom'
  | 'certificate'
  | 'packing_list'
  | 'asn'
  | 'closing_doc';

export type PlatformCoreDocumentStage = 'development' | 'handoff' | 'shipment' | 'closeout';

export type PlatformCoreDocumentsGatewaySource = 'workshop2_dossier_vault' | 'workshop2_b2b_order';

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreDocumentPacketItem = {
  id: string;
  kind: PlatformCoreDocumentKind;
  title: string;
  storagePath?: string;
  ownerRole?: string;
};

export type PlatformCoreDocumentsSnapshot = {
  collectionId: string;
  articleId: string;
  orderId?: string;
  entityId: string;
  stage: PlatformCoreDocumentStage;
  version: number;
  updatedAt: string;
  source: PlatformCoreDocumentsGatewaySource;
  documents: PlatformCoreDocumentPacketItem[];
  indexMirror?: {
    state?: 'empty' | 'partial' | 'ready';
    blockerExport?: boolean;
    vaultDocCount?: number;
    vaultIndexedCount?: number;
    hintRu?: string;
  };
};

export type PlatformCoreDocumentsEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
  presentKinds: PlatformCoreDocumentKind[];
  missingKinds: PlatformCoreDocumentKind[];
  documentCount: number;
  documentsWithStorageCount: number;
  readyForExport: boolean;
  shipmentBlocked: boolean;
  handoffBlocked: boolean;
  completenessPct: number;
};

export type PlatformCoreDocumentsArticleResult =
  | {
      ok: true;
      collectionId: string;
      articleId: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      version: number;
      updatedAt: string;
      documents: PlatformCoreDocumentsSnapshot;
      evaluation: PlatformCoreDocumentsEvaluation;
    }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      collectionId?: string;
      articleId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
    };

const REQUIRED_BY_STAGE: Record<PlatformCoreDocumentStage, readonly PlatformCoreDocumentKind[]> = {
  development: ['tech_pack', 'bom'],
  handoff: ['tech_pack', 'bom', 'certificate'],
  shipment: ['tech_pack', 'bom', 'certificate', 'packing_list', 'asn'],
  closeout: ['packing_list', 'asn', 'closing_doc'],
};

type VaultDoc = {
  id: string;
  type?: string;
  title?: string;
  fileUrl?: string;
  storagePath?: string;
  metadata?: Record<string, unknown> | null;
};

type DossierDocumentsShape = {
  vaultDocuments?: readonly VaultDoc[];
  finalTzDocumentLastExport?: { exportedAt?: string; href?: string; storagePath?: string };
  productionTzLastExport?: { exportedAt?: string; href?: string; storagePath?: string };
  productionModel?: { materialLines?: readonly unknown[] };
  logisticsShipmentMirror?: { shipmentCount?: number; currentStep?: string };
  documentsIndexMirror?: {
    state?: 'empty' | 'partial' | 'ready';
    blockerExport?: boolean;
    vaultDocCount?: number;
    vaultIndexedCount?: number;
    hintRu?: string;
  };
};

type OrderShape = {
  id: string;
  lines: readonly {
    articleId?: string;
    collectionId?: string;
    qty?: number;
    deliveryDate?: string;
  }[];
};

function cleanString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function parseStage(v: unknown): PlatformCoreDocumentStage {
  const s = cleanString(v);
  if (s === 'development' || s === 'handoff' || s === 'shipment' || s === 'closeout') return s;
  return 'handoff';
}

function adapterStatus(
  issues: PlatformCoreAdapterIssue[]
): PlatformCoreDocumentsEvaluation['status'] {
  if (issues.some((i) => i.severity === 'blocker')) return 'blocked';
  if (issues.some((i) => i.severity === 'warning')) return 'warning';
  return 'core_ready';
}

function documentKindFromText(text: string): PlatformCoreDocumentKind | null {
  const haystack = text.toLowerCase();
  if (/packing|упаков|лист комплектац/.test(haystack)) return 'packing_list';
  if (/asn|856|advance ship|уведомлен.*отгруз|отгруз/.test(haystack)) return 'asn';
  if (/сертифик|certificate/.test(haystack)) return 'certificate';
  if (/bom|спецификац|материал/.test(haystack)) return 'bom';
  if (/tech.?pack|тз|тех/.test(haystack)) return 'tech_pack';
  if (/упд|ттн|акт|счет|invoice|closing/.test(haystack)) return 'closing_doc';
  return null;
}

function vaultStoragePath(doc: VaultDoc): string | undefined {
  return (
    cleanString(doc.storagePath) ??
    cleanString(doc.fileUrl) ??
    cleanString(
      typeof doc.metadata?.storagePath === 'string' ? doc.metadata.storagePath : undefined
    )
  );
}

function documentsFromVault(dossier: DossierDocumentsShape): PlatformCoreDocumentPacketItem[] {
  return (dossier.vaultDocuments ?? []).flatMap((doc) => {
    const metadataKind = typeof doc.metadata?.kind === 'string' ? doc.metadata.kind : '';
    const kind =
      documentKindFromText(`${doc.type ?? ''} ${metadataKind} ${doc.title ?? ''}`) ??
      (doc.type === 'certificate' ? 'certificate' : null);
    if (!kind) return [];
    return [
      {
        id: doc.id,
        kind,
        title: cleanString(doc.title) ?? doc.id,
        storagePath: vaultStoragePath(doc),
        ownerRole: kind === 'certificate' ? 'supplier' : 'brand',
      },
    ];
  });
}

function buildPacketItems(input: {
  dossier: DossierDocumentsShape;
  order?: OrderShape | null;
}): PlatformCoreDocumentPacketItem[] {
  const docs = documentsFromVault(input.dossier);
  if (input.dossier.productionTzLastExport || input.dossier.finalTzDocumentLastExport) {
    docs.push({
      id: 'dossier-tech-pack-export',
      kind: 'tech_pack',
      title: 'Production tech pack export',
      storagePath:
        cleanString(input.dossier.productionTzLastExport?.storagePath) ??
        cleanString(input.dossier.finalTzDocumentLastExport?.storagePath) ??
        'dossier:tech-pack-export',
      ownerRole: 'brand',
    });
  }
  if ((input.dossier.productionModel?.materialLines ?? []).length > 0) {
    docs.push({
      id: 'dossier-production-bom',
      kind: 'bom',
      title: 'Production BOM',
      storagePath: 'dossier:production-model-bom',
      ownerRole: 'brand',
    });
  }
  if (input.order && input.order.lines.length > 0) {
    docs.push({
      id: `packing-list-${input.order.id}`,
      kind: 'packing_list',
      title: 'Packing list from order lines',
      storagePath: `order:${input.order.id}:lines`,
      ownerRole: 'manufacturer',
    });
  }
  if (input.order && (input.dossier.logisticsShipmentMirror?.shipmentCount ?? 0) > 0) {
    docs.push({
      id: `asn-${input.order.id}`,
      kind: 'asn',
      title: 'ASN from logistics journal',
      storagePath: `dossier:logistics:${input.dossier.logisticsShipmentMirror?.currentStep ?? 'journal'}`,
      ownerRole: 'manufacturer',
    });
  }
  return docs;
}

function evaluateDocuments(
  snapshot: PlatformCoreDocumentsSnapshot
): PlatformCoreDocumentsEvaluation {
  const issues: PlatformCoreAdapterIssue[] = [];
  const { documents, stage, indexMirror } = snapshot;
  const presentKinds = [...new Set(documents.map((d) => d.kind))];
  const requiredKinds = REQUIRED_BY_STAGE[stage];
  const missingKinds = requiredKinds.filter((kind) => !presentKinds.includes(kind));
  const missingStorage = documents.filter((d) => !d.storagePath?.trim()).map((d) => d.id);

  if (!documents.length) {
    issues.push({
      id: 'documents.snapshot.empty',
      severity: stage === 'development' ? 'warning' : 'blocker',
      message: 'Нет документов в Platform Core packet snapshot.',
    });
  }
  if (missingKinds.length) {
    issues.push({
      id: 'documents.required.missing',
      severity: stage === 'development' ? 'warning' : 'blocker',
      message: `Не хватает документов: ${missingKinds.join(', ')}.`,
    });
  }
  if (missingStorage.length) {
    issues.push({
      id: 'documents.storage.missing',
      severity: 'warning',
      message: 'Есть документы без storagePath: они не попадут в пакет.',
    });
  }
  if (indexMirror?.blockerExport) {
    issues.push({
      id: 'documents.index.empty',
      severity: 'warning',
      message:
        indexMirror.hintRu ?? 'Индекс документов пуст — ZIP может не содержать vault-файлов.',
    });
  } else if (indexMirror?.state === 'partial') {
    issues.push({
      id: 'documents.index.partial',
      severity: 'warning',
      message:
        indexMirror.hintRu ?? 'Часть vault-записей без storage_path — не попадут в export packet.',
    });
  }

  const documentCount = documents.length;
  const documentsWithStorageCount = documents.filter((d) => d.storagePath?.trim()).length;
  const readyForExport =
    missingKinds.length === 0 && missingStorage.length === 0 && !indexMirror?.blockerExport;

  const checks = [
    documentCount > 0,
    missingKinds.length === 0,
    missingStorage.length === 0,
    indexMirror?.state !== 'empty',
    indexMirror?.blockerExport !== true,
  ];
  const completenessPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  const handoffBlocked = Boolean(
    missingKinds.some((k) => REQUIRED_BY_STAGE.handoff.includes(k)) ||
    indexMirror?.blockerExport ||
    (stage !== 'development' && !documents.length)
  );
  const shipmentBlocked = Boolean(
    handoffBlocked ||
    missingKinds.some((k) => REQUIRED_BY_STAGE.shipment.includes(k)) ||
    (stage === 'shipment' && issues.some((i) => i.severity === 'blocker'))
  );

  return {
    status: adapterStatus(issues),
    eventCreated: 'document.packet_ready',
    nextOwnerLabel: stage === 'closeout' ? 'Магазин' : 'Бренд',
    issues,
    presentKinds,
    missingKinds,
    documentCount,
    documentsWithStorageCount,
    readyForExport,
    shipmentBlocked,
    handoffBlocked,
    completenessPct,
  };
}

export async function getPlatformCoreDocumentsForArticle(input: {
  collectionId: string;
  articleId: string;
  stage?: PlatformCoreDocumentStage | string;
  orderId?: string;
}): Promise<PlatformCoreDocumentsArticleResult> {
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  const stage = parseStage(input.stage);
  const storeMode = getWorkshop2ServerDossierStoreMode();

  if (!collectionId || !articleId) {
    return { ok: false, reason: 'invalid_path', collectionId, articleId, storeMode };
  }

  const orderId = cleanString(input.orderId);
  const [record, order] = await Promise.all([
    getWorkshop2ServerDossierRecord(collectionId, articleId),
    orderId ? getWorkshop2B2bOrder(orderId) : Promise.resolve(null),
  ]);

  if (!record?.dossier) {
    return { ok: false, reason: 'not_found', collectionId, articleId, storeMode };
  }

  const dossier = record.dossier as DossierDocumentsShape;
  const orderShape = order as OrderShape | null;
  const documents = buildPacketItems({ dossier, order: orderShape });

  const snapshot: PlatformCoreDocumentsSnapshot = {
    collectionId,
    articleId,
    orderId: orderShape?.id,
    entityId: orderShape?.id ?? articleId,
    stage,
    version: record.version ?? 0,
    updatedAt: record.updatedAt ?? new Date().toISOString(),
    source: orderShape ? 'workshop2_b2b_order' : 'workshop2_dossier_vault',
    documents,
    indexMirror: dossier.documentsIndexMirror,
  };

  return {
    ok: true,
    collectionId,
    articleId,
    storeMode,
    version: snapshot.version,
    updatedAt: snapshot.updatedAt,
    documents: snapshot,
    evaluation: evaluateDocuments(snapshot),
  };
}
