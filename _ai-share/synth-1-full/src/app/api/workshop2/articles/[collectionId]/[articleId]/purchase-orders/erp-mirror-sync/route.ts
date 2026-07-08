/**
 * POST wave 35 #47: server PO list → purchaseOrderErpMirror в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import { persistWorkshop2PurchaseOrderErpMirrorToDossier } from '@/lib/production/workshop2-purchase-order-erp-dossier-persist';
import { listWorkshop2PurchaseOrders } from '@/lib/server/workshop2-purchase-order-repository';
import { resolveWorkshop2FactoryErpBaseUrl } from '@/lib/server/workshop2-factory-erp-repository';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  workshop2DossierPutFailureMessageRu,
  workshop2DossierPutFailureStatus,
} from '@/lib/server/workshop2-dossier-put-utils';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import {
  resolveWorkshop2OrganizationId,
  resolveWorkshop2UpdatedBy,
} from '@/lib/server/workshop2-api-context';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  if (!cid || !aid) {
    return jsonWorkshop2ErrorRu(400, 'invalid_path');
  }

  const purchaseOrders = await listWorkshop2PurchaseOrders({
    collectionId: cid,
    articleId: aid,
    organizationId: resolveWorkshop2OrganizationId(req),
  });
  const erpConfigured = Boolean(resolveWorkshop2FactoryErpBaseUrl());

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'po-erp-mirror-api';
  const nextDossier = persistWorkshop2PurchaseOrderErpMirrorToDossier(record.dossier, {
    purchaseOrders: purchaseOrders.map((o) => ({
      id: o.id,
      status: o.status,
      erpExternalId: o.erpExternalId,
      lastError:
        typeof o.payload?.lastError === 'string' ? (o.payload.lastError as string) : undefined,
    })),
    erpConfigured,
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: nextDossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_po_erp_mirror_sync' },
  });

  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  return NextResponse.json({
    ok: true,
    mirror: nextDossier.purchaseOrderErpMirror,
    dossierVersion: saved.record.version,
    poCount: purchaseOrders.length,
  });
}
