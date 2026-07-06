import 'server-only';

import { parseSupplierMaterialPartialShipFields } from '@/lib/production/workshop2-supplier-material-partial-ship';
import { bumpPlatformCoreB2bRegistry } from '@/lib/server/platform-core-b2b-registry-hub';
import { bumpPlatformCoreChainStatus } from '@/lib/server/platform-core-chain-status-hub';
import { bulkConfirmWorkshop2SupplierMaterialSupplyForOrder } from '@/lib/server/workshop2-supplier-material-request-confirm';

export type Workshop2SupplierWmsConfirmResult = {
  ok: boolean;
  idempotent?: boolean;
  confirmed?: number;
  messageRu: string;
};

/** WMS inbound confirm → materials_supplied chain bump (Wave TX). */
export async function handleWorkshop2SupplierWmsConfirmWebhook(input: {
  b2bOrderId: string;
  productionOrderId?: string;
  partialShipQty?: number;
  backorderFlag?: boolean;
  updatedBy?: string;
}): Promise<Workshop2SupplierWmsConfirmResult> {
  const b2bOrderId = input.b2bOrderId.trim();
  if (!b2bOrderId) {
    return { ok: false, messageRu: 'Укажите b2bOrderId.' };
  }

  const { shippedQty, backorder } = parseSupplierMaterialPartialShipFields({
    partialShipQty: input.partialShipQty,
    backorderFlag: input.backorderFlag,
  });

  const result = await bulkConfirmWorkshop2SupplierMaterialSupplyForOrder({
    b2bOrderId,
    productionOrderId: input.productionOrderId?.trim() || undefined,
    updatedBy: input.updatedBy?.trim() || 'wms-confirm-webhook',
    shippedQty,
    backorder,
  });

  if (!result.ok) {
    return { ok: false, messageRu: result.messageRu };
  }

  bumpPlatformCoreChainStatus([b2bOrderId]);
  bumpPlatformCoreB2bRegistry('materials_supplied');

  const allIdempotent = (result.confirmed ?? 0) === 0 && (result.idempotent ?? 0) > 0;

  return {
    ok: true,
    idempotent: allIdempotent,
    confirmed: result.confirmed,
    messageRu: allIdempotent
      ? 'WMS confirm: материалы уже подтверждены · chain-status обновлён.'
      : `WMS confirm: materials_supplied · подтверждено строк ${result.confirmed ?? 0}.`,
  };
}
