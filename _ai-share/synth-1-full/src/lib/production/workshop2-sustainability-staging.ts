/**
 * Wave 38 #53: LCA/registry staging + journal (fail-closed).
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  appendWorkshop2CeilingJournalEntry,
  workshop2CeilingJournalEntry,
  workshop2CeilingStagingHttpPost,
  type Workshop2CeilingFetchFn,
  type Workshop2CeilingJournalEntry,
} from '@/lib/production/workshop2-ceiling-staging-core';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import { isWorkshop2LiveSustainabilityConfigured } from '@/lib/production/workshop2-live-integration-probes-env';
import {
  extractWorkshop2StagingPartnerAckId,
  shouldRecordWorkshop2StagingContractPartnerAck,
  workshop2StagingContractMirrorAckFields,
} from '@/lib/production/workshop2-staging-contract-mode';
import { buildWorkshop2SustainabilityLcaSnapshot } from '@/lib/production/workshop2-sustainability-lca-persist';

export function resolveWorkshop2LcaStagingUrl(
  env?: Record<string, string | undefined>
): string | undefined {
  const e = env ?? (typeof process !== 'undefined' ? process.env : {});
  return (
    e.WORKSHOP2_LCA_API_URL?.trim() ||
    e.WORKSHOP2_LCA_FEED_URL?.trim() ||
    e.WORKSHOP2_CERTIFIED_LCA_FEED_URL?.trim() ||
    e.WORKSHOP2_SUSTAINABILITY_REGISTRY_URL?.trim() ||
    undefined
  );
}

export type Workshop2SustainabilityStagingMirror = {
  mirroredAt: string;
  lastActor: string;
  stagingUrl?: string;
  registryAckRecorded: boolean;
  partnerAckRecorded: boolean;
  partnerAckId: string | null;
  ackAt: string | null;
  stagingContractMode: boolean;
  journal: Workshop2CeilingJournalEntry[];
  hintRu?: string;
};

export function buildWorkshop2SustainabilityStagingMirror(input: {
  actor: string;
  journal: Workshop2CeilingJournalEntry[];
  env?: Record<string, string | undefined>;
}): Workshop2SustainabilityStagingMirror {
  const url = resolveWorkshop2LcaStagingUrl(input.env);
  const last = input.journal[input.journal.length - 1];
  const ack = workshop2StagingContractMirrorAckFields({
    journal: input.journal,
    env: input.env,
  });
  return {
    mirroredAt: new Date().toISOString(),
    lastActor: input.actor,
    stagingUrl: url,
    registryAckRecorded: ack.partnerAckRecorded,
    partnerAckRecorded: ack.partnerAckRecorded,
    partnerAckId: ack.partnerAckId,
    ackAt: ack.ackAt,
    stagingContractMode: ack.stagingContractMode,
    journal: input.journal,
    hintRu: ack.partnerAckRecorded
      ? `Staging contract LCA ACK: ${ack.partnerAckId} (prod certified feed — отдельный env).`
      : last?.outcome === 'failed'
        ? `LCA staging failed: ${last.error ?? 'unknown'}`
        : url
          ? 'Certified LCA feed URL задан — staging без registry ACK остаётся 8.9 max.'
          : 'LCA из BOM only — задайте WORKSHOP2_LCA_API_URL для staging.',
  };
}

export async function attemptWorkshop2SustainabilityStaging(input: {
  dossier: Workshop2DossierPhase1;
  collectionId: string;
  articleId: string;
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
  const url = resolveWorkshop2LcaStagingUrl(input.env);
  const prevJournal = input.dossier.sustainabilityStagingMirror?.journal;
  const prev = Array.isArray(prevJournal)
    ? (prevJournal as import('@/lib/production/workshop2-ceiling-staging-core').Workshop2CeilingJournalEntry[])
    : undefined;
  if (!url) {
    const journal = appendWorkshop2CeilingJournalEntry(
      prev,
      workshop2CeilingJournalEntry({
        actor: input.actor,
        event: 'lca_staging',
        outcome: 'skipped',
        error: 'lca_url_not_configured',
      })
    );
    const mirror = buildWorkshop2SustainabilityStagingMirror({
      actor: input.actor,
      journal,
      env: input.env,
    });
    const snap = buildWorkshop2SustainabilityLcaSnapshot({
      dossier: input.dossier,
      collectionId: input.collectionId,
      articleId: input.articleId,
    });
    return {
      ok: false,
      skipped: true,
      dossier: {
        ...input.dossier,
        sustainabilityStagingMirror: mirror,
        sustainabilityLcaSnapshot: snap,
      },
    };
  }
  if (!isWorkshop2LiveSustainabilityConfigured(input.env)) {
    const journal = appendWorkshop2CeilingJournalEntry(
      prev,
      workshop2CeilingJournalEntry({
        actor: input.actor,
        event: 'lca_staging',
        outcome: 'skipped',
        error: 'probe_not_configured',
        stagingUrl: url,
      })
    );
    const mirror = buildWorkshop2SustainabilityStagingMirror({
      actor: input.actor,
      journal,
      env: input.env,
    });
    return {
      ok: false,
      dossier: { ...input.dossier, sustainabilityStagingMirror: mirror },
    };
  }
  const snap = buildWorkshop2SustainabilityLcaSnapshot({
    dossier: input.dossier,
    collectionId: input.collectionId,
    articleId: input.articleId,
  });
  const result = await workshop2CeilingStagingHttpPost({
    baseUrl: url,
    path: '/certify',
    body: { collectionId: input.collectionId, articleId: input.articleId, ecoScore: snap.ecoScore },
    fetchImpl: input.fetchImpl,
  });
  const contractAck = shouldRecordWorkshop2StagingContractPartnerAck(input.env ?? process.env, url);
  const ackId = contractAck
    ? extractWorkshop2StagingPartnerAckId('sustainability', result.json)
    : null;
  const partnerAckRecorded = Boolean(contractAck && result.ok && ackId);
  const journal = appendWorkshop2CeilingJournalEntry(
    prev,
    workshop2CeilingJournalEntry({
      actor: input.actor,
      event: 'lca_staging',
      outcome: result.ok ? 'success' : 'failed',
      httpStatus: result.httpStatus,
      error: result.error,
      stagingUrl: url,
      partnerAckRecorded,
      ackId,
    })
  );
  const mirror = buildWorkshop2SustainabilityStagingMirror({
    actor: input.actor,
    journal,
    env: input.env,
  });
  return {
    ok: result.ok,
    httpStatus: result.httpStatus,
    error: result.error,
    dossier: {
      ...input.dossier,
      sustainabilityStagingMirror: mirror,
      sustainabilityLcaSnapshot: snap,
    },
  };
}

export function evaluateWorkshop2SustainabilityStagingExportGate(input: {
  dossier: Workshop2DossierPhase1;
}): Workshop2HandoffReadinessCheck | null {
  const mirror = input.dossier.sustainabilityStagingMirror;
  if (!mirror) {
    return {
      id: 'sustainability.staging.missing',
      severity: 'warning',
      messageRu: 'LCA staging journal не в досье — «LCA staging → PG» на снабжении.',
    };
  }
  if (
    Array.isArray(mirror.journal) &&
    (mirror.journal as Workshop2CeilingJournalEntry[]).some((j) => j.outcome === 'failed')
  ) {
    return {
      id: 'sustainability.staging.failed',
      severity: 'warning',
      messageRu: workshop2PgMirrorStr(mirror, 'hintRu') || 'LCA staging failed — export warning.',
    };
  }
  return null;
}
