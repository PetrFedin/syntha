/**
 * Wave YJ — supplier OP procurement honest chain strip RU:
 * reserve → partial ship → bulk-confirm → WMS webhook (+ PG chain-status steps).
 */
import { appendSupplierOpPoContextToHref } from '@/lib/b2b/supplier-op-po-context-hrefs';
import { buildOrderSectionCommsMessagesHref } from '@/lib/platform-core-comms-section-groups';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import { shopB2bTrackingOrderHref } from '@/lib/routes';
import {
  WAVE_WP_SUP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_WP_SUP_PROCUREMENT_CHAIN_TITLE_RU,
} from '@/lib/platform/wave-wp-sup-bom-po-progress';
import {
  WAVE_WI_SUP_BULK_CONFIRM_API,
  WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID,
  WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API,
} from '@/lib/platform/wave-wi-supplier-partial-ship';
import { isWorkshop2SupplierWmsConfirmWebhookEnabled } from '@/lib/production/workshop2-supplier-wms-confirm-webhook';

export {
  WAVE_WP_SUP_PROCUREMENT_CHAIN_STEPS_TESTID as WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_STEPS_TESTID,
  WAVE_WP_SUP_PROCUREMENT_CHAIN_TITLE_RU as WAVE_YJ_SUP_OP_PROCUREMENT_CHAIN_TITLE_RU,
};

export const WAVE_YJ_SUP_OP_PROCUREMENT_HONEST_CHAIN_ATTR = 'data-procurement-honest-chain';

export const WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_RESERVE = 'wms_reserve' as const;
export const WAVE_YJ_SUP_OP_CHAIN_STEP_PARTIAL_SHIP = 'partial_ship' as const;
export const WAVE_YJ_SUP_OP_CHAIN_STEP_BULK_CONFIRM = 'bulk_confirm' as const;
export const WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_WEBHOOK = 'wms_webhook' as const;

export const WAVE_YJ_SUP_OP_WMS_RESERVE_STRIP_TESTID = 'sup-op-procurement-wms-reserve-strip';
export const WAVE_YJ_SUP_OP_BULK_CONFIRM_PROGRESS_TESTID = 'sup-op-bulk-confirm-progress-strip';
export const WAVE_YJ_SUP_OP_COMMS_TAIL_PO_ATTR = 'data-comms-tail-po';

export const WAVE_YJ_SUP_OP_WMS_RESERVE_STEP_RU =
  'Резерв WMS · образец + PATCH B2B inventory-reserve';
export const WAVE_YJ_SUP_OP_PARTIAL_SHIP_STEP_RU =
  'Частичная отгрузка · bulk-confirm (partialShipQty/backorder)';
export const WAVE_YJ_SUP_OP_BULK_CONFIRM_STEP_RU =
  'Подтверждение поставки · bulk-confirm API (все BOM строки)';
export const WAVE_YJ_SUP_OP_WMS_WEBHOOK_STEP_RU = 'WMS inbound confirm · webhook (env-gated stub)';

export type SupOpProcurementHonestChainStep = {
  id: string;
  labelRu: string;
  done: boolean;
  honest?: boolean;
};

export function buildSupOpProcurementHonestChainSteps(input: {
  apiSteps: ReadonlyArray<{ id: string; labelRu: string; done: boolean }>;
  inventoryReservedDone: boolean;
  materialsSuppliedDone: boolean;
  showPartialShipPath: boolean;
  partialShipDone: boolean;
  bulkConfirmDone: boolean;
  wmsWebhookApplied?: boolean;
  wmsWebhookEnabled?: boolean;
}): SupOpProcurementHonestChainStep[] {
  const apiById = new Map(input.apiSteps.map((s) => [s.id, s]));
  const productionPo = apiById.get('production_po');
  const materialsSupplied = apiById.get('materials_supplied');
  const inventoryReserved = apiById.get('inventory_reserved');
  const wmsWebhookEnabled =
    input.wmsWebhookEnabled ?? isWorkshop2SupplierWmsConfirmWebhookEnabled();

  const steps: SupOpProcurementHonestChainStep[] = [];

  if (productionPo) {
    steps.push(productionPo);
  }

  steps.push({
    id: WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_RESERVE,
    labelRu: WAVE_YJ_SUP_OP_WMS_RESERVE_STEP_RU,
    done: input.inventoryReservedDone,
    honest: true,
  });

  if (input.showPartialShipPath) {
    steps.push({
      id: WAVE_YJ_SUP_OP_CHAIN_STEP_PARTIAL_SHIP,
      labelRu: WAVE_YJ_SUP_OP_PARTIAL_SHIP_STEP_RU,
      done: input.partialShipDone || input.materialsSuppliedDone,
      honest: true,
    });
  } else {
    steps.push({
      id: WAVE_YJ_SUP_OP_CHAIN_STEP_BULK_CONFIRM,
      labelRu: WAVE_YJ_SUP_OP_BULK_CONFIRM_STEP_RU,
      done: input.bulkConfirmDone || input.materialsSuppliedDone,
      honest: true,
    });
  }

  if (wmsWebhookEnabled) {
    steps.push({
      id: WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_WEBHOOK,
      labelRu: WAVE_YJ_SUP_OP_WMS_WEBHOOK_STEP_RU,
      done: Boolean(input.wmsWebhookApplied ?? input.materialsSuppliedDone),
      honest: true,
    });
  }

  if (materialsSupplied) {
    steps.push(materialsSupplied);
  } else if (input.materialsSuppliedDone) {
    steps.push({
      id: 'materials_supplied',
      labelRu: 'Материалы переданы в производство',
      done: true,
    });
  }

  if (inventoryReserved && inventoryReserved.id !== WAVE_YJ_SUP_OP_CHAIN_STEP_WMS_RESERVE) {
    steps.push(inventoryReserved);
  }

  return steps;
}

export function buildSupOpCommsTailHref(input: {
  orderId: string;
  collectionId: string;
  sectionId: string;
  productionOrderId?: string;
  pillarId?: CoreHubPillarId;
}): string {
  const orderId = input.orderId.trim();
  const base = buildOrderSectionCommsMessagesHref({
    roleId: 'supplier',
    orderId,
    collectionId: input.collectionId,
    sectionId: input.sectionId,
    pillarId: input.pillarId ?? 'order_production',
  });
  return appendSupplierOpPoContextToHref(base, {
    orderId,
    productionOrderId: input.productionOrderId,
  });
}

export function buildSupOpTrackingTailHref(input: {
  orderId: string;
  productionOrderId?: string;
}): string {
  const orderId = input.orderId.trim();
  return appendSupplierOpPoContextToHref(shopB2bTrackingOrderHref(orderId), {
    orderId,
    productionOrderId: input.productionOrderId,
  });
}

export function supOpCommsTailHrefCarriesPoContext(
  href: string,
  productionOrderId: string
): boolean {
  const po = productionOrderId.trim();
  if (!po) return false;
  try {
    const url = new URL(href, 'http://local');
    return url.searchParams.get('po') === po;
  } catch {
    return href.includes(`po=${encodeURIComponent(po)}`);
  }
}

export function waveYjSupOpProcurementChainApis(): string[] {
  return [
    WAVE_WI_SUP_BULK_CONFIRM_API,
    WAVE_WI_SUP_WMS_CONFIRM_WEBHOOK_API,
    WAVE_WI_SUP_PARTIAL_SHIP_STRIP_TESTID,
    WAVE_YJ_SUP_OP_WMS_RESERVE_STRIP_TESTID,
    WAVE_YJ_SUP_OP_BULK_CONFIRM_PROGRESS_TESTID,
  ];
}
