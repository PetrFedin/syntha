import { NextRequest, NextResponse } from 'next/server';

import { workshop2QcInspectionToBrandRow } from '@/lib/production/workshop2-qc-gate-shipment';
import {
  listWorkshop2QcInspectionsForCollection,
  listWorkshop2QcInspectionsForOrder,
  upsertWorkshop2QcInspection,
} from '@/lib/server/workshop2-qc-gate-repository';

/** GET — QC inspections for collection (PG SoT for shipment block). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim();
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim();

  if (!collectionId && !orderId) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите collectionId или orderId.' },
      { status: 400 }
    );
  }

  const inspections = collectionId
    ? await listWorkshop2QcInspectionsForCollection({ collectionId })
    : await listWorkshop2QcInspectionsForOrder(orderId!);

  const rows = inspections.map(workshop2QcInspectionToBrandRow);
  const blockedShipments = rows.filter((r) => r.blocksShipment).length;

  return NextResponse.json({
    ok: true,
    inspections,
    rows,
    blockedShipments,
    storageMode: inspections.length > 0 ? 'pg' : 'empty',
    messageRu:
      rows.length > 0
        ? `${rows.length} инспекций · block ship: ${blockedShipments}`
        : 'Нет PG инспекций — отгрузка не блокируется QC gate.',
  });
}

/** POST — record QC inspection (fail/rework blocks shipment server-side). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const orderId = String(body.orderId ?? '').trim();
  const result = String(body.result ?? 'fail').trim() as 'pass' | 'fail' | 'rework' | 'pending';
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите orderId.' }, { status: 400 });
  }

  const inspection = await upsertWorkshop2QcInspection({
    orderId,
    poId: body.poId != null ? String(body.poId) : undefined,
    collectionId: body.collectionId != null ? String(body.collectionId) : undefined,
    articleId: body.articleId != null ? String(body.articleId) : undefined,
    result,
    blocksShipment: body.blocksShipment != null ? Boolean(body.blocksShipment) : undefined,
    inspectorLabel: body.inspectorLabel != null ? String(body.inspectorLabel) : undefined,
  });

  return NextResponse.json({
    ok: true,
    inspection,
    row: workshop2QcInspectionToBrandRow(inspection),
    messageRu:
      inspection.blocksShipment && inspection.result !== 'pass'
        ? `QC gate: отгрузка заблокирована для ${orderId}.`
        : `Инспекция ${result} записана для ${orderId}.`,
  });
}
