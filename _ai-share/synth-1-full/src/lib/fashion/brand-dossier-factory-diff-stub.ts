import {
  brandW2ProductionTzHref,
  factoryProductionDossierContextHref,
} from '@/lib/routes';

export type BrandDossierFactoryDiffRow = {
  id: string;
  labelRu: string;
  brandValueRu: string;
  factoryValueRu: string;
  matched: boolean;
};

/** Read-only stub rows: brand W2 dossier vs factory dossier mirror (Platform Core demo). */
export function buildBrandDossierFactoryDiffStubRows(input: {
  collectionId: string;
  articleId: string;
}): BrandDossierFactoryDiffRow[] {
  const { collectionId, articleId } = input;
  void collectionId;
  void articleId;
  return [
    {
      id: 'bom-lines',
      labelRu: 'BOM · строк',
      brandValueRu: '12',
      factoryValueRu: '12',
      matched: true,
    },
    {
      id: 'composition',
      labelRu: 'Состав',
      brandValueRu: '98% хлопок · 2% эластан',
      factoryValueRu: '98% хлопок · 2% эластан',
      matched: true,
    },
    {
      id: 'size-scale',
      labelRu: 'Размерная шкала',
      brandValueRu: 'EU 36–48',
      factoryValueRu: 'EU 36–48 (read-only)',
      matched: true,
    },
    {
      id: 'routing',
      labelRu: 'Маршрут',
      brandValueRu: '7 операций',
      factoryValueRu: '7 операций · factory-ack',
      matched: true,
    },
  ];
}

export function summarizeBrandDossierFactoryDiffRu(rows: readonly BrandDossierFactoryDiffRow[]): string {
  const mismatches = rows.filter((r) => !r.matched).length;
  if (mismatches === 0) {
    return `Сверка с досье цеха: ${rows.length} полей совпадают (read-only).`;
  }
  return `Сверка с досье цеха: ${mismatches} расхождений из ${rows.length} полей.`;
}

export function buildBrandDossierFactoryDiffPeerHrefs(input: {
  collectionId: string;
  articleId: string;
  orderId?: string;
}): { brandTzHref: string; factoryDossierHref: string } {
  const { collectionId, articleId, orderId } = input;
  return {
    brandTzHref: brandW2ProductionTzHref(collectionId, articleId),
    factoryDossierHref: factoryProductionDossierContextHref(articleId, {
      collectionId,
      orderId,
    }),
  };
}
