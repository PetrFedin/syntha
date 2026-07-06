import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  archiveWorkshop2SupplierMaterialCatalogListing,
  listWorkshop2SupplierMaterialCatalog,
  upsertWorkshop2SupplierMaterialCatalogListing,
  type SupplierMaterialCatalogStatus,
} from '@/lib/server/workshop2-supplier-material-catalog-repository';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

function resolveSupplierId(req: NextRequest, body?: Record<string, unknown>): string {
  const { searchParams } = new URL(req.url);
  return String(body?.supplierId ?? searchParams.get('supplierId') ?? 'supplier-demo').trim();
}

export const GET = withWorkshop2ApiErrorRu(async function getSupplierMaterialCatalog(req: NextRequest) {
  const supplierId = resolveSupplierId(req);
  const listings = await listWorkshop2SupplierMaterialCatalog(supplierId);
  return NextResponse.json({ ok: true, listings, supplierId });
});

export const POST = withWorkshop2ApiErrorRu(async function postSupplierMaterialCatalog(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const supplierId = resolveSupplierId(req, body);
  const id = String(body.id ?? `mat-${Date.now()}`).trim();
  const name = String(body.name ?? '').trim();
  if (!name) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', { messageRu: 'Укажите name.' });
  }

  const statusRaw = String(body.status ?? 'active').trim() as SupplierMaterialCatalogStatus;
  const status: SupplierMaterialCatalogStatus =
    statusRaw === 'review' || statusRaw === 'archived' ? statusRaw : 'active';

  try {
    const listing = await upsertWorkshop2SupplierMaterialCatalogListing({
      supplierId,
      listing: {
        id,
        name,
        category: String(body.category ?? '').trim(),
        materialType: String(body.materialType ?? body.type ?? '').trim(),
        origin: String(body.origin ?? '').trim(),
        priceLabel: String(body.priceLabel ?? body.price ?? '').trim(),
        status,
      },
    });
    return NextResponse.json({ ok: true, listing });
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_LISTING') {
      return jsonWorkshop2ErrorRu(400, 'invalid_body');
    }
    throw err;
  }
});

export const DELETE = withWorkshop2ApiErrorRu(async function deleteSupplierMaterialCatalog(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const supplierId = resolveSupplierId(req);
  const id = String(searchParams.get('id') ?? '').trim();
  if (!id) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', { messageRu: 'Укажите id.' });
  }

  const removed = await archiveWorkshop2SupplierMaterialCatalogListing({ supplierId, id });
  if (!removed) {
    return jsonWorkshop2ErrorRu(404, 'not_found');
  }
  return NextResponse.json({ ok: true, id });
});
