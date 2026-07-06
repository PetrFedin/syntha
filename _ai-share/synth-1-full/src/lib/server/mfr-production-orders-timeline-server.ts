import 'server-only';

import {
  getProductionWipByPoId,
  PRODUCTION_WIP_STAGE_LABEL_RU,
  PRODUCTION_WIP_STAGES,
  productionWipStageIndex,
  type ProductionWipRecord,
  type ProductionWipStage,
} from '@/lib/integrations/spine/production-wip-persistence.file';
import {
  ensureSpineOperationalStoreReady,
  SPINE_TRACKING_READ_SCOPES,
} from '@/lib/integrations/spine/spine-operational-store';
import { isPlatformCoreSpinePgPrimary } from '@/lib/server/platform-core-spine-pg.server';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { listWorkshop2FactoryProductionHandoffQueue } from '@/lib/server/workshop2-b2b-production-handoff';

export type MfrProductionOrdersTimelineRow = {
  productionOrderId: string;
  b2bOrderId: string;
  poStage?: ProductionWipStage;
  poStageLabelRu: string;
  progressPercent: number;
  stageIndex: number;
  stageCount: number;
};

export type MfrProductionOrdersTimelineResult = {
  ok: boolean;
  factoryId: string;
  orderId?: string;
  storageMode: 'postgres' | 'file' | 'memory';
  storageModeLabelRu: string;
  /** Единый источник строк — очередь handoff (без дубля в UI). */
  source: 'handoff_queue';
  rows: MfrProductionOrdersTimelineRow[];
  messageRu: string;
};

const STAGE_COUNT = PRODUCTION_WIP_STAGES.length;

/** RU-подпись режима хранения WIP timeline (Wave WJ). */
export function mfrProductionOrdersTimelineStorageModeLabelRu(
  mode: MfrProductionOrdersTimelineResult['storageMode']
): string {
  if (mode === 'postgres') return 'WIP · PostgreSQL';
  if (mode === 'memory') return 'WIP · память';
  return 'WIP · файл';
}

async function resolveProductionWipByPoId(
  productionOrderId: string
): Promise<ProductionWipRecord | undefined> {
  await ensureSpineOperationalStoreReady(SPINE_TRACKING_READ_SCOPES);
  if (isPlatformCoreSpinePgPrimary()) {
    const { getProductionWipByPoIdFromPg } = await import(
      '@/lib/integrations/spine/spine-operational-persistence.pg'
    );
    const fromPg = await getProductionWipByPoIdFromPg(productionOrderId);
    if (fromPg) return fromPg;
  }
  return getProductionWipByPoId(productionOrderId);
}

function rowFromWip(input: {
  productionOrderId: string;
  b2bOrderId: string;
  wip?: ProductionWipRecord;
}): MfrProductionOrdersTimelineRow {
  if (!input.wip) {
    return {
      productionOrderId: input.productionOrderId,
      b2bOrderId: input.b2bOrderId,
      poStageLabelRu: 'Ожидает приёмки',
      progressPercent: 0,
      stageIndex: -1,
      stageCount: STAGE_COUNT,
    };
  }
  const stageIndex = productionWipStageIndex(input.wip.poStage);
  const progressPercent = Math.round(((stageIndex + 1) / STAGE_COUNT) * 100);
  return {
    productionOrderId: input.productionOrderId,
    b2bOrderId: input.b2bOrderId,
    poStage: input.wip.poStage,
    poStageLabelRu: PRODUCTION_WIP_STAGE_LABEL_RU[input.wip.poStage],
    progressPercent,
    stageIndex,
    stageCount: STAGE_COUNT,
  };
}

/** PG/file Gantt timeline по production_orders — SoT handoff queue (Wave WJ). */
export async function getMfrProductionOrdersTimeline(input: {
  factoryId: string;
  orderId?: string;
  limit?: number;
}): Promise<MfrProductionOrdersTimelineResult> {
  const factoryId = input.factoryId.trim() || 'fact-1';
  const orderId = input.orderId?.trim() || undefined;
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 20);
  const storageMode: MfrProductionOrdersTimelineResult['storageMode'] =
    isPlatformCoreSpinePgPrimary() || isWorkshop2PostgresEnabled() ? 'postgres' : 'file';

  const queue = await listWorkshop2FactoryProductionHandoffQueue({ factoryId });
  let items = queue.items;
  if (orderId) {
    items = items.filter((i) => i.b2bOrderId === orderId);
  }

  const slice = items.slice(0, limit);
  const rows = await Promise.all(
    slice.map(async (item) => {
      const wip = await resolveProductionWipByPoId(item.productionOrderId);
      return rowFromWip({
        productionOrderId: item.productionOrderId,
        b2bOrderId: item.b2bOrderId,
        wip,
      });
    })
  );

  const withWip = rows.filter((r) => r.stageIndex >= 0).length;
  const messageRu =
    rows.length === 0
      ? orderId
        ? 'Нет PO для заказа — передайте серию из очереди.'
        : 'Нет производственных серий в очереди.'
      : `Гант · ${withWip}/${rows.length} PO с WIP`;

  return {
    ok: rows.length > 0,
    factoryId,
    orderId,
    storageMode,
    storageModeLabelRu: mfrProductionOrdersTimelineStorageModeLabelRu(storageMode),
    source: 'handoff_queue',
    rows,
    messageRu,
  };
}
