import 'server-only';

import {
  shopB2bOperationalMirrorStatusFromAmendment,
  type ShopB2bOperationalMirrorStatus,
} from '@/lib/order/shop-b2b-operational-status';
import { mergeShopB2bOperationalStatusJournal } from '@/lib/server/shop-b2b-operational-status-repository';
import { bumpPlatformCoreB2bRegistry } from '@/lib/server/platform-core-b2b-registry-hub';

/** Push brand amend outcome into shop PG operational status journal (Wave TS). */
export async function pushShopOperationalStatusMirrorFromBrandAmend(input: {
  orderId: string;
  amendmentId: string;
  amendmentStatus: 'pending' | 'approved' | 'rejected';
  idempotencyKey?: string;
}): Promise<{ ok: true; status: ShopB2bOperationalMirrorStatus } | { ok: false; message: string }> {
  const orderId = input.orderId.trim();
  const amendmentId = input.amendmentId.trim();
  if (!orderId || !amendmentId) {
    return { ok: false, message: 'orderId and amendmentId required' };
  }

  const status = shopB2bOperationalMirrorStatusFromAmendment(input.amendmentStatus);
  const idempotencyKey =
    input.idempotencyKey?.trim() ||
    `amend-mirror:${orderId}:${amendmentId}:${input.amendmentStatus}`;

  const result = await mergeShopB2bOperationalStatusJournal({
    orderId,
    status,
    amendmentId,
    idempotencyKey,
    source: 'brand_amend_mirror',
    payload: { amendmentStatus: input.amendmentStatus },
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  if (!result.idempotentReplay) {
    bumpPlatformCoreB2bRegistry(`b2b.order.amendment_mirror.${input.amendmentStatus}`);
  }

  return { ok: true, status };
}
