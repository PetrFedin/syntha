/**
 * Wave 30 #40: аудит CAD vault link + gates (не demo zprj как success path).
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import {
  countCadVaultMetadataMeasures,
  extractCadMeasuresFromVaultMetadata,
  isCadVaultDocument,
  meetsWorkshop2CadViewerMinimum,
} from '@/lib/production/workshop2-cad-metadata';

export type Workshop2CadVaultDocInput = {
  documentId: string;
  fileName?: string;
  storagePath?: string;
  metadata?: Record<string, unknown>;
};

export function buildWorkshop2CadVaultLinkMirror(input: {
  vaultCadDocs: Workshop2CadVaultDocInput[];
  proprietaryDemoParseActive?: boolean;
}): NonNullable<Workshop2DossierPhase1['cadVaultLinkMirror']> {
  const linked = input.vaultCadDocs.filter(
    (d) => isCadVaultDocument(d.metadata) && Boolean(d.storagePath?.trim())
  );
  const measureCount = linked.reduce(
    (acc, d) =>
      acc + countCadVaultMetadataMeasures(extractCadMeasuresFromVaultMetadata(d.metadata)),
    0
  );
  const vaultReady = meetsWorkshop2CadViewerMinimum(
    linked.flatMap((d) => extractCadMeasuresFromVaultMetadata(d.metadata))
  );
  const demoOnly = Boolean(input.proprietaryDemoParseActive) && !vaultReady;
  const cadIngestPath: 'vault_cad_ingest' | 'demo_zprj' | 'none' = demoOnly
    ? 'demo_zprj'
    : linked.length > 0
      ? 'vault_cad_ingest'
      : 'none';
  const serverWorkflowEnabled = cadIngestPath === 'vault_cad_ingest' && vaultReady;
  const blockerSampleOrder = demoOnly;
  const blockerHandoff = demoOnly;

  let hintRu: string | undefined;
  if (demoOnly) {
    hintRu = 'CAD: только демо-парсинг .zprj — cad-ingest в Vault или «CAD mirror → PG».';
  } else if (linked.length === 0) {
    hintRu = 'Нет CAD в Vault с storagePath — cad-ingest или mirror sync.';
  } else if (!vaultReady) {
    hintRu = `Vault CAD без достаточных measures (${measureCount}) — cad-ingest metadata.`;
  }

  return {
    mirroredAt: new Date().toISOString(),
    vaultCadCount: linked.length,
    vaultMeasureCount: measureCount,
    vaultReady,
    proprietaryDemoOnly: demoOnly,
    cadIngestPath,
    serverWorkflowEnabled,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function persistWorkshop2CadVaultLinkMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: Parameters<typeof buildWorkshop2CadVaultLinkMirror>[0]
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    cadVaultLinkMirror: buildWorkshop2CadVaultLinkMirror(input),
  };
}

export function evaluateWorkshop2CadVaultLinkSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.cadVaultLinkMirror;
  if (!mirror) {
    return {
      id: 'cad.vault.mirror_missing',
      severity: 'warning',
      messageRu: 'CAD vault audit не в досье — откройте конструкцию после загрузки Vault CAD.',
    };
  }
  if (mirror.blockerSampleOrder === true) {
    return {
      id: 'cad.vault.demo_only',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'CAD не подтверждён в Vault — заказ образца заблокирован до cad-ingest.',
    };
  }
  const vaultCadCount = workshop2PgMirrorNum(mirror, 'vaultCadCount');
  if (mirror.vaultReady !== true && vaultCadCount > 0) {
    return {
      id: 'cad.vault.measures_low',
      severity: 'warning',
      messageRu: workshop2PgMirrorStr(mirror, 'hintRu') || 'Vault CAD без полного набора measures.',
    };
  }
  return null;
}

export function evaluateWorkshop2CadVaultLinkHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.cadVaultLinkMirror;
  if (!mirror) {
    return {
      id: 'cad.vault.mirror_missing_handoff',
      severity: 'warning',
      messageRu: 'CAD vault audit не в досье — обновите перед handoff.',
    };
  }
  if (mirror.blockerHandoff === true) {
    return {
      id: 'cad.vault.demo_only_handoff',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'CAD demo-only — handoff commit заблокирован до Vault cad-ingest.',
    };
  }
  return null;
}

/** Wave 35: export-tz — CAD vault ingest path. */
export function evaluateWorkshop2CadVaultLinkExportGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.cadVaultLinkMirror;
  if (!mirror) {
    return {
      id: 'cad.vault.export_missing',
      severity: 'warning',
      messageRu: 'ZIP ТЗ: CAD vault audit не в досье.',
    };
  }
  if (mirror.proprietaryDemoOnly === true || mirror.cadIngestPath === 'demo_zprj') {
    return {
      id: 'cad.vault.export_demo_only',
      severity: 'blocker',
      messageRu: workshop2PgMirrorStr(mirror, 'hintRu') || 'ZIP ТЗ: CAD demo-only заблокирован.',
    };
  }
  return null;
}
