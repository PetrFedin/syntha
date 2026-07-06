import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';
import { evaluateWorkshop2VaultPresignProdGuard } from '@/lib/production/workshop2-vault-presign-prod-guard';
import {
  buildWorkshop2VaultDemoIngestUrl,
  isWorkshop2VaultPresignCoreDemoBypassEnabled,
} from '@/lib/production/workshop2-vault-presign-core-demo';
import { buildWorkshop2VaultVirusScanMetadataPatch } from '@/lib/production/workshop2-vault-virus-scan';
import {
  presignWorkshop2VaultGet,
  presignWorkshop2VaultPut,
  isWorkshop2VaultS3Configured,
} from '@/lib/server/workshop2-vault-s3';
import {
  listWorkshop2VaultDocumentsFromPg,
  upsertWorkshop2VaultDocumentToPg,
} from '@/lib/server/workshop2-dossier-repository';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import {
  resolveWorkshop2OrganizationId,
  resolveWorkshop2UpdatedBy,
} from '@/lib/server/workshop2-api-context';
import { getUnknownErrorMessage } from '@/lib/unknown-error-message';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

async function postVaultPresign(req: NextRequest, ctx: RouteCtx) {
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
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  if (!cid || !aid) {
    return NextResponse.json(
      { ok: false, error: 'invalid_path', message: 'Некорректный путь API' },
      { status: 400 }
    );
  }
  const demoBypass = isWorkshop2VaultPresignCoreDemoBypassEnabled();
  const prodGuard = evaluateWorkshop2VaultPresignProdGuard();
  if (!prodGuard.allowed && !demoBypass) {
    return NextResponse.json(
      {
        ok: false,
        error: prodGuard.code ?? 'vault_s3_required_in_prod',
        message: prodGuard.messageRu,
      },
      { status: 503 }
    );
  }

  if (!isWorkshop2VaultS3Configured()) {
    const intentEarly = String(b.intent ?? 'put')
      .trim()
      .toLowerCase();
    if (intentEarly === 'get') {
      return NextResponse.json(
        { ok: false, error: 'vault_demo_get_unavailable', message: 'Demo vault: только PUT ingest.' },
        { status: 503 }
      );
    }
    if (demoBypass && isWorkshop2PostgresEnabled()) {
      const documentId = String(b.documentId ?? '').trim();
      const fileName = String(b.fileName ?? 'file.bin');
      const contentType = String(b.contentType ?? 'application/octet-stream')
        .split(';')[0]!
        .trim();
      const sizeBytes = Number(b.sizeBytes);
      if (!documentId) {
        return NextResponse.json(
          { ok: false, error: 'document_id_required', message: 'Укажите documentId' },
          { status: 400 }
        );
      }
      const orgId = resolveWorkshop2OrganizationId(req);
      const existing = await listWorkshop2VaultDocumentsFromPg({
        collectionId: cid,
        articleId: aid,
        organizationId: orgId,
      });
      const row = existing.find((d) => d.documentId === documentId);
      if (row?.storagePath?.trim()) {
        return NextResponse.json(
          {
            ok: false,
            error: 'document_already_uploaded',
            message: 'Документ уже загружен.',
          },
          { status: 409 }
        );
      }
      const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor);
      await upsertWorkshop2VaultDocumentToPg({
        collectionId: cid,
        articleId: aid,
        documentId,
        organizationId: orgId,
        fileName,
        mimeType: contentType,
        sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : undefined,
        createdBy: actor,
        metadata: buildWorkshop2VaultVirusScanMetadataPatch('awaiting_upload', {
          ...(row?.metadata ?? {}),
          presignIssuedAt: new Date().toISOString(),
          demoBypass: true,
        }),
      });
      const uploadUrl = buildWorkshop2VaultDemoIngestUrl({
        collectionId: cid,
        articleId: aid,
        documentId,
      });
      return NextResponse.json({
        ok: true,
        uploadUrl,
        storagePath: `demo://vault/${cid}/${aid}/${documentId}`,
        method: 'PUT',
        contentType,
        demoBypass: true,
      });
    }
    return NextResponse.json(
      {
        ok: false,
        error: 'vault_s3_not_configured',
        message: 'Настройте WORKSHOP2_S3_* или W2_METRICS_S3_* для загрузки Vault.',
      },
      { status: 503 }
    );
  }

  const intent = String(b.intent ?? 'put')
    .trim()
    .toLowerCase();

  try {
    if (intent === 'get') {
      const storagePath = String(b.storagePath ?? '').trim();
      if (!storagePath) {
        return NextResponse.json(
          { ok: false, error: 'storage_path_required', message: 'Укажите storagePath' },
          { status: 400 }
        );
      }
      const { downloadUrl, expiresIn } = await presignWorkshop2VaultGet(storagePath);
      return NextResponse.json({ ok: true, downloadUrl, expiresIn });
    }

    const documentId = String(b.documentId ?? '').trim();
    const fileName = String(b.fileName ?? 'file.bin');
    const contentType = String(b.contentType ?? 'application/octet-stream')
      .split(';')[0]!
      .trim();
    const sizeBytes = Number(b.sizeBytes);
    if (!documentId) {
      return NextResponse.json(
        { ok: false, error: 'document_id_required', message: 'Укажите documentId' },
        { status: 400 }
      );
    }

    if (isWorkshop2PostgresEnabled()) {
      const orgId = resolveWorkshop2OrganizationId(req);
      const existing = await listWorkshop2VaultDocumentsFromPg({
        collectionId: cid,
        articleId: aid,
        organizationId: orgId,
      });
      const row = existing.find((d) => d.documentId === documentId);
      if (row?.storagePath?.trim()) {
        return NextResponse.json(
          {
            ok: false,
            error: 'document_already_uploaded',
            message: 'Документ уже имеет storage_path — presign orphan запрещён.',
          },
          { status: 409 }
        );
      }
      const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor);
      await upsertWorkshop2VaultDocumentToPg({
        collectionId: cid,
        articleId: aid,
        documentId,
        organizationId: orgId,
        fileName,
        mimeType: contentType,
        sizeBytes: Number.isFinite(sizeBytes) ? sizeBytes : undefined,
        createdBy: actor,
        metadata: buildWorkshop2VaultVirusScanMetadataPatch('awaiting_upload', {
          ...(row?.metadata ?? {}),
          presignIssuedAt: new Date().toISOString(),
        }),
      });
    }

    const { uploadUrl, storagePath, method } = await presignWorkshop2VaultPut({
      collectionId: cid,
      articleId: aid,
      documentId,
      fileName,
      contentType,
      sizeBytes,
    });
    return NextResponse.json({ ok: true, uploadUrl, storagePath, method, contentType });
  } catch (e) {
    const msg = getUnknownErrorMessage(e, 'presign_failed');
    if (msg === 'size_rejected') {
      return jsonWorkshop2ErrorRu(400, 'file_size_rejected', {
        messageRu: 'Размер файла не допускается',
      });
    }
    return NextResponse.json(
      { ok: false, error: 'presign_failed', message: 'Не удалось выдать presigned URL' },
      { status: 500 }
    );
  }
}

export const POST = withWorkshop2ApiErrorRu(postVaultPresign);
