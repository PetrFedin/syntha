import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { ROUTES } from '@/lib/routes';

export type BrandSupplierBomSession = {
  collectionId: string;
  articleId: string;
  bomHref: string;
  procurementHref: string;
  centricRfqHref: string;
  materialPassportHref: string;
  supplierForecastHref: string;
};

export function brandSupplierBomFeatureHref(
  featureId: 'bom' | 'procurement',
  collectionId?: string,
  articleId?: string
): string {
  const session = buildBrandSupplierBomSession({ collectionId, articleId });
  return featureId === 'bom' ? session.bomHref : session.procurementHref;
}

export function buildBrandSupplierBomSession(input?: {
  collectionId?: string;
  articleId?: string;
}): BrandSupplierBomSession {
  const collectionId = input?.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const rfqBase = `${ROUTES.brand.suppliersRfq}?collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;

  return {
    collectionId,
    articleId,
    bomHref: `${rfqBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=bom`,
    procurementHref: `${rfqBase}&${PILLAR_CAPABILITY_FEATURE_PARAM}=procurement`,
    centricRfqHref: `${ROUTES.brand.integrationsCentric}?${PILLAR_CAPABILITY_FEATURE_PARAM}=rfq&collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`,
    materialPassportHref: `${ROUTES.brand.fabricPassportRollup}?${PILLAR_CAPABILITY_FEATURE_PARAM}=rollup&collection=${encodeURIComponent(collectionId)}`,
    supplierForecastHref: `${EXTENDED_ROUTES.factory.supplierMessages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=forecast&collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`,
  };
}
