/**
 * Wave 34 P1: 3D virtual showroom stream token scaffold (без fake live ACK).
 */
import type { Workshop2ProcessEnvLike } from '@/lib/production/workshop2-live-integration-probes-env';

export type Workshop2B2bShowroom3dStreamMode = 'placeholder' | 'live';
export type Workshop2B2bShowroom3dEmbedMode = 'iframe' | 'sdk-stub' | 'sdk';

export type Workshop2B2bShowroom3dStreamTokenResponse = {
  mode: Workshop2B2bShowroom3dStreamMode;
  token?: string;
  streamUrlConfigured: boolean;
  hintRu: string;
};

export type Workshop2B2bShowroom3dStreamPayload = Workshop2B2bShowroom3dStreamTokenResponse & {
  ok: true;
  embedMode: Workshop2B2bShowroom3dEmbedMode;
  embedUrl: string;
  sdkScriptUrl?: string;
  sdkConfig?: {
    sdkUrl: string;
    sdkScriptUrl?: string;
    targetOrigin: string;
    bridgeVersion: string;
    handshakeEvent: string;
  };
  providerId?: 'matterport' | 'generic' | 'default';
  expiresAt?: string;
  demoMode?: boolean;
};

export function resolveWorkshop2B2bShowroom3dStreamToken(
  env: Workshop2ProcessEnvLike = process.env
): Workshop2B2bShowroom3dStreamTokenResponse {
  const streamUrl = String(env.WORKSHOP2_B2B_3D_STREAM_URL ?? '').trim();
  if (!streamUrl) {
    return {
      mode: 'placeholder',
      streamUrlConfigured: false,
      hintRu:
        '3D stream не настроен: задайте WORKSHOP2_B2B_3D_STREAM_URL на staging (RU tooltip в UI).',
    };
  }
  const tokenSeed = `${streamUrl}:w34-scaffold`;
  let hash = 0;
  for (let i = 0; i < tokenSeed.length; i++) {
    hash = (hash * 31 + tokenSeed.charCodeAt(i)) >>> 0;
  }
  return {
    mode: 'live',
    token: `w2-3d-${hash.toString(16).padStart(8, '0')}`,
    streamUrlConfigured: true,
    hintRu: '3D stream URL задан — token scaffold (не OAuth / не fake ACK).',
  };
}

function resolveEmbedMode(env: Workshop2ProcessEnvLike): Workshop2B2bShowroom3dEmbedMode {
  const raw = String(env.WORKSHOP2_B2B_3D_EMBED_MODE ?? 'sdk-stub')
    .trim()
    .toLowerCase();
  if (raw === 'iframe' || raw === 'sdk' || raw === 'sdk-stub') return raw;
  return 'sdk-stub';
}

/** Полный payload для stream-token API и B2b3dStreamPanel — всегда с embedUrl. */
export function buildWorkshop2B2bShowroom3dStreamPayload(input: {
  collectionId?: string;
  articleId?: string;
  origin?: string;
  env?: Workshop2ProcessEnvLike;
}): Workshop2B2bShowroom3dStreamPayload {
  const env = input.env ?? process.env;
  const base = resolveWorkshop2B2bShowroom3dStreamToken(env);
  const streamUrl = String(env.WORKSHOP2_B2B_3D_STREAM_URL ?? '').trim();
  const embedMode = resolveEmbedMode(env);
  const collectionId = input.collectionId?.trim() || 'SS27';
  const articleId = input.articleId?.trim() || 'demo-ss27-01';
  const origin = input.origin?.trim() || 'http://localhost:3001';
  const previewUrl = `${origin}/api/shop/b2b/showroom/3d-embed-preview?collectionId=${encodeURIComponent(collectionId)}&articleId=${encodeURIComponent(articleId)}`;

  if (streamUrl && embedMode === 'iframe') {
    return {
      ok: true,
      ...base,
      embedMode: 'iframe',
      embedUrl: streamUrl,
    };
  }

  if (streamUrl && embedMode === 'sdk') {
    const sdkUrl = String(env.WORKSHOP2_B2B_3D_SDK_URL ?? streamUrl).trim();
    const targetOrigin = String(env.WORKSHOP2_B2B_3D_SDK_TARGET_ORIGIN ?? '*').trim() || '*';
    return {
      ok: true,
      ...base,
      embedMode: 'sdk',
      embedUrl: sdkUrl,
      sdkScriptUrl: String(env.WORKSHOP2_B2B_3D_SDK_SCRIPT_URL ?? '').trim() || undefined,
      sdkConfig: {
        sdkUrl,
        sdkScriptUrl: String(env.WORKSHOP2_B2B_3D_SDK_SCRIPT_URL ?? '').trim() || undefined,
        targetOrigin,
        bridgeVersion: 'w2-b2b-3d-v1',
        handshakeEvent: 'b2b-3d-ready',
      },
      providerId: 'generic',
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    };
  }

  return {
    ok: true,
    ...base,
    embedMode: 'sdk-stub',
    embedUrl: streamUrl || previewUrl,
    demoMode: !streamUrl,
    hintRu: streamUrl
      ? base.hintRu
      : 'Демо-превью 3D витрины. LIVE: WORKSHOP2_B2B_3D_STREAM_URL в .env.',
  };
}

export function workshop2B2bShowroom3dStreamTooltipRu(
  env: Workshop2ProcessEnvLike = process.env
): string {
  const resolved = resolveWorkshop2B2bShowroom3dStreamToken(env);
  if (resolved.mode === 'live') return '3D stream: URL настроен на staging.';
  return '3D stream недоступен: укажите WORKSHOP2_B2B_3D_STREAM_URL в .env.staging.live.ru.example.';
}
