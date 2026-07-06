import 'server-only';

import {
  getProductionWipByB2bOrderId,
  getProductionWipByPoId,
  productionWipSteps,
  PRODUCTION_WIP_STAGE_LABEL_RU,
  type ProductionWipStage,
} from '@/lib/integrations/spine/production-wip-persistence.file';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

export type MfrProductionTimelineStep = {
  id: ProductionWipStage;
  labelRu: string;
  done: boolean;
  current: boolean;
};

export type MfrProductionTimelineResult = {
  ok: boolean;
  orderId: string;
  productionOrderId?: string;
  poStage?: ProductionWipStage;
  poStageLabelRu?: string;
  qtyComplete?: number;
  qtyTotal?: number;
  steps: MfrProductionTimelineStep[];
  storageMode: 'postgres' | 'file' | 'memory';
  messageRu: string;
};

/** PG/file WIP timeline для manufacturer OP cabinet (Wave SJ). */
export function getMfrProductionTimeline(input: {
  orderId: string;
  productionOrderId?: string;
}): MfrProductionTimelineResult {
  const orderId = input.orderId.trim();
  const productionOrderId = input.productionOrderId?.trim();
  const storageMode = isWorkshop2PostgresEnabled() ? 'postgres' : 'file';

  const wip =
    (productionOrderId ? getProductionWipByPoId(productionOrderId) : undefined) ??
    (orderId ? getProductionWipByB2bOrderId(orderId) : undefined);

  if (!wip) {
    return {
      ok: false,
      orderId,
      productionOrderId,
      steps: [],
      storageMode,
      messageRu: 'WIP не найден — этап появится после приёмки PO.',
    };
  }

  const stepRows = productionWipSteps(wip.poStage);
  const steps: MfrProductionTimelineStep[] = stepRows.map((row) => ({
    id: row.id,
    labelRu: row.labelRu,
    done: row.done,
    current: row.id === wip.poStage,
  }));

  return {
    ok: true,
    orderId: wip.b2bOrderId || orderId,
    productionOrderId: wip.productionOrderId,
    poStage: wip.poStage,
    poStageLabelRu: PRODUCTION_WIP_STAGE_LABEL_RU[wip.poStage],
    qtyComplete: wip.qtyComplete,
    qtyTotal: wip.qtyTotal,
    steps,
    storageMode,
    messageRu: `WIP · ${PRODUCTION_WIP_STAGE_LABEL_RU[wip.poStage]}`,
  };
}
