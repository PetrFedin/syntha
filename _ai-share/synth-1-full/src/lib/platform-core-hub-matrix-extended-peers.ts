/**
 * Cross-role peer href resolution для extended ролей (manufacturer / supplier).
 * Baseline hub-matrix импортирует только эту функцию — не extended-routes напрямую.
 */
import {
  brandB2bOrderHref,
  brandDevelopmentCabinetHref,
  brandMessagesB2bOrderContextHref,
  brandW2ProductionTzHref,
  ROUTES,
  shopB2bOrderHref,
  shopB2bTrackingOrderHref,
  shopMessagesB2bOrderContextHref,
} from '@/lib/platform-core-routes';
import type { PlatformCoreDemoContext } from '@/lib/platform-core-demo-context';
import {
  factoryMessagesB2bOrderContextHref,
  factoryProductionDossierHref,
  factorySupplierMessagesB2bOrderContextHref,
} from '@/lib/platform-core-extended-routes';
import {
  brandLinesheetsHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs';
import {
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
} from '@/lib/platform-core-hub-matrix-demo-hrefs-extended';
import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix.types';

const EXTENDED_ROLES = new Set<CoreChainRoleId>(['manufacturer', 'supplier']);

export function isExtendedCoreRole(roleId: CoreChainRoleId): boolean {
  return EXTENDED_ROLES.has(roleId);
}

/** Рабочий экран peer-роли с учётом viewer — extended-ветки (manufacturer/supplier). */
export function getExtendedCrossRolePeerDemoHrefForDemo(
  viewerRoleId: CoreChainRoleId,
  peerRoleId: CoreChainRoleId,
  pillarId: CoreHubPillarId,
  demo: PlatformCoreDemoContext
): string | undefined {
  const orderId = demo.demoOrderId.trim();

  if (pillarId === 'comms') {
    if (viewerRoleId === 'brand' && peerRoleId === 'manufacturer') {
      return factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
    }
    if (viewerRoleId === 'brand' && peerRoleId === 'supplier') {
      return factorySupplierMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'shop' && peerRoleId === 'manufacturer') {
      return factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
    }
    if (viewerRoleId === 'shop' && peerRoleId === 'supplier') {
      return factorySupplierMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'manufacturer' && peerRoleId === 'brand') {
      return brandMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'manufacturer' && peerRoleId === 'shop') {
      return shopMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'manufacturer' && peerRoleId === 'supplier') {
      return factorySupplierMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'supplier' && peerRoleId === 'brand') {
      return brandMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'supplier' && peerRoleId === 'shop') {
      return shopMessagesB2bOrderContextHref(orderId);
    }
    if (viewerRoleId === 'supplier' && peerRoleId === 'manufacturer') {
      return factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
    }
  }

  if (pillarId === 'order_production') {
    if (viewerRoleId === 'brand' && peerRoleId === 'manufacturer') {
      return factoryHandoffQueueHrefForDemo(demo);
    }
    if (viewerRoleId === 'shop' && peerRoleId === 'manufacturer') {
      return factoryHandoffQueueHrefForDemo(demo);
    }
    if (
      viewerRoleId === 'brand' &&
      peerRoleId === 'manufacturer' &&
      pillarId === 'order_production'
    ) {
      return factoryHandoffQueueHrefForDemo(demo);
    }
    if (
      viewerRoleId === 'manufacturer' &&
      peerRoleId === 'supplier' &&
      pillarId === 'order_production'
    ) {
      return factoryMaterialsProcurementHrefForDemo(demo, { role: 'manufacturer' });
    }
    if (
      viewerRoleId === 'supplier' &&
      peerRoleId === 'manufacturer' &&
      pillarId === 'order_production'
    ) {
      return factoryHandoffQueueHrefForDemo(demo);
    }
  }

  if (pillarId === 'collection_order') {
    if (viewerRoleId === 'manufacturer' && peerRoleId === 'brand') {
      return brandB2bOrderHref(orderId);
    }
    if (viewerRoleId === 'manufacturer' && peerRoleId === 'shop') {
      return shopB2bTrackingOrderHref(orderId);
    }
    if (viewerRoleId === 'supplier' && peerRoleId === 'brand') {
      return brandB2bOrderHref(orderId);
    }
    if (viewerRoleId === 'supplier' && peerRoleId === 'shop') {
      return shopB2bOrderHref(orderId);
    }
  }

  if (pillarId === 'development') {
    const dossierHref = factoryProductionDossierHref(demo.demoArticleId, {
      collectionId: demo.collectionId,
    });
    if (viewerRoleId === 'brand' && peerRoleId === 'manufacturer') return dossierHref;
    if (viewerRoleId === 'brand' && peerRoleId === 'supplier') {
      return factoryMaterialsHrefForDemo(demo);
    }
    if (viewerRoleId === 'shop' && peerRoleId === 'manufacturer') return dossierHref;
    if (viewerRoleId === 'shop' && peerRoleId === 'supplier') {
      return factoryMaterialsHrefForDemo(demo);
    }
    if (viewerRoleId === 'manufacturer' && peerRoleId === 'brand') {
      return brandDevelopmentCabinetHref(demo.collectionId);
    }
    if (viewerRoleId === 'supplier' && peerRoleId === 'brand') {
      return brandW2ProductionTzHref(demo.collectionId, demo.demoArticleId);
    }
  }

  return undefined;
}

/** Demo trail step: досье цеха (extended chain visualization). */
export function factoryDossierHrefForDemo(demo: PlatformCoreDemoContext): string {
  return factoryProductionDossierHref(demo.demoArticleId, { collectionId: demo.collectionId });
}

export { factoryHandoffQueueHrefForDemo } from '@/lib/platform-core-hub-matrix-demo-hrefs-extended';
