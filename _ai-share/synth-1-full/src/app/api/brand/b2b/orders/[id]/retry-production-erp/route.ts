import { NextRequest, NextResponse } from 'next/server';
import {
  getWorkshop2B2bChainStatus,
  retryWorkshop2FactoryHandoffErpSync,
} from '@/lib/server/workshop2-b2b-production-handoff';
import { isIntegrationImportedWholesaleOrderId } from '@/lib/integrations/spine/integration-ui-utils';
import { getOperationalImportChainStatus } from '@/lib/integrations/spine/operational-import-handoff.service';

type RouteCtx = { params: Promise<{ id: string }> };

/** POST — бренд: повтор ERP sync для PO после handoff (status error / FACTORY-ACK). */
export async function POST(_req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан orderId.' }, { status: 400 });
  }

  let chain = await getWorkshop2B2bChainStatus(orderId);
  if (!chain) {
    chain = await getOperationalImportChainStatus(orderId);
  }
  if (!chain) {
    return NextResponse.json({ ok: false, messageRu: 'B2B заказ не найден.' }, { status: 404 });
  }
  if (!chain.handedOff || !chain.productionOrderId) {
    return NextResponse.json(
      { ok: false, messageRu: 'Заказ ещё не передан в производство — retry ERP недоступен.' },
      { status: 409 }
    );
  }
  if (chain.poStatus !== 'error' && chain.poStatus !== 'pending_erp') {
    return NextResponse.json(
      {
        ok: false,
        messageRu: `Повтор ERP недоступен из статуса «${chain.poStatusLabelRu ?? chain.poStatus}».`,
      },
      { status: 409 }
    );
  }

  const result = await retryWorkshop2FactoryHandoffErpSync({
    productionOrderId: chain.productionOrderId,
    collectionId: chain.collectionId,
    articleId: chain.articleId,
    factoryId: chain.factoryId ?? 'fact-1',
    actor: isIntegrationImportedWholesaleOrderId(orderId)
      ? 'brand_spine_erp_retry'
      : 'brand_erp_retry',
  });

  if (!result.ok) {
    const { ok: _ok, messageRu, ...rest } = result;
    return NextResponse.json({ ok: false, orderId, messageRu, ...rest }, { status: 409 });
  }

  const { ok: _ok, productionOrderId: _resultPoId, ...rest } = result;
  return NextResponse.json({
    ok: true,
    orderId,
    productionOrderId: chain.productionOrderId,
    ...rest,
  });
}
