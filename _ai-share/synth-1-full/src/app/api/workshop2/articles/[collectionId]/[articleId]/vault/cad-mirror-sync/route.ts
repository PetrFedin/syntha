/**
 * POST wave 35 #40: Vault CAD docs → cadVaultLinkMirror в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import {
  persistWorkshop2CadVaultLinkMirrorToDossier,
  type Workshop2CadVaultDocInput,
} from '@/lib/production/workshop2-cad-vault-dossier-persist';
import { listWorkshop2VaultDocumentsFromPg } from '@/lib/server/workshop2-dossier-repository';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  workshop2DossierPutFailureMessageRu,
  workshop2DossierPutFailureStatus,
} from '@/lib/server/workshop2-dossier-put-utils';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';

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

  let proprietaryDemoParseActive = false;
  try {
    const body = (await req.json()) as { proprietaryDemoParseActive?: boolean };
    proprietaryDemoParseActive = Boolean(body.proprietaryDemoParseActive);
  } catch {
    /* empty */
  }

  const docs = await listWorkshop2VaultDocumentsFromPg({ collectionId: cid, articleId: aid });
  const vaultCadDocs: Workshop2CadVaultDocInput[] = docs.map((d) => ({
    documentId: d.documentId,
    fileName: d.fileName,
    storagePath: d.storagePath,
    metadata: d.metadata,
  }));

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'cad-mirror-api';
  const nextDossier = persistWorkshop2CadVaultLinkMirrorToDossier(record.dossier, {
    vaultCadDocs,
    proprietaryDemoParseActive,
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: nextDossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_cad_vault_mirror_sync' },
  });

  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  return NextResponse.json({
    ok: true,
    mirror: nextDossier.cadVaultLinkMirror,
    dossierVersion: saved.record.version,
    vaultCadCount: vaultCadDocs.length,
  });
}
