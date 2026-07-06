import { NextRequest, NextResponse } from 'next/server';

import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import { factoryMaterialsHrefForDemo } from '@/lib/platform-core-hub-matrix';
import {
  brandAltMaterialNotificationTitleRu,
  supplierCanActAltMaterialApproval,
  type SupplierAltMaterialAction,
} from '@/lib/platform/wave-xw-sup-alt-material-approval';
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  applySupplierAltMaterialApproval,
  buildSupplierAltMaterialApprovalKey,
  formatSupplierAltMaterialApprovalStatusRu,
  type SupplierAltMaterialApprovalStatus,
} from '@/lib/production/workshop2-supplier-alt-material-approval';
import { appendPlatformCoreNotificationEvent } from '@/lib/server/platform-core-notification-events-repository';
import { bumpPlatformCoreDevelopmentStatus } from '@/lib/server/platform-core-development-status-hub';
import {
  getSupplierAltMaterialApprovalsServer,
  upsertSupplierAltMaterialApprovalServer,
} from '@/lib/server/workshop2-supplier-alt-material-approval-repository';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  workshop2DossierPutFailureBody,
  workshop2DossierPutFailureStatus,
} from '@/lib/server/workshop2-dossier-put-utils';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';

async function notifyAltMaterialApprovalChange(input: {
  collectionId: string;
  articleId: string;
  primary: string;
  alternative: string;
  status: SupplierAltMaterialApprovalStatus;
}): Promise<void> {
  const statusRu = formatSupplierAltMaterialApprovalStatusRu(input.status);
  const bodyRu = `${input.primary} → ${input.alternative} · ${statusRu}`;
  const brandSession = buildBrandSupplierBomSession({
    collectionId: input.collectionId,
    articleId: input.articleId,
  });
  const supplierHref = factoryMaterialsHrefForDemo({
    collectionId: input.collectionId,
    demoArticleId: input.articleId,
    demoOrderId: '',
    factoryId: '',
  });

  const titleRu = brandAltMaterialNotificationTitleRu({ actor: 'supplier', status: input.status });

  await appendPlatformCoreNotificationEvent({
    role: 'brand',
    scopeKey: 'org-brand-001',
    collectionId: input.collectionId,
    articleId: input.articleId,
    kind: 'chain_status',
    titleRu,
    bodyRu,
    href: brandSession.bomHref,
  });

  if (input.status !== 'pending') {
    await appendPlatformCoreNotificationEvent({
      role: 'supplier',
      scopeKey: 'org-brand-001',
      collectionId: input.collectionId,
      articleId: input.articleId,
      kind: 'chain_status',
      titleRu: `Решение по альтернативе · ${statusRu}`,
      bodyRu,
      href: supplierHref,
    });
  }
}

export const GET = withWorkshop2ApiErrorRu(async function getAltMaterialApprovals(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const collectionId = searchParams.get('collectionId')?.trim() ?? '';
  const articleId = searchParams.get('articleId')?.trim() ?? '';
  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_context');
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const loaded = await getSupplierAltMaterialApprovalsServer({
    collectionId,
    articleId,
    dossierSeed: record?.dossier.supplierAltMaterialApprovals,
  });

  return NextResponse.json({
    ok: true,
    approvals: loaded.approvals,
    storageMode: loaded.storageMode,
    messageRu:
      loaded.storageMode === 'postgres'
        ? 'Статусы альтернатив из PostgreSQL.'
        : loaded.storageMode === 'pg_only_blocked'
          ? 'PostgreSQL недоступен — согласование альтернатив заблокировано (core fail-closed).'
          : 'Статусы альтернатив из памяти dev-сервера.',
  });
});

export const POST = withWorkshop2ApiErrorRu(async function postAltMaterialApproval(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const primary = String(body.primary ?? '').trim();
  const alternative = String(body.alternative ?? '').trim();
  const action = String(body.action ?? 'submit').trim() as SupplierAltMaterialAction;

  if (!collectionId || !articleId || !primary || !alternative) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body');
  }
  if (action !== 'submit' && action !== 'approve' && action !== 'reject') {
    return jsonWorkshop2ErrorRu(400, 'invalid_body');
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record) return jsonWorkshop2ErrorRu(404, 'not_found');

  const loaded = await getSupplierAltMaterialApprovalsServer({
    collectionId,
    articleId,
    dossierSeed: record.dossier.supplierAltMaterialApprovals,
  });
  const mapKey = buildSupplierAltMaterialApprovalKey(primary, alternative);
  const currentStatus = loaded.approvals[mapKey];
  if (!supplierCanActAltMaterialApproval({ action, currentStatus })) {
    return NextResponse.json(
      {
        ok: false,
        messageRu: 'Действие недоступно для текущего статуса альтернативы.',
        currentStatus: currentStatus ?? null,
        storageMode: loaded.storageMode,
      },
      { status: 409 }
    );
  }

  const status: SupplierAltMaterialApprovalStatus =
    action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';

  const actor =
    resolveWorkshop2UpdatedBy(req, String(body.actor ?? ''), auth.actor) ??
    'supplier-alt-material';

  const saved = await upsertSupplierAltMaterialApprovalServer({
    collectionId,
    articleId,
    primary,
    alternative,
    status,
    updatedBy: actor,
  });

  if (!saved.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: 'pg_only_blocked',
        messageRu:
          'PostgreSQL недоступен — согласование альтернатив не сохранено (core fail-closed, без localStorage).',
        storageMode: saved.storageMode,
      },
      { status: 503 }
    );
  }

  const nextDossier = applySupplierAltMaterialApproval({
    dossier: record.dossier,
    primary,
    alternative,
    status,
  });

  const dossierSaved = await putWorkshop2ServerDossierRecord({
    collectionId,
    articleId,
    dossier: nextDossier,
    baseVersion: record.version,
    updatedBy: actor,
    txMeta: {
      eventType: 'supplier.alt_material_approval',
      eventPayload: { primary, alternative, status, storageMode: saved.storageMode },
    },
  });

  if (!dossierSaved.ok) {
    return NextResponse.json(workshop2DossierPutFailureBody(dossierSaved), {
      status: workshop2DossierPutFailureStatus(dossierSaved),
    });
  }

  if (saved.changed) {
    void notifyAltMaterialApprovalChange({
      collectionId,
      articleId,
      primary,
      alternative,
      status,
    }).catch(() => {});
  }

  bumpPlatformCoreDevelopmentStatus([collectionId]);
  void enqueueWorkshop2DomainEvent({
    type: 'dossier.gate_passed',
    collectionId,
    articleId,
    payload: { source: 'supplier_alt_material_approval', primary, alternative, status },
    dispatchNow: true,
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    status,
    approvals: saved.approvals,
    storageMode: saved.storageMode,
    messageRu: `Альтернатива ${formatSupplierAltMaterialApprovalStatusRu(status)} (${saved.storageMode === 'postgres' ? 'PG' : saved.storageMode}).`,
  });
});
