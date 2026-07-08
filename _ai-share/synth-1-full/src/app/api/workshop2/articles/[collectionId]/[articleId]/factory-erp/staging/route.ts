/**
 * POST wave 38 #66: Factory ERP staging probe → journal в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import { attemptWorkshop2FactoryErpStaging } from '@/lib/production/workshop2-factory-erp-staging';
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
  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const purchaseOrders = await listWorkshop2PurchaseOrders({
    collectionId: cid,
    articleId: aid,
    organizationId: resolveWorkshop2OrganizationId(req),
  });
  const erpConfigured = Boolean(resolveWorkshop2FactoryErpBaseUrl());
  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'erp-staging-api';

  const result = await attemptWorkshop2FactoryErpStaging({
    dossier: record.dossier,
    purchaseOrders: purchaseOrders.map((o) => ({
      id: o.id,
      status: o.status,
      erpExternalId: o.erpExternalId,
      lastError:
        typeof o.payload?.lastError === 'string' ? (o.payload.lastError as string) : undefined,
    })),
    erpConfigured,
    actor,
    collectionId: cid,
    articleId: aid,
    baseUrl: resolveWorkshop2FactoryErpBaseUrl(),
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: result.dossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_erp_staging' },
  });
  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  const status = !result.ok && !result.skipped ? 502 : 200;
  return NextResponse.json(
    {
      ok: result.ok,
      mirror: result.dossier.factoryErpStagingMirror,
      audit: result.dossier.factoryErpAuditMirror,
      error: result.error,
    },
    { status }
  );
}
