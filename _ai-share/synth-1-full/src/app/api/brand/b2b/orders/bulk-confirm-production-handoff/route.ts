import { NextRequest, NextResponse } from 'next/server';

import { bulkConfirmWorkshop2B2bProductionHandoff } from '@/lib/server/workshop2-b2b-production-handoff';
import { buildWorkshop2BulkHandoffIdempotencyKey } from '@/lib/production/workshop2-bulk-handoff-idempotency';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import {
  confirmOperationalImportOrderByBrand,
  confirmOperationalImportProductionHandoff,
  normalizeImportedSpineStatus,
} from '@/lib/integrations/spine/operational-import-handoff.service';
import { getImportedOrderRecord } from '@/lib/integrations/spine/imported-orders-persistence';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';

/** POST — пакетная передача B2B заказов бренда в производство. */
export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: { orderIds?: string[]; factoryId?: string; idempotencyKey?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }

  const orderIds = Array.isArray(body.orderIds)
    ? body.orderIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  if (!orderIds.length) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите orderIds для передачи.' },
      { status: 400 }
    );
  }

  const factoryId =
    body.factoryId?.trim() || req.nextUrl.searchParams.get('factoryId')?.trim() || undefined;

  const idempotencyKey =
    req.headers.get('Idempotency-Key')?.trim() ||
    body.idempotencyKey?.trim() ||
    buildWorkshop2BulkHandoffIdempotencyKey(orderIds, factoryId);

  const importedIds = orderIds.filter((id) => isIntegrationImportedWholesaleOrderId(id));
  const w2Ids = orderIds.filter((id) => !isIntegrationImportedWholesaleOrderId(id));

  const importedHandoff: string[] = [];
  const importedErrors: Array<{ orderId: string; messageRu: string }> = [];

  for (const orderId of importedIds) {
    const rec = getImportedOrderRecord(orderId);
    if (rec && normalizeImportedSpineStatus(orderId, rec.order.status) === 'submitted') {
      await confirmOperationalImportOrderByBrand({ orderId });
    }
    const r = await confirmOperationalImportProductionHandoff({ orderId, factoryId });
    if (r.ok) importedHandoff.push(orderId);
    else importedErrors.push({ orderId, messageRu: r.messageRu });
  }

  const result =
    w2Ids.length > 0
      ? await bulkConfirmWorkshop2B2bProductionHandoff({
          orderIds: w2Ids,
          factoryId,
          idempotencyKey,
        })
      : { ok: false, handedOff: [] as string[], skipped: [] as string[], errors: [] as Array<{ orderId: string; messageRu: string }>, messageRu: '' };

  const handedOff = [...importedHandoff, ...result.handedOff];
  const errors = [...importedErrors, ...result.errors];
  const ok = handedOff.length > 0;
  const messageRu = ok
    ? `Передано в производство: ${handedOff.length} из ${orderIds.length} заказ(ов).`
    : errors[0]?.messageRu ?? result.messageRu ?? 'Не удалось передать заказы в производство.';

  if (!ok) {
    return NextResponse.json(
      { ok, handedOff, skipped: result.skipped, errors, messageRu, idempotent: result.idempotent },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok,
    handedOff,
    skipped: result.skipped,
    errors,
    messageRu,
    idempotent: result.idempotent,
  });
}
