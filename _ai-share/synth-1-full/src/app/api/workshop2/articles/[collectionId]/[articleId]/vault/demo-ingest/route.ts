/**
 * PUT — demo vault ingest (Platform Core без S3): PG metadata + virus-scan stub clean.
 */
import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  buildWorkshop2VaultDemoStoragePath,
  isWorkshop2VaultPresignCoreDemoBypassEnabled,
} from '@/lib/production/workshop2-vault-presign-core-demo';
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
} from '@/lib/server/workshop2-api-context';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

export const PUT = withWorkshop2ApiErrorRu(async function putVaultDemoIngest(
  req: NextRequest,
  ctx: RouteCtx
) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  if (!isWorkshop2VaultPresignCoreDemoBypassEnabled()) {
    return jsonWorkshop2ErrorRu(503, 'vault_demo_disabled', {
      messageRu: 'Demo vault ingest только в Platform Core без S3.',
    });
  }
  if (!isWorkshop2PostgresEnabled()) {
    return jsonWorkshop2ErrorRu(503, 'pg_required');
  }

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  const documentId = req.nextUrl.searchParams.get('documentId')?.trim() ?? '';
  if (!cid || !aid || !documentId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_context');
  }

  const orgId = resolveWorkshop2OrganizationId(req);
  const existing = await listWorkshop2VaultDocumentsFromPg({
    collectionId: cid,
    articleId: aid,
    organizationId: orgId,
  });
  const row = existing.find((d) => d.documentId === documentId);
  const storagePath = buildWorkshop2VaultDemoStoragePath({
    collectionId: cid,
    articleId: aid,
    documentId,
  });
  const scanStatus = await runWorkshop2VaultVirusScanStub({
    documentId,
    storagePath,
    env: { ...process.env, WORKSHOP2_VIRUS_SCAN_STUB_AUTO_CLEAN: 'true' },
  });
  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'vault-demo-ingest';
  const record = await upsertWorkshop2VaultDocumentToPg({
    collectionId: cid,
    articleId: aid,
    documentId,
    organizationId: orgId,
    createdBy: actor,
    fileName: row?.fileName ?? 'demo-upload.bin',
    mimeType: row?.mimeType ?? 'application/octet-stream',
    sizeBytes: row?.sizeBytes,
    storagePath,
    metadata: buildWorkshop2VaultVirusScanMetadataPatch(scanStatus, {
      ...(row?.metadata ?? {}),
      demoIngest: true,
      uploadCompletedAt: new Date().toISOString(),
    }),
  });

  bumpPlatformCoreDevelopmentStatus([cid]);
  void enqueueWorkshop2DomainEvent({
    type: 'dossier.gate_passed',
    collectionId: cid,
    articleId: aid,
    payload: { source: 'vault_demo_ingest', documentId },
    dispatchNow: true,
  }).catch(() => {});

  return NextResponse.json({ ok: true, document: record, virusScanStatus: scanStatus });
});
