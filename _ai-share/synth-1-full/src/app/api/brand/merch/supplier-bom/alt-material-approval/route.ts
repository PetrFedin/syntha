import { NextRequest, NextResponse } from 'next/server';

import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import { factoryMaterialsHrefForDemo } from '@/lib/platform-core-hub-matrix';
import {
  brandCanDecideAltMaterialApproval,
  listPendingBrandAltMaterialApprovals,
  type BrandAltMaterialApprovalAction,
} from '@/lib/production/workshop2-brand-alt-material-approval';
import {
  applySupplierAltMaterialApproval,
  formatSupplierAltMaterialApprovalStatusRu,
  summarizeSupplierAltMaterialApprovals,
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
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

async function notifyBrandAltMaterialDecision(input: {
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

  await appendPlatformCoreNotificationEvent({
    role: 'supplier',
    scopeKey: 'org-brand-001',
    collectionId: input.collectionId,
    articleId: input.articleId,
    kind: 'chain_status',
    titleRu: `Решение бренда по альтернативе · ${statusRu}`,
    bodyRu,
    href: supplierHref,
  });

  await appendPlatformCoreNotificationEvent({
    role: 'brand',
    scopeKey: 'org-brand-001',
    collectionId: input.collectionId,
    articleId: input.articleId,
    kind: 'chain_status',
    titleRu: `Альтернатива материала · ${statusRu}`,
    bodyRu,
    href: brandSession.bomHref,
  });
}

/** GET — pending alt-material approvals для brand dev BOM (PG env-gated). */
export async function GET(req: NextRequest) {
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const articleId = req.nextUrl.searchParams.get('articleId')?.trim() ?? '';
  if (!collectionId || !articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и articleId обязательны.' },
      { status: 400 }
    );
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  const loaded = await getSupplierAltMaterialApprovalsServer({
    collectionId,
    articleId,
    dossierSeed: record?.dossier.supplierAltMaterialApprovals,
  });
  const pending = listPendingBrandAltMaterialApprovals(loaded.approvals);
  const summary = summarizeSupplierAltMaterialApprovals(loaded.approvals);

  return NextResponse.json({
    ok: true,
    collectionId,
    articleId,
    approvals: loaded.approvals,
    pending,
    summary,
    storageMode: loaded.storageMode,
    pgEnabled: isWorkshop2PostgresEnabled(),
    messageRu:
      loaded.storageMode === 'postgres'
        ? pending.length > 0
          ? `${pending.length} альтернатив ожидают решения бренда.`
          : 'Нет альтернатив на согласовании.'
        : loaded.storageMode === 'pg_only_blocked'
          ? 'PostgreSQL недоступен — согласование заблокировано (core fail-closed).'
          : 'Статусы из dev-памяти сервера.',
  });
}

/** POST — brand approve/reject stub (только pending → approved/rejected). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }

  const collectionId = String(body.collectionId ?? '').trim();
  const articleId = String(body.articleId ?? '').trim();
  const primary = String(body.primary ?? '').trim();
  const alternative = String(body.alternative ?? '').trim();
  const action = String(body.action ?? '').trim() as BrandAltMaterialApprovalAction;

  if (!collectionId || !articleId || !primary || !alternative) {
    return NextResponse.json(
      { ok: false, messageRu: 'Заполните collectionId, articleId, primary, alternative.' },
      { status: 400 }
    );
  }
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json(
      { ok: false, messageRu: 'Допустимы только действия approve или reject.' },
      { status: 400 }
    );
  }

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record) {
    return NextResponse.json({ ok: false, messageRu: 'Артикул не найден.' }, { status: 404 });
  }

  const current = await getSupplierAltMaterialApprovalsServer({
    collectionId,
    articleId,
    dossierSeed: record.dossier.supplierAltMaterialApprovals,
  });
  const mapKey = `${primary}::${alternative}`;
  const currentStatus = current.approvals[mapKey];
  if (!brandCanDecideAltMaterialApproval({ action, currentStatus })) {
    return NextResponse.json(
      {
        ok: false,
        messageRu: 'Решение доступно только для альтернатив со статусом «на согласовании».',
        currentStatus: currentStatus ?? null,
        storageMode: current.storageMode,
      },
      { status: 409 }
    );
  }

  const status: SupplierAltMaterialApprovalStatus = action === 'approve' ? 'approved' : 'rejected';
  const saved = await upsertSupplierAltMaterialApprovalServer({
    collectionId,
    articleId,
    primary,
    alternative,
    status,
    updatedBy: String(body.brandActorLabel ?? 'brand-alt-material'),
  });

  if (!saved.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: 'pg_only_blocked',
        messageRu:
          'PostgreSQL недоступен — решение не сохранено (core fail-closed, без localStorage).',
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
    updatedBy: String(body.brandActorLabel ?? 'brand-alt-material'),
    txMeta: {
      eventType: 'brand.alt_material_approval',
      eventPayload: { primary, alternative, status, storageMode: saved.storageMode },
    },
  });

  if (!dossierSaved.ok) {
    return NextResponse.json(workshop2DossierPutFailureBody(dossierSaved), {
      status: workshop2DossierPutFailureStatus(dossierSaved),
    });
  }

  if (saved.changed) {
    void notifyBrandAltMaterialDecision({
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
    payload: { source: 'brand_alt_material_approval', primary, alternative, status },
    dispatchNow: true,
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    status,
    action,
    approvals: saved.approvals,
    pending: listPendingBrandAltMaterialApprovals(saved.approvals),
    summary: summarizeSupplierAltMaterialApprovals(saved.approvals),
    storageMode: saved.storageMode,
    messageRu: `Альтернатива ${formatSupplierAltMaterialApprovalStatusRu(status)} (${saved.storageMode === 'postgres' ? 'PG' : saved.storageMode}).`,
  });
}
