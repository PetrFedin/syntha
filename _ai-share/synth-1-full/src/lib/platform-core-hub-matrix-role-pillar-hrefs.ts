import {
  ROUTES,
  brandB2bOrderHandoffContextHref,
  brandB2bOrderHref,
  brandMessagesB2bOrderContextHref,
  brandDevelopmentCabinetHref,
  factoryProductionDossierHref,
  shopB2bTrackingOrderHref,
  shopMessagesB2bOrderContextHref,
  factoryMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import {
  brandLinesheetsHrefForDemo,
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs';
import { PLATFORM_CORE_HUB_ROWS } from '@/lib/platform-core-hub-matrix-rows-all';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  platformCoreNativeMatrixHref,
  platformCoreNativeShowroomHref,
} from '@/lib/platform-core-native-href';

/** Role×pillar demo href resolver (extracted from hub-matrix monster). */
export function getRolePillarDemoHrefForDemo(
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext
): string | undefined {
  const row = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === roleId);
  const cell = row?.pillars[pillarId];
  if (!row || cell?.kind !== 'active') return undefined;

  const { collectionId, demoOrderId, demoArticleId } = demo;
  const brandDevelopmentHref = brandDevelopmentCabinetHref(collectionId);
  const shopMatrixHref = isPlatformCoreMode()
    ? platformCoreNativeMatrixHref(collectionId, demoOrderId)
    : `${ROUTES.shop.b2bMatrix}?collection=${collectionId}`;
  const shopShowroomHref = isPlatformCoreMode()
    ? platformCoreNativeShowroomHref(collectionId, demoOrderId)
    : `${ROUTES.shop.b2bShowroom}?collection=${collectionId}`;
  const factoryDossierHref = factoryProductionDossierHref(demoArticleId, { collectionId });

  if (pillarId === 'development') {
    if (roleId === 'brand') return brandDevelopmentHref;
    if (roleId === 'manufacturer') return factoryDossierHref;
    if (roleId === 'supplier') return factoryMaterialsHrefForDemo(demo);
  }
  if (pillarId === 'sample_collection') {
    if (roleId === 'brand') return brandLinesheetsHrefForDemo(demo);
    if (roleId === 'shop') return shopShowroomHref;
  }
  if (pillarId === 'collection_order') {
    if (roleId === 'brand') return brandB2bOrderHref(demoOrderId);
    if (roleId === 'shop') return shopMatrixHref;
  }
  if (pillarId === 'order_production') {
    if (roleId === 'brand') return brandB2bOrderHandoffContextHref(demoOrderId);
    if (roleId === 'shop') return shopB2bTrackingOrderHref(demoOrderId);
    if (roleId === 'manufacturer') return factoryHandoffQueueHrefForDemo(demo);
    if (roleId === 'supplier') {
      return factoryMaterialsProcurementHrefForDemo(demo, { role: 'supplier' });
    }
  }
  if (pillarId === 'comms') {
    if (roleId === 'brand') return brandMessagesB2bOrderContextHref(demoOrderId);
    if (roleId === 'shop') return shopMessagesB2bOrderContextHref(demoOrderId);
    if (roleId === 'manufacturer') {
      return factoryMessagesB2bOrderContextHref(demoOrderId, { role: 'manufacturer' });
    }
    if (roleId === 'supplier') {
      return factoryMessagesB2bOrderContextHref(demoOrderId, { role: 'supplier' });
    }
  }
  return cell.actions[0]?.href;
}
