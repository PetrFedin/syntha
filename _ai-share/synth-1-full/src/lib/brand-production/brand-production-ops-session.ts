import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { buildBrandProductionHandoffSession } from '@/lib/brand-production/brand-production-handoff';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { ROUTES } from '@/lib/routes';

export type BrandProductionOpsSession = ReturnType<typeof buildBrandProductionOpsSession>;

export function buildBrandProductionOpsSession(input?: {
  orderId?: string;
  collectionId?: string;
  factoryId?: string;
  articleId?: string;
}) {
  const handoff = buildBrandProductionHandoffSession(input);
  const collectionId = handoff.collectionId;
  const articleId = input?.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId;
  const supplierBomHref = `${EXTENDED_ROUTES.factory.supplierMessages}?${PILLAR_CAPABILITY_FEATURE_PARAM}=bom&collection=${encodeURIComponent(collectionId)}&article=${encodeURIComponent(articleId)}`;
  const factoryMaterialsHref = `${EXTENDED_ROUTES.factory.productionMaterials}?factoryId=${encodeURIComponent(input?.factoryId?.trim() || PLATFORM_CORE_DEMO.factoryId)}&order=${encodeURIComponent(handoff.orderId)}&collection=${encodeURIComponent(collectionId)}`;

  return {
    ...handoff,
    operationsTabHref: `${ROUTES.brand.productionOperations}?order=${encodeURIComponent(handoff.orderId)}&collection=${encodeURIComponent(collectionId)}&${PILLAR_CAPABILITY_FEATURE_PARAM}=operations`,
    supplierBomHref,
    factoryMaterialsHref,
    w2ArticlePoHref: workshop2ArticleHref(collectionId, articleId, { w2pane: 'plan', w2sec: 'po' }),
  };
}
