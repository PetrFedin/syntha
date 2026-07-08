import type { BrandDossierFactoryDiffRow } from '@/lib/fashion/brand-dossier-factory-diff-stub';
import { summarizeBrandDossierFactoryDiffRu } from '@/lib/fashion/brand-dossier-factory-diff-stub';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import { summarizeWorkshop2FactoryHandoffBundleStatus } from '@/lib/production/workshop2-factory-handoff-bundle-status';
import type { Workshop2FactoryHandoffBundleStatus } from '@/lib/production/workshop2-factory-handoff-bundle-status';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { getWorkshop2ServerDossierRecord } from '@/lib/server/workshop2-phase1-dossier-server-store';

export type BrandDossierFactoryDiffServerResult = {
  ok: boolean;
  live: boolean;
  collectionId: string;
  articleId: string;
  dossierVersion?: number;
  summaryRu: string;
  rows: BrandDossierFactoryDiffRow[];
  storageMode: 'pg' | 'file' | 'stub';
};

function bomLineCount(dossier: Workshop2DossierPhase1): number {
  const fromMirror = workshop2PgMirrorNum(dossier.bomNodesMirror, 'materialLineCount');
  if (fromMirror > 0) return fromMirror;
  const materials = dossier.productionModel?.materialLines ?? [];
  return materials.length;
}

function compositionRu(dossier: Workshop2DossierPhase1): string {
  const main = dossier.productionModel?.materialLines?.find(
    (m) => m.role === 'main' || m.isPrimary
  );
  if (main?.compositionText?.trim()) return main.compositionText.trim();
  const named = (dossier.productionModel?.materialLines ?? [])
    .map((m) => m.compositionText?.trim() || m.materialName?.trim())
    .filter(Boolean)
    .slice(0, 2);
  return named.length ? named.join(' · ') : '—';
}

function sizeScaleRu(dossier: Workshop2DossierPhase1): string {
  const scaleId = dossier.sampleSizeScaleId?.trim();
  if (scaleId) return scaleId;
  const grading = workshop2PgMirrorStr(dossier.gradingApplyMirror, 'sizeScaleLabel');
  return grading || '—';
}

function routingRu(dossier: Workshop2DossierPhase1): string {
  const ops =
    dossier.smartRoutingSequence?.length ??
    dossier.routingSteps?.length ??
    dossier.productionModel?.operations?.length ??
    0;
  if (ops <= 0) return '—';
  const handoff = summarizeWorkshop2FactoryHandoffBundleStatus(dossier);
  if (handoff?.state === 'acknowledged') return `${ops} операций · factory-ack`;
  return `${ops} операций`;
}

function factoryColumnValue(
  brandValue: string,
  handoffState: Workshop2FactoryHandoffBundleStatus['state']
): string {
  if (handoffState === 'acknowledged') {
    if (brandValue === '—') return brandValue;
    const base = brandValue
      .replace(/\s*\(read-only\)\s*$/i, '')
      .replace(/\s*· factory-ack\s*$/i, '');
    return `${base} (read-only)`;
  }
  if (handoffState === 'dispatched') return 'ожидает factory-ack';
  if (handoffState === 'draft') return 'черновик handoff';
  return 'не передано в цех';
}

function buildLiveRows(dossier: Workshop2DossierPhase1): BrandDossierFactoryDiffRow[] {
  const handoff = summarizeWorkshop2FactoryHandoffBundleStatus(dossier);
  const handoffState = handoff?.state ?? 'none';

  const specs: Array<{
    id: string;
    labelRu: string;
    brandValueRu: string;
  }> = [
    {
      id: 'bom-lines',
      labelRu: 'BOM · строк',
      brandValueRu: String(bomLineCount(dossier)),
    },
    {
      id: 'composition',
      labelRu: 'Состав',
      brandValueRu: compositionRu(dossier),
    },
    {
      id: 'size-scale',
      labelRu: 'Размерная шкала',
      brandValueRu: sizeScaleRu(dossier),
    },
    {
      id: 'routing',
      labelRu: 'Маршрут',
      brandValueRu: routingRu(dossier),
    },
  ];

  return specs.map((spec) => {
    const factoryValueRu = factoryColumnValue(spec.brandValueRu, handoffState);
    const matched =
      handoffState === 'acknowledged' &&
      factoryValueRu.replace(/\s*\(read-only\)\s*$/i, '').trim() ===
        spec.brandValueRu.replace(/\s*· factory-ack\s*$/i, '').trim();
    return {
      id: spec.id,
      labelRu: spec.labelRu,
      brandValueRu: spec.brandValueRu,
      factoryValueRu,
      matched,
    };
  });
}

export async function resolveBrandDossierFactoryDiff(input: {
  collectionId: string;
  articleId: string;
}): Promise<BrandDossierFactoryDiffServerResult> {
  const collectionId = input.collectionId.trim();
  const articleId = input.articleId.trim();
  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);

  if (!record?.dossier) {
    return {
      ok: false,
      live: false,
      collectionId,
      articleId,
      summaryRu: 'Досье не найдено в PG — показан демо-stub.',
      rows: [],
      storageMode: 'stub',
    };
  }

  const rows = buildLiveRows(record.dossier);
  const storageMode: BrandDossierFactoryDiffServerResult['storageMode'] =
    isWorkshop2PostgresEnabled() ? 'pg' : 'file';

  return {
    ok: true,
    live: true,
    collectionId,
    articleId,
    dossierVersion: record.version,
    summaryRu: summarizeBrandDossierFactoryDiffRu(rows),
    rows,
    storageMode,
  };
}
