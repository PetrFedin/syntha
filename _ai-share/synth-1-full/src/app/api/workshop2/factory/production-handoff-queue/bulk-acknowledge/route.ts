/**
 * POST — массовое принятие серий из очереди B2B handoff (`pending_erp` → `synced`).
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  bulkAcknowledgeWorkshop2FactoryProductionHandoff,
  type Workshop2FactoryHandoffBulkAckItem,
} from '@/lib/server/workshop2-b2b-production-handoff';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';
import { NextRequest, NextResponse } from 'next/server';

const MAX_BULK = 16;

export const POST = withWorkshop2ApiErrorRu(async function postBulkAcknowledge(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES, {
    bodyActorLabel: String(body.actor ?? ''),
  });
  if (auth instanceof NextResponse) return auth;

  const factoryId = String(body.factoryId ?? req.nextUrl.searchParams.get('factoryId') ?? 'fact-1').trim();
  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return jsonWorkshop2ErrorRu(400, 'invalid_items', {
      messageRu: 'Укажите items: { productionOrderId, collectionId, articleId }[].',
    });
  }

  const items: Workshop2FactoryHandoffBulkAckItem[] = rawItems
    .slice(0, MAX_BULK)
    .map((row) => {
      const r = row as Record<string, unknown>;
      return {
        productionOrderId: String(r.productionOrderId ?? '').trim(),
        collectionId: String(r.collectionId ?? '').trim(),
        articleId: String(r.articleId ?? '').trim(),
      };
    })
    .filter((row) => row.productionOrderId && row.collectionId && row.articleId);

  if (items.length === 0) {
    return jsonWorkshop2ErrorRu(400, 'invalid_items', {
      messageRu: 'Нет валидных серий для принятия.',
    });
  }

  const actor = resolveWorkshop2UpdatedBy(req, String(body.actor ?? ''), auth.actor) ?? 'factory_bulk_ack';
  const result = await bulkAcknowledgeWorkshop2FactoryProductionHandoff({
    factoryId,
    items,
    actor,
  });

  const erpNote = result.erp
    ? result.erp.liveSynced > 0
      ? ` · ERP: ${result.erp.liveSynced} синхронизировано`
      : result.erp.journalOnly > 0
        ? ' · ERP не настроен (journal-only)'
        : result.erp.liveFailed > 0
          ? ` · ERP ошибок: ${result.erp.liveFailed}`
          : ''
    : '';

  return NextResponse.json({
    ok: result.ok,
    factoryId,
    acknowledged: result.acknowledged,
    skipped: result.skipped,
    errors: result.errors,
    erp: result.erp,
    materialRequestAuto: result.materialRequestAuto,
    messageRu:
      result.acknowledged.length > 0
        ? `Принято серий: ${result.acknowledged.length}${result.skipped.length ? ` · уже принято: ${result.skipped.length}` : ''}${erpNote}.`
        : result.skipped.length > 0
          ? `Все выбранные серии уже приняты (${result.skipped.length}).`
          : 'Не удалось принять серии — см. errors.',
  });
});
