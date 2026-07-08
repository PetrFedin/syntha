/**
 * Wave 24 #75: зеркало vault panel + gate handoff-readiness alignment.
 */
import { summarizeWorkshop2VaultPanelStatus } from '@/lib/production/workshop2-vault-panel-status';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { WORKSHOP2_HANDOFF_DEFAULT_MIN_VAULT_FILES } from '@/lib/production/workshop2-handoff-readiness';
import {
  workshop2PgMirrorNum,
  workshop2PgMirrorStr,
} from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import {
  evaluateWorkshop2VaultVirusScanExportGate,
  evaluateWorkshop2VaultVirusScanHandoffGate,
} from '@/lib/production/workshop2-vault-virus-scan';

export function buildWorkshop2VaultPanelMirror(input: {
  backendMode: 'server' | 'local';
  vaultDocuments: { storagePath?: string | null; metadata?: Record<string, unknown> | null }[];
  nodeEnv?: string;
  s3Configured?: boolean;
  pgIndexedOk?: boolean;
}): NonNullable<Workshop2DossierPhase1['vaultPanelMirror']> {
  const status = summarizeWorkshop2VaultPanelStatus(input);
  const minVault = WORKSHOP2_HANDOFF_DEFAULT_MIN_VAULT_FILES;
  const blockerHandoff = !status.handoffVaultOk && input.backendMode === 'server';

  return {
    mirroredAt: new Date().toISOString(),
    totalDocs: status.totalDocs,
    withStoragePath: status.withStoragePath,
    minVaultRequired: minVault,
    handoffVaultOk: status.handoffVaultOk,
    backendMode: input.backendMode,
    state: status.state,
    blockerHandoff,
    s3PresignGuard: status.s3PresignGuard,
    virusScanPendingCount: status.virusScanPendingCount,
    virusScanFailedCount: status.virusScanFailedCount,
    orphanPresignCount: status.orphanPresignCount,
    pgIndexedOk: status.pgIndexedOk,
    hintRu: status.hintRu,
  };
}

export function persistWorkshop2VaultPanelMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: {
    backendMode: 'server' | 'local';
    vaultDocuments: { storagePath?: string | null; metadata?: Record<string, unknown> | null }[];
    nodeEnv?: string;
    s3Configured?: boolean;
    pgIndexedOk?: boolean;
  }
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    vaultPanelMirror: buildWorkshop2VaultPanelMirror(input),
  };
}

/** Wave 36 #75: export-tz vault mirror + virus scan. */
export function evaluateWorkshop2VaultPanelExportGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const virus = evaluateWorkshop2VaultVirusScanExportGate({ dossier });
  if (virus) return virus;
  const mirror = dossier.vaultPanelMirror;
  if (!mirror) {
    return {
      id: 'export.vault.mirror_missing',
      severity: 'warning',
      messageRu: 'ZIP ТЗ: vaultPanelMirror отсутствует — «Vault → PG» на вкладке Vault.',
    };
  }
  if (mirror.s3PresignGuard === 'prod_blocked') {
    return {
      id: 'export.vault.s3_prod_blocked',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'ZIP ТЗ: S3 обязателен в production для vault binaries.',
    };
  }
  if (
    !mirror.handoffVaultOk &&
    workshop2PgMirrorNum(mirror, 'withStoragePath') <
      workshop2PgMirrorNum(mirror, 'minVaultRequired')
  ) {
    return {
      id: 'export.vault.min_files',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        `ZIP ТЗ: vault ${workshop2PgMirrorNum(mirror, 'withStoragePath')}/${workshop2PgMirrorNum(mirror, 'minVaultRequired')} storage_path.`,
    };
  }
  return null;
}

export function evaluateWorkshop2VaultPanelHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const virus = evaluateWorkshop2VaultVirusScanHandoffGate({ dossier });
  if (virus) return virus;

  const mirror = dossier.vaultPanelMirror;
  if (!mirror) {
    return {
      id: 'vault.panel.mirror_missing',
      severity: 'warning',
      messageRu: 'Vault snapshot не в PG — откройте вкладку Vault для синхронизации.',
    };
  }
  if (mirror.blockerHandoff) {
    return {
      id: 'vault.files.min',
      severity: 'blocker',
      messageRu:
        mirror.hintRu ??
        `В Vault нужно минимум ${mirror.minVaultRequired} файл(ов) с storage_path (сейчас ${mirror.withStoragePath}).`,
    };
  }
  if (mirror.state === 'blocked') {
    return {
      id: 'vault.s3.blocked',
      severity: 'warning',
      messageRu: mirror.hintRu ?? 'S3 upload заблокирован в prod — vault только local.',
    };
  }
  return null;
}

/** Wave 26 #75: warning sample-order при неполном vault snapshot (2-й слой). */
export function evaluateWorkshop2VaultPanelSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.vaultPanelMirror;
  if (!mirror) {
    return {
      id: 'vault.panel.mirror_missing',
      severity: 'warning',
      messageRu: 'Vault snapshot не в PG — «Vault → PG» перед заказом образца.',
    };
  }
  if (mirror.blockerHandoff) {
    return {
      id: 'vault.files.min',
      severity: 'warning',
      messageRu:
        mirror.hintRu ??
        `Vault: нужно ${mirror.minVaultRequired} файл(ов) с storage_path для полного пакета образца.`,
    };
  }
  if (mirror.state === 'empty' || mirror.totalDocs === 0) {
    return {
      id: 'vault.panel.empty',
      severity: 'warning',
      messageRu:
        mirror.hintRu ?? 'Vault пуст — загрузите договор/сертификат для сопровождения образца.',
    };
  }
  return null;
}
