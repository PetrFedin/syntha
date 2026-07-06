import { NextRequest, NextResponse } from 'next/server';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  buildWorkshop2VaultVirusScanMetadataPatch,
  runWorkshop2VaultVirusScanStub,
} from '@/lib/production/workshop2-vault-virus-scan';
import { bumpPlatformCoreDevelopmentStatus } from '@/lib/server/platform-core-development-status-hub';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import {
  listWorkshop2VaultDocumentsFromPg,
  upsertWorkshop2VaultDocumentToPg,
} from '@/lib/server/workshop2-dossier-repository';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import {
  resolveWorkshop2OrganizationId,
  resolveWorkshop2UpdatedBy,
  workshop2DatabaseNotConfiguredResponse,
} from '@/lib/server/workshop2-api-context';
import {
  guardWorkshop2Route,
  WORKSHOP2_READ_ROLES,
  WORKSHOP2_WRITE_ROLES,
} from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

async function getVault(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_READ_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  if (!cid || !aid) {
    return NextResponse.json(
      { ok: false, error: 'invalid_path', message: 'Некорректный путь API' },
      { status: 400 }
    );
  }
  if (!isWorkshop2PostgresEnabled()) {
    return NextResponse.json(workshop2DatabaseNotConfiguredResponse(), { status: 503 });
  }

  const organizationId = resolveWorkshop2OrganizationId(req);
  const documents = await listWorkshop2VaultDocumentsFromPg({
    collectionId: cid,
    articleId: aid,
    organizationId,
  });
  return NextResponse.json({ ok: true, documents });
}

async function putVault(req: NextRequest, ctx: RouteCtx) {
  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'invalid_json', message: 'Некорректное тело запроса' },
      { status: 400 }
    );
  }

  const b = body as Record<string, unknown>;
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES, {
    bodyActorLabel: String(b.createdBy ?? b.updatedBy ?? ''),
  });
  if (auth instanceof NextResponse) return auth;

  if (!cid || !aid) {
    return NextResponse.json(
      { ok: false, error: 'invalid_path', message: 'Некорректный путь API' },
      { status: 400 }
    );
  }
  if (!isWorkshop2PostgresEnabled()) {
    return NextResponse.json(workshop2DatabaseNotConfiguredResponse(), { status: 503 });
  }

  const documentId = String(b.documentId ?? '').trim();
  if (!documentId) {
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', message: 'Укажите documentId' },
      { status: 400 }
    );
  }

  const organizationId = resolveWorkshop2OrganizationId(req);
  const createdBy = resolveWorkshop2UpdatedBy(req, String(b.createdBy ?? ''), auth.actor);

  const storagePath = b.storagePath != null ? String(b.storagePath).trim() : '';
  const baseMeta =
    b.metadata && typeof b.metadata === 'object' ? (b.metadata as Record<string, unknown>) : {};

  let metadata = { ...baseMeta };
  if (storagePath) {
    const scanStatus = await runWorkshop2VaultVirusScanStub({
      documentId,
      storagePath,
    });
    metadata = buildWorkshop2VaultVirusScanMetadataPatch(scanStatus, {
      ...baseMeta,
      presignIssuedAt: undefined,
      uploadCompletedAt: new Date().toISOString(),
    });
    delete metadata.presignIssuedAt;
  }

  const record = await upsertWorkshop2VaultDocumentToPg({
    collectionId: cid,
    articleId: aid,
    documentId,
    organizationId,
    createdBy,
    fileName: b.fileName != null ? String(b.fileName) : undefined,
    mimeType: b.mimeType != null ? String(b.mimeType) : undefined,
    sizeBytes: typeof b.sizeBytes === 'number' ? b.sizeBytes : undefined,
    storagePath: storagePath || undefined,
    metadata,
  });

  if (storagePath) {
    bumpPlatformCoreDevelopmentStatus([cid]);
    void enqueueWorkshop2DomainEvent({
      type: 'dossier.gate_passed',
      collectionId: cid,
      articleId: aid,
      payload: { source: 'vault_upload', documentId },
      dispatchNow: true,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, document: record });
}

export const GET = withWorkshop2ApiErrorRu(getVault);
export const PUT = withWorkshop2ApiErrorRu(putVault);
