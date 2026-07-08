import { NextRequest, NextResponse } from 'next/server';
import { confirmWorkshop2B2bProductionHandoff } from '@/lib/server/workshop2-b2b-production-handoff';
import {
  confirmOperationalImportProductionHandoff,
  confirmOperationalImportOrderByBrand,
} from '@/lib/integrations/spine/operational-import-handoff.service';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ id: string }> };

/** POST — бренд подтверждает B2B и передаёт серию на производство с контекстом W2. */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await ctx.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан orderId.' }, { status: 400 });
  }

  let body: { factoryId?: string } = {};
  try {
    body = (await req.json()) as { factoryId?: string };
  } catch {
    body = {};
  }
  const factoryId =
    body.factoryId?.trim() || req.nextUrl.searchParams.get('factoryId')?.trim() || undefined;

  let result;
  if (isIntegrationImportedWholesaleOrderId(orderId)) {
    const firstAttempt = await confirmOperationalImportProductionHandoff({ orderId, factoryId });
    if (!firstAttempt.ok && firstAttempt.code === 'needs_confirm') {
      await confirmOperationalImportOrderByBrand({ orderId });
      result = await confirmOperationalImportProductionHandoff({ orderId, factoryId });
    } else {
      result = firstAttempt;
    }
  } else {
    result = await confirmWorkshop2B2bProductionHandoff({ orderId, factoryId });
  }
  if (!result.ok) {
    const status = result.code === 'not_found' ? 404 : 409;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({
    ok: true,
    orderId: result.order.id,
    status: result.order.status,
    productionOrderId: result.productionOrderId,
    factoryId: result.factoryId,
    alreadyConfirmed: result.alreadyConfirmed,
    inventoryReserve: result.inventoryReserve,
    factoryHref: '/factory/production',
    dossierHref: `/factory/production/dossier/${encodeURIComponent(result.order.lines[0]?.articleId ?? result.order.articleId ?? 'demo-ss27-01')}`,
    messageRu: result.messageRu,
  });
}
