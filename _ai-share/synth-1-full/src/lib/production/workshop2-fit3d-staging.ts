/**
 * Wave 38 #55: Fit3D vault pipeline staging probe + journal.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  appendWorkshop2CeilingJournalEntry,
  workshop2CeilingJournalEntry,
  workshop2CeilingStagingHttpGet,
  type Workshop2CeilingFetchFn,
  type Workshop2CeilingJournalEntry,
} from '@/lib/production/workshop2-ceiling-staging-core';
import { isWorkshop2LiveFit3dConfigured } from '@/lib/production/workshop2-live-integration-probes-env';
import {
  extractWorkshop2StagingPartnerAckId,
  shouldRecordWorkshop2StagingContractPartnerAck,
  workshop2StagingContractMirrorAckFields,
} from '@/lib/production/workshop2-staging-contract-mode';
import { hasWorkshop2VaultGlbInIndex } from '@/lib/production/workshop2-fit3d-vault-gate';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function resolveWorkshop2Fit3dPipelineUrl(
  env?: Record<string, string | undefined>
): string | undefined {
  const e = env ?? (typeof process !== 'undefined' ? process.env : {});
  return (
    e.WORKSHOP2_VAULT_CAD_INGEST_URL?.trim() ||
    e.WORKSHOP2_FIT3D_VAULT_PIPELINE_URL?.trim() ||
    e.WORKSHOP2_VAULT_GLB_INGEST_URL?.trim() ||
    undefined
  );
}

export type Workshop2Fit3dStagingMirror = {
  mirroredAt: string;
  lastActor: string;
  vaultGlbIndexed: boolean;
  stagingUrl?: string;
  partnerAckRecorded: boolean;
  partnerAckId: string | null;
  ackAt: string | null;
  stagingContractMode: boolean;
  journal: Workshop2CeilingJournalEntry[];
  hintRu?: string;
};

export async function attemptWorkshop2Fit3dStagingProbe(input: {
  dossier: Workshop2DossierPhase1;
  actor: string;
  env?: Record<string, string | undefined>;
  fetchImpl?: Workshop2CeilingFetchFn;
}): Promise<{
  ok: boolean;
  dossier: Workshop2DossierPhase1;
  httpStatus?: number;
  error?: string;
  skipped?: boolean;
}> {
  const url = resolveWorkshop2Fit3dPipelineUrl(input.env);
  const prevJournal = input.dossier.fit3dStagingMirror?.journal;
  const prev = Array.isArray(prevJournal)
    ? (prevJournal as Workshop2CeilingJournalEntry[])
    : undefined;
  const vaultGlbIndexed = hasWorkshop2VaultGlbInIndex(input.dossier);

  if (!url) {
    const journal = appendWorkshop2CeilingJournalEntry(
      prev,
      workshop2CeilingJournalEntry({
        actor: input.actor,
        event: 'fit3d_pipeline_probe',
        outcome: 'skipped',
        error: 'pipeline_url_not_configured',
      })
    );
    const mirror: Workshop2Fit3dStagingMirror = {
      mirroredAt: new Date().toISOString(),
      lastActor: input.actor,
      vaultGlbIndexed,
      partnerAckRecorded: false,
      partnerAckId: null,
      ackAt: null,
      stagingContractMode: false,
      journal,
      hintRu: 'Fit3D pipeline URL не задан — vault .glb gate в production.',
    };
    return { ok: false, skipped: true, dossier: { ...input.dossier, fit3dStagingMirror: mirror } };
  }

  if (!isWorkshop2LiveFit3dConfigured(input.env)) {
    const journal = appendWorkshop2CeilingJournalEntry(
      prev,
      workshop2CeilingJournalEntry({
        actor: input.actor,
        event: 'fit3d_pipeline_probe',
        outcome: 'skipped',
        stagingUrl: url,
        error: 'probe_not_configured',
      })
    );
    return {
      ok: false,
      dossier: {
        ...input.dossier,
        fit3dStagingMirror: {
          mirroredAt: new Date().toISOString(),
          lastActor: input.actor,
          vaultGlbIndexed,
          stagingUrl: url,
          partnerAckRecorded: false,
          partnerAckId: null,
          ackAt: null,
          stagingContractMode: false,
          journal,
        },
      },
    };
  }

  const probeUrl = url.replace(/\/$/, '') + '/health';
  const result = await workshop2CeilingStagingHttpGet({
    url: probeUrl,
    fetchImpl: input.fetchImpl,
  });
  const contractAck = shouldRecordWorkshop2StagingContractPartnerAck(input.env ?? process.env, url);
  const ackId =
    contractAck && result.ok ? extractWorkshop2StagingPartnerAckId('fit3d', result.json) : null;
  const partnerAckRecorded = Boolean(contractAck && result.ok && ackId);
  const journal = appendWorkshop2CeilingJournalEntry(
    prev,
    workshop2CeilingJournalEntry({
      actor: input.actor,
      event: 'fit3d_pipeline_probe',
      outcome: result.ok ? 'success' : 'failed',
      httpStatus: result.httpStatus,
      error: result.error,
      stagingUrl: probeUrl,
      partnerAckRecorded,
      ackId,
    })
  );
  const ackMirror = workshop2StagingContractMirrorAckFields({
    journal,
    env: input.env,
  });
  const mirror: Workshop2Fit3dStagingMirror = {
    mirroredAt: new Date().toISOString(),
    lastActor: input.actor,
    vaultGlbIndexed,
    stagingUrl: url,
    partnerAckRecorded: ackMirror.partnerAckRecorded,
    partnerAckId: ackMirror.partnerAckId,
    ackAt: ackMirror.ackAt,
    stagingContractMode: ackMirror.stagingContractMode,
    journal,
    hintRu: partnerAckRecorded
      ? `Staging contract pipeline ACK: ${ackId} (prod .glb ingest — отдельный env).`
      : result.ok
        ? 'Pipeline probe OK — production всё ещё требует .glb в vault index.'
        : `Pipeline probe failed: ${result.error ?? 'http error'}`,
  };
  return {
    ok: result.ok,
    httpStatus: result.httpStatus,
    error: result.error,
    dossier: { ...input.dossier, fit3dStagingMirror: mirror },
  };
}

export function evaluateWorkshop2Fit3dStagingSampleGate(input: {
  dossier: Workshop2DossierPhase1;
  nodeEnv?: string;
}): Workshop2HandoffReadinessCheck | null {
  const prod = (input.nodeEnv ?? process.env.NODE_ENV) === 'production';
  if (!prod) return null;
  if (!hasWorkshop2VaultGlbInIndex(input.dossier)) {
    return {
      id: 'fit3d.staging.no_glb_index',
      severity: 'blocker',
      messageRu:
        'Fit3D: нет .glb в vault — загрузите модель или настройте pipeline (см. WORKSHOP2_VAULT_CAD_INGEST_URL).',
    };
  }
  return null;
}

export function evaluateWorkshop2Fit3dStagingExportGate(input: {
  dossier: Workshop2DossierPhase1;
}): Workshop2HandoffReadinessCheck | null {
  const mirror = input.dossier.fit3dStagingMirror;
  if (!mirror) {
    return {
      id: 'fit3d.staging.missing',
      severity: 'warning',
      messageRu: 'Fit3D staging journal не в досье.',
    };
  }
  if (
    Array.isArray(mirror.journal) &&
    (mirror.journal as Workshop2CeilingJournalEntry[]).some((j) => j.outcome === 'failed')
  ) {
    return {
      id: 'fit3d.staging.probe_failed',
      severity: 'warning',
      messageRu: workshop2PgMirrorStr(mirror, 'hintRu') || 'Fit3D pipeline probe failed.',
    };
  }
  return null;
}
