import 'server-only';

import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  getPlatformCoreDemo,
  getPlatformCoreCollectionLabel,
  getPlatformCoreHubRowsForUi,
  getPrimaryPillarHrefForDemo,
  isPlatformCoreEmptyChainCollection,
  PLATFORM_CORE_DEMO,
  PLATFORM_CORE_PILLARS,
} from '@/lib/platform-core-hub-matrix';
import { resolveB2bChainStatusUnified } from '@/lib/integrations/spine/operational-import-handoff.service';
import { resolveSpineActiveWholesaleOrderIdServer } from '@/lib/integrations/spine/spine-active-order.server';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import {
  isPlatformCoreDemoPinOrderId,
  isPlatformCorePgCheckoutOrderId,
} from '@/lib/platform-core-spine-active-order-fallback';
import { getWorkshop2DevelopmentStatus } from '@/lib/server/workshop2-development-status';
import { getWorkshop2SampleCollectionStatus } from '@/lib/server/workshop2-sample-collection-status';
import { listWorkshop2FactoryProductionHandoffQueue } from '@/lib/server/workshop2-b2b-production-handoff';
import { getWorkshop2B2bOrder } from '@/lib/server/workshop2-b2b-orders-repository';
import { getImportedOrderRecordForOperationalUi } from '@/lib/integrations/spine/imported-orders-read.server';
import {
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { listWorkshop2ContextualMessageThreads } from '@/lib/server/workshop2-contextual-messages-repository';
import {
  getCachedPlatformCoreChainOverview,
  isPlatformCoreChainOverviewCacheFresh,
  schedulePlatformCoreChainOverviewRefresh,
  setCachedPlatformCoreChainOverview,
} from '@/lib/server/platform-core-chain-overview-cache';
import { isWorkshop2PgConnectionError } from '@/lib/server/workshop2-pg-pool';

export type PlatformCorePillarSnapshot = {
  id: CoreHubPillarId;
  title: string;
  done: boolean;
  detailRu: string;
  primaryHref: string;
};

export type PlatformCoreRoleSnapshot = {
  id: CoreChainRoleId;
  label: string;
  landingHref: string;
  activePillarCount: number;
  participatesIn: CoreHubPillarId[];
};

export type PlatformCoreChainOverview = {
  collectionId: string;
  demoOrderId: string;
  demoArticleId: string;
  demoBuyerId?: string;
  pillars: PlatformCorePillarSnapshot[];
  roles: PlatformCoreRoleSnapshot[];
  commsThreadCount: number;
};

function formatChainOrderDetailRu(input: {
  orderId: string;
  collectionId: string;
  status?: string;
}): string {
  const id = input.orderId.trim();
  const col = getPlatformCoreCollectionLabel(input.collectionId);
  if (!id || isPlatformCoreDemoPinOrderId(id)) {
    return `Коллекция ${col} · ожидает оптовый заказ`;
  }
  const status = input.status?.trim();
  if (isPlatformCorePgCheckoutOrderId(id)) {
    return status ? `Оптовый заказ · ${col} · ${status}` : `Оптовый заказ · ${col} · PG`;
  }
  if (isIntegrationImportedWholesaleOrderId(id)) {
    return status ? `Импорт · ${col} · ${status}` : `Импорт · ${col}`;
  }
  return status ? `Заказ · ${col} · ${status}` : `Заказ · ${col}`;
}

function formatCommsDetailRu(orderId: string, messageCount: number): string {
  const id = orderId.trim();
  if (!id || isPlatformCoreDemoPinOrderId(id)) {
    return messageCount > 0
      ? `${messageCount} сообщ. в треде заказа`
      : 'Нет активного треда заказа';
  }
  return `${messageCount} сообщ. в треде заказа`;
}

/** Сообщения в B2B-треде активного wholesale-заказа (не глобальный счётчик). */
async function countOrderContextMessages(orderId: string): Promise<number> {
  const id = orderId.trim();
  if (!id) return 0;
  try {
    const threads = await listWorkshop2ContextualMessageThreads({
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      contextId: workshop2B2bOrderContextId(id),
      limit: 1,
    });
    return threads[0]?.messageCount ?? 0;
  } catch {
    return 0;
  }
}

async function resolveDemoBuyerIdForOrder(
  orderId: string,
  fallback?: string
): Promise<string | undefined> {
  const id = orderId.trim();
  if (!id || id.startsWith('__')) return fallback;
  if (isPlatformCorePgCheckoutOrderId(id)) {
    const w2 = await getWorkshop2B2bOrder(id);
    return w2?.buyerId?.trim() || fallback;
  }
  if (isIntegrationImportedWholesaleOrderId(id)) {
    const rec = await getImportedOrderRecordForOperationalUi(id);
    const shop = rec?.order?.shop?.trim();
    return shop || fallback;
  }
  return fallback;
}

function buildEmptyChainOverview(
  cid: string,
  demo: ReturnType<typeof getPlatformCoreDemo>
): PlatformCoreChainOverview {
  const { demoOrderId, demoArticleId } = demo;
  const emptyDetail = 'Пустая цепочка — нет seed / PG-данных';
  const pillars: PlatformCorePillarSnapshot[] = PLATFORM_CORE_PILLARS.map((p) => ({
    id: p.id,
    title: p.title,
    done: false,
    detailRu: emptyDetail,
    primaryHref: getPrimaryPillarHrefForDemo(p.id, demo),
  }));
  const roles: PlatformCoreRoleSnapshot[] = getPlatformCoreHubRowsForUi().map((row) => {
    const participatesIn = PLATFORM_CORE_PILLARS.filter(
      (p) => row.pillars[p.id].kind === 'active'
    ).map((p) => p.id);
    return {
      id: row.id,
      label: row.label,
      landingHref: row.landingHref,
      activePillarCount: participatesIn.length,
      participatesIn,
    };
  });
  return {
    collectionId: cid,
    demoOrderId,
    demoArticleId,
    pillars,
    roles,
    commsThreadCount: 0,
  };
}

export async function getPlatformCoreChainOverview(
  collectionId = PLATFORM_CORE_DEMO.collectionId
): Promise<PlatformCoreChainOverview> {
  const cid = collectionId.trim() || PLATFORM_CORE_DEMO.collectionId;
  const cached = getCachedPlatformCoreChainOverview(cid);
  if (cached && isPlatformCoreChainOverviewCacheFresh(cid)) {
    return cached;
  }
  if (cached) {
    schedulePlatformCoreChainOverviewRefresh(cid, () => buildPlatformCoreChainOverviewSafe(cid));
    return cached;
  }

  const overview = await buildPlatformCoreChainOverviewSafe(cid);
  setCachedPlatformCoreChainOverview(cid, overview);
  return overview;
}

function buildDegradedChainOverview(
  cid: string,
  demo: ReturnType<typeof getPlatformCoreDemo>
): PlatformCoreChainOverview {
  const { demoOrderId, demoArticleId, demoBuyerId } = demo;
  const detail = 'PG недоступен — demo pin до bootstrap';
  const demoWithOrder = { ...demo, demoOrderId, demoBuyerId };
  const pillars: PlatformCorePillarSnapshot[] = PLATFORM_CORE_PILLARS.map((p) => ({
    id: p.id,
    title: p.title,
    done: false,
    detailRu: detail,
    primaryHref: getPrimaryPillarHrefForDemo(p.id, demoWithOrder),
  }));
  const roles: PlatformCoreRoleSnapshot[] = getPlatformCoreHubRowsForUi().map((row) => {
    const participatesIn = PLATFORM_CORE_PILLARS.filter(
      (p) => row.pillars[p.id].kind === 'active'
    ).map((p) => p.id);
    return {
      id: row.id,
      label: row.label,
      landingHref: row.landingHref,
      activePillarCount: participatesIn.length,
      participatesIn,
    };
  });
  return {
    collectionId: cid,
    demoOrderId,
    demoArticleId,
    demoBuyerId,
    pillars,
    roles,
    commsThreadCount: 0,
  };
}

async function buildPlatformCoreChainOverviewSafe(
  cid: string
): Promise<PlatformCoreChainOverview> {
  try {
    return await buildPlatformCoreChainOverview(cid);
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) {
      return buildDegradedChainOverview(cid, getPlatformCoreDemo(cid));
    }
    throw err;
  }
}

async function buildPlatformCoreChainOverview(
  cid: string
): Promise<PlatformCoreChainOverview> {
  const demo = getPlatformCoreDemo(cid);
  if (isPlatformCoreEmptyChainCollection(cid)) {
    return buildEmptyChainOverview(cid, demo);
  }
  const { demoOrderId, demoArticleId, factoryId } = demo;
  const w2Fallback = demoOrderId.startsWith('__') ? '' : demoOrderId;

  const [activeOrderId, devStatus, sampleStatus, handoffQueue] = await Promise.all([
    resolveSpineActiveWholesaleOrderIdServer({
      fallbackOrderId: w2Fallback,
      factoryId,
      collectionId: cid,
      resolveFrom: ['w2_registry', 'handoff', 'allocation', 'operational'],
    }),
    getWorkshop2DevelopmentStatus(cid, factoryId, { skipRangePlanner: true }),
    getWorkshop2SampleCollectionStatus(cid),
    listWorkshop2FactoryProductionHandoffQueue({ factoryId }),
  ]);
  const resolvedOrderId =
    activeOrderId ||
    (isPlatformCoreDemoPinOrderId(demoOrderId) ? '' : demoOrderId);

  const resolvedBuyerId = resolvedOrderId
    ? await resolveDemoBuyerIdForOrder(resolvedOrderId, demo.demoBuyerId)
    : demo.demoBuyerId;

  const [chainStatus, commsThreadCount] = await Promise.all([
    resolvedOrderId && !resolvedOrderId.startsWith('__')
      ? resolveB2bChainStatusUnified(resolvedOrderId)
      : Promise.resolve(null),
    countOrderContextMessages(resolvedOrderId),
  ]);
  const demoWithOrder = {
    ...demo,
    demoOrderId: resolvedOrderId,
    demoBuyerId: resolvedBuyerId,
  };

  const developmentDone =
    devStatus.steps.find((s) => s.id === 'ready_for_collection')?.done === true;
  const sampleCollectionDone = sampleStatus.readyForBuyers;
  const collectionOrderDone =
    chainStatus != null && chainStatus.steps.find((s) => s.id === 'shop_sent')?.done === true;
  const orderProductionDone = chainStatus?.handedOff === true;
  const commsDone = commsThreadCount > 0;

  const pillarDone: Record<CoreHubPillarId, boolean> = {
    development: developmentDone,
    sample_collection: sampleCollectionDone,
    collection_order: collectionOrderDone,
    order_production: orderProductionDone,
    comms: commsDone,
  };

  const pillarDetail: Record<CoreHubPillarId, string> = {
    development: `${devStatus.articleCount} артикул(ов), ${devStatus.sampleQueueCount} образцов на цехе`,
    sample_collection: `${sampleStatus.publishedCount} в витрине`,
    collection_order: chainStatus
      ? formatChainOrderDetailRu({
          orderId: resolvedOrderId,
          collectionId: cid,
          status: chainStatus.status,
        })
      : resolvedOrderId
        ? formatChainOrderDetailRu({ orderId: resolvedOrderId, collectionId: cid })
        : formatChainOrderDetailRu({ orderId: '', collectionId: cid }),
    order_production: orderProductionDone
      ? `${handoffQueue.items.length} PO в очереди ${factoryId}`
      : chainStatus?.poStatusLabelRu
        ? `PO · ${chainStatus.poStatusLabelRu}`
        : 'Handoff не выполнен',
    comms: formatCommsDetailRu(resolvedOrderId, commsThreadCount),
  };

  const pillars: PlatformCorePillarSnapshot[] = PLATFORM_CORE_PILLARS.map((p) => ({
    id: p.id,
    title: p.title,
    done: pillarDone[p.id],
    detailRu: pillarDetail[p.id],
    primaryHref: getPrimaryPillarHrefForDemo(p.id, demoWithOrder),
  }));

  const roles: PlatformCoreRoleSnapshot[] = getPlatformCoreHubRowsForUi().map((row) => {
    const participatesIn = PLATFORM_CORE_PILLARS.filter(
      (p) => row.pillars[p.id].kind === 'active'
    ).map((p) => p.id);
    return {
      id: row.id,
      label: row.label,
      landingHref: row.landingHref,
      activePillarCount: participatesIn.length,
      participatesIn,
    };
  });

  return {
    collectionId: cid,
    demoOrderId: resolvedOrderId,
    demoArticleId,
    demoBuyerId: resolvedBuyerId,
    pillars,
    roles,
    commsThreadCount,
  };
}
