/**
 * Wave YS — mfr dev 3.1: PG mirror brand development-status, peer strip, poll dedupe.
 * E2E: core-234-wave-ys-dev-status.spec.ts
 */
import { ROUTES } from '@/lib/routes';
import { factorySampleQueueDeepHref } from '@/lib/platform/wave-xc-mfr-sample-status-patch';
import { WAVE_ZE_MFR_DEV_MIRROR_BADGE_RU } from '@/lib/platform/wave-ze-hub-diagnostics-ru';

export const WAVE_YS_E2E_SPEC = 'core-234-wave-ys-dev-status.spec.ts';

export const WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU = WAVE_ZE_MFR_DEV_MIRROR_BADGE_RU;

export const WAVE_YS_MFR_DEV_STATUS_MIRROR_STRIP_TESTID = 'mfr-dev-development-status-mirror-strip';
export const WAVE_YS_MFR_DEV_STATUS_MIRROR_PG_BADGE_TESTID =
  'mfr-dev-development-status-mirror-pg-badge';
export const WAVE_YS_MFR_DEV_STATUS_MIRROR_BADGE_TESTID = 'mfr-dev-development-status-mirror-badge';
export const WAVE_YS_MFR_DEV_STATUS_MIRROR_STEPS_TESTID = 'mfr-dev-development-status-mirror-steps';
export const WAVE_YS_MFR_DEV_STATUS_MIRROR_META_TESTID = 'mfr-dev-development-status-mirror-meta';

export const WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID = 'mfr-dev-development-status-peer-strip';
export const WAVE_YS_MFR_DEV_BRAND_DEV_STATUS_LINK_TESTID = 'mfr-dev-brand-dev-status-link';
export const WAVE_YS_MFR_DEV_SAMPLE_QUEUE_PEER_LINK_TESTID = 'mfr-dev-sample-queue-peer-link';

export const WAVE_YS_BRAND_DEV_STATUS_RU = 'Статус разработки бренда';
export const WAVE_YS_SAMPLE_QUEUE_RU = 'Очередь образцов';

export function buildMfrDevBrandDevelopmentStatusPeerHref(collectionId: string): string {
  return `${ROUTES.brand.coreCabinet}?pillar=development&collection=${encodeURIComponent(collectionId.trim())}`;
}

export function buildMfrDevSampleQueuePeerHref(input: {
  collectionId: string;
  factoryId?: string;
  articleId?: string;
}): string {
  return factorySampleQueueDeepHref(input);
}

/** Closed wave YS mfr dev status mirror wiring (3.1). */
export const WAVE_YS_MFR_DEV_STATUS_MIRROR_FIXES = [
  {
    id: 'mfr-dev-pg-mirror-strip',
    file: 'components/factory/MfrDevDevelopmentStatusMirrorStrip.tsx',
    mustContain: [
      'WAVE_YS_MFR_DEV_PG_MIRROR_BADGE_RU',
      'suppressDevPollHook',
      'showDiagnostics',
      'mfrSampleQueuePollLabelRu',
    ],
  },
  {
    id: 'mfr-dev-status-peer-strip',
    file: 'components/factory/MfrDevDevelopmentStatusPeerStrip.tsx',
    mustContain: [
      'WAVE_YS_MFR_DEV_STATUS_PEER_STRIP_TESTID',
      'WAVE_YS_BRAND_DEV_STATUS_RU',
      'WAVE_YS_SAMPLE_QUEUE_RU',
      'buildMfrDevBrandDevelopmentStatusPeerHref',
      'buildMfrDevSampleQueuePeerHref',
    ],
  },
  {
    id: 'dev-pillar-mfr-wiring',
    file: 'components/platform/DevelopmentPillarCard.tsx',
    mustContain: [
      'shouldShowHubCabinetPgSyncDiagnostics',
      'shouldSuppressHubCabinetChainStatusBadge',
      'MfrDevDevelopmentStatusPeerStrip',
      'suppressDevPollHook',
    ],
  },
] as const;
