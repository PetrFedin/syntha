import 'server-only';

import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
} from '@/lib/platform-core-ports/dossier-store';
import {
  listWorkshop2MaterialRequisitions,
  type Workshop2MaterialRequisitionRecord,
} from '@/lib/platform-core-ports/material-requisitions';

export type PlatformCoreRfqGatewaySource =
  | 'workshop2_material_requisitions'
  | 'workshop2_dossier_bom';

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreRfqLine = {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  targetUnitPrice?: number;
  certificateRequired: boolean;
  status?: string;
};

export type PlatformCoreSupplierOffer = {
  supplierId: string;
  supplierName: string;
  lineId: string;
  unitPrice: number;
  leadTimeDays: number;
  certificateId?: string;
  source: 'vendor_bid' | 'supplier_offer';
};

export type PlatformCoreRfqSnapshot = {
  collectionId: string;
  articleId: string;
  rfqId: string;
  version: number;
  updatedAt: string;
  source: PlatformCoreRfqGatewaySource;
  lines: PlatformCoreRfqLine[];
  offers: PlatformCoreSupplierOffer[];
  vendorBidOfferCount: number;
  confirmedRequisitionLineIds: string[];
};

export type PlatformCoreRfqEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
  lineCount: number;
  offerCount: number;
  supplierCount: number;
  completenessPct: number;
  missingOfferLineIds: string[];
  bestOfferByLineId: Record<string, PlatformCoreSupplierOffer | undefined>;
};

export type PlatformCoreRfqArticleResult =
  | {
      ok: true;
      collectionId: string;
      articleId: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      version: number;
      updatedAt: string;
      rfq: PlatformCoreRfqSnapshot;
      evaluation: PlatformCoreRfqEvaluation;
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

function adapterStatus(issues: PlatformCoreAdapterIssue[]): PlatformCoreRfqEvaluation['status'] {
  if (issues.some((i) => i.severity === 'blocker')) return 'blocked';
  if (issues.some((i) => i.severity === 'warning')) return 'warning';
  return 'core_ready';
}

function certificateRequired(line: {
  certificateId?: string;
  certificateRef?: string;
  complianceCertificateId?: string;
}): boolean {
  return !line.certificateId && !line.certificateRef && !line.complianceCertificateId;
}

function linesFromRequisitions(
  requisitions: readonly Workshop2MaterialRequisitionRecord[]
): PlatformCoreRfqLine[] {
  return requisitions.map((req) => ({
    id: req.bomLineRef ?? req.id,
    materialName: req.materialLabel ?? req.bomLineRef ?? req.id,
    quantity: positiveNumber(req.quantity) ?? 0,
    unit: req.unit ?? 'm',
    certificateRequired: true,
    status: req.status,
  }));
}

function linesFromDossierBom(dossier: Workshop2DossierPhase1): PlatformCoreRfqLine[] {
  const materials = (dossier.productionModel?.materialLines ?? []).map((line, index) => ({
    id: line.id ?? `material-${index + 1}`,
    materialName: line.materialName ?? line.name ?? `Материал ${index + 1}`,
    quantity: positiveNumber(line.yieldPerUnit, line.consumption, line.quantity) ?? 0,
    unit: line.unit ?? 'm',
    targetUnitPrice: positiveNumber(line.landedCost, line.unitCostNet),
    certificateRequired: certificateRequired(line),
  }));
  const trims = (dossier.productionModel?.trimLines ?? []).map((line, index) => ({
    id: line.id ?? `trim-${index + 1}`,
    materialName: line.name ?? line.materialName ?? `Фурнитура ${index + 1}`,
    quantity: positiveNumber(line.quantity) ?? 0,
    unit: line.unit ?? 'pcs',
    targetUnitPrice: positiveNumber(line.landedCost, line.unitCostNet),
    certificateRequired: certificateRequired(line),
  }));
  return [...materials, ...trims];
}

function offersFromVendorBids(
  dossier: Workshop2DossierPhase1,
  lines: PlatformCoreRfqLine[]
): PlatformCoreSupplierOffer[] {
  const fallbackLineId = lines[0]?.id ?? 'line-1';
  return (dossier.bids ?? [])
    .filter((bid) => bid.status !== 'rejected')
    .map((bid, index) => {
      const supplierId = cleanString(bid.vendorId) ?? `vendor-${index + 1}`;
      const supplierName = cleanString(bid.vendorName) ?? supplierId;
      const rawPrice = positiveNumber(bid.cmtPrice) ?? 0;
      const qty = lines.find((l) => l.id === fallbackLineId)?.quantity ?? 1;
      return {
        supplierId,
        supplierName,
        lineId: fallbackLineId,
        unitPrice: qty > 0 ? rawPrice / qty : rawPrice,
        leadTimeDays: positiveNumber(bid.leadTimeDays) ?? 21,
        source: 'vendor_bid' as const,
      };
    })
    .filter((o) => o.unitPrice > 0);
}

function evaluateRfq(snapshot: PlatformCoreRfqSnapshot): PlatformCoreRfqEvaluation {
  const issues: PlatformCoreAdapterIssue[] = [];
  const { lines, offers } = snapshot;

  if (!lines.length) {
    issues.push({
      id: 'rfq.lines.empty',
      severity: 'blocker',
      message: 'RFQ без строк материалов.',
    });
  }

  const bestOfferByLineId: Record<string, PlatformCoreSupplierOffer | undefined> = {};
  const missingOfferLineIds: string[] = [];

  for (const line of lines) {
    const lineOffers = offers
      .filter((o) => o.lineId === line.id)
      .sort((a, b) => a.unitPrice - b.unitPrice || a.leadTimeDays - b.leadTimeDays);
    bestOfferByLineId[line.id] = lineOffers[0];
    if (!lineOffers[0]) missingOfferLineIds.push(line.id);
    if (lineOffers[0] && line.certificateRequired && !lineOffers[0].certificateId) {
      issues.push({
        id: `rfq.certificate.missing.${line.id}`,
        severity: 'warning',
        message: `Лучшее предложение по ${line.materialName} без сертификата.`,
      });
    }
    if (line.quantity <= 0) {
      issues.push({
        id: `rfq.quantity.missing.${line.id}`,
        severity: 'warning',
        message: `Не задано количество для ${line.materialName}.`,
      });
    }
  }

  if (missingOfferLineIds.length) {
    issues.push({
      id: 'rfq.offers.missing',
      severity: 'warning',
      message: 'Не по всем материалам есть предложения поставщиков.',
    });
  }

  if (snapshot.vendorBidOfferCount > 0) {
    issues.push({
      id: 'rfq.vendor_bid.not_material_specific',
      severity: 'warning',
      message: 'Часть предложений из vendor bids — не material-specific RFQ.',
    });
  }

  const lineCount = lines.length;
  const offerCount = offers.length;
  const linesWithQty = lines.filter((l) => l.quantity > 0).length;
  const linesWithOffer = new Set(offers.map((o) => o.lineId)).size;
  const completenessPct =
    lineCount === 0
      ? 0
      : Math.round(
          Math.min(
            100,
            (linesWithQty / lineCount) * 35 +
              (linesWithOffer / lineCount) * 45 +
              (offerCount ? 20 : 0)
          )
        );

  return {
    status: adapterStatus(issues),
    eventCreated: 'supplier.offer_received',
    nextOwnerLabel: 'Поставщик',
    issues,
    lineCount,
    offerCount,
    supplierCount: new Set(offers.map((o) => o.supplierId)).size,
    completenessPct,
    missingOfferLineIds,
    bestOfferByLineId,
  };
}

export async function getPlatformCoreRfqForArticle(input: {
  collectionId: string;
  articleId: string;
  organizationId?: string;
}): Promise<PlatformCoreRfqArticleResult> {
  const collectionId = input.collectionId?.trim();
  const articleId = input.articleId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();

  if (!collectionId || !articleId) {
    return { ok: false, reason: 'invalid_path', collectionId, articleId, storeMode };
  }

  const [record, requisitions] = await Promise.all([
    getWorkshop2ServerDossierRecord(collectionId, articleId),
    listWorkshop2MaterialRequisitions({
      collectionId,
      articleId,
      organizationId: input.organizationId,
    }),
  ]);

  if (!record?.dossier) {
    return { ok: false, reason: 'not_found', collectionId, articleId, storeMode };
  }

  const dossier = record.dossier as Workshop2DossierPhase1;
  const reqLines = linesFromRequisitions(requisitions);
  const bomLines = linesFromDossierBom(dossier);
  const lines = reqLines.length ? reqLines : bomLines;
  const offers = offersFromVendorBids(dossier, lines);

  const rfq: PlatformCoreRfqSnapshot = {
    collectionId,
    articleId,
    rfqId: `rfq-${collectionId}-${articleId}`,
    version: record.version ?? 0,
    updatedAt: record.updatedAt ?? new Date().toISOString(),
    source: reqLines.length ? 'workshop2_material_requisitions' : 'workshop2_dossier_bom',
    lines,
    offers,
    vendorBidOfferCount: offers.filter((o) => o.source === 'vendor_bid').length,
    confirmedRequisitionLineIds: reqLines
      .filter((l) => l.status === 'supplier_confirmed')
      .map((l) => l.id),
  };

  return {
    ok: true,
    collectionId,
    articleId,
    storeMode,
    version: rfq.version,
    updatedAt: rfq.updatedAt,
    rfq,
    evaluation: evaluateRfq(rfq),
  };
}
