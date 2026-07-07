'use client';

/**
 * Wave 44–48: 3D embed — iframe | sdk-stub | live SDK (script tag + postMessage b2b-3d-ready).
 */
import { useEffect, useRef, useState } from 'react';

import { loadB2b3dProvider } from '@/components/shop/b2b/b2b-3d-providers/load-provider';
import type { B2b3dProviderAdapter } from '@/components/shop/b2b/b2b-3d-providers/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SdkConfig = {
  sdkUrl: string;
  sdkScriptUrl?: string;
  targetOrigin: string;
  bridgeVersion: string;
  handshakeEvent: string;
};

type StreamPayload = {
  mode: 'placeholder' | 'live';
  embedMode?: 'iframe' | 'sdk-stub' | 'sdk';
  embedUrl?: string;
  sdkScriptUrl?: string;
  sdkConfig?: SdkConfig;
  providerId?: 'matterport' | 'generic' | 'default';
  expiresAt?: string;
  demoMode?: boolean;
  hintRu?: string;
};

type B2b3dStreamPanelProps = {
  collectionId?: string;
  articleId?: string;
};

export function B2b3dStreamPanel({
  collectionId = 'SS27',
  articleId = 'demo-ss27-01',
}: B2b3dStreamPanelProps) {
  const [payload, setPayload] = useState<StreamPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionDurationMs, setSessionDurationMs] = useState<number | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [providerAdapter, setProviderAdapter] = useState<B2b3dProviderAdapter | null>(null);
  const sessionStartedRef = useRef<number | null>(null);
  const sessionSentRef = useRef(false);
  const sdkHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch(
          `/api/shop/b2b/showroom/stream-token?collectionId=${encodeURIComponent(collectionId)}&articleId=${encodeURIComponent(articleId)}`
        );
        const json = (await r.json()) as StreamPayload & { ok?: boolean };
        if (json.ok !== false) {
          setPayload({
            mode: json.mode ?? 'placeholder',
            embedMode: json.embedMode ?? 'iframe',
            embedUrl: json.embedUrl,
            sdkScriptUrl: json.sdkScriptUrl ?? json.sdkConfig?.sdkScriptUrl,
            sdkConfig: json.sdkConfig,
            providerId: json.providerId,
            expiresAt: json.expiresAt,
            demoMode: json.demoMode,
            hintRu: json.hintRu,
          });
        }
      } catch {
        setPayload(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!payload?.embedUrl) return;
    const embedMode = payload.embedMode ?? 'iframe';

    if (embedMode === 'sdk-stub') {
      void fetch('/api/shop/b2b/showroom/3d-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, articleId, embedMode: 'sdk-stub' }),
      }).catch(() => {
        /* metrics best-effort */
      });
    }

    if (embedMode === 'sdk' && payload.sdkConfig) {
      sessionStartedRef.current = Date.now();
      sessionSentRef.current = false;
      setSdkReady(false);
      setProviderAdapter(null);

      let providerCleanup: (() => void) | undefined;
      let cancelled = false;
      const providerId = payload.providerId;
      const handshakeEvents = new Set([
        payload.sdkConfig.handshakeEvent,
        'b2b-3d-ready',
        'w2.b2b.3d.ready',
      ]);

      if (providerId === 'matterport' || providerId === 'generic') {
        void loadB2b3dProvider(providerId).then((adapter) => {
          if (cancelled || !adapter || !sdkHostRef.current) return;
          setProviderAdapter(adapter);
          adapter.extraHandshakeEvents?.forEach((e) => handshakeEvents.add(e));
          const cleanup = adapter.mount?.({
            host: sdkHostRef.current,
            sdkConfig: payload.sdkConfig!,
            collectionId,
            articleId,
          });
          if (typeof cleanup === 'function') providerCleanup = cleanup;
        });
      }

      const scriptUrl = payload.sdkScriptUrl ?? payload.sdkConfig.sdkScriptUrl ?? payload.sdkConfig.sdkUrl;
      let scriptEl: HTMLScriptElement | null = null;
      if (scriptUrl && sdkHostRef.current) {
        scriptEl = document.createElement('script');
        scriptEl.src = scriptUrl;
        scriptEl.async = true;
        scriptEl.dataset.testid = 'b2b-3d-sdk-script';
        if (providerId && providerId !== 'default') {
          scriptEl.dataset.b2b3dProvider = providerId;
        }
        sdkHostRef.current.appendChild(scriptEl);
      }

      const onMessage = (event: MessageEvent) => {
        const originOk =
          payload.sdkConfig?.targetOrigin === '*' ||
          event.origin === payload.sdkConfig?.targetOrigin;
        if (!originOk) return;
        const msgType = event.data?.type ?? event.data?.event;
        if (handshakeEvents.has(msgType)) {
          setSdkReady(true);
          window.postMessage(
            {
              type: 'w2.b2b.3d.init',
              bridgeVersion: payload.sdkConfig?.bridgeVersion,
              collectionId,
              articleId,
            },
            payload.sdkConfig?.targetOrigin ?? '*'
          );
        }
      };
      window.addEventListener('message', onMessage);
      return () => {
        cancelled = true;
        providerCleanup?.();
        window.removeEventListener('message', onMessage);
        if (scriptEl?.parentNode) scriptEl.parentNode.removeChild(scriptEl);
        const started = sessionStartedRef.current;
        if (started != null && !sessionSentRef.current) {
          sessionSentRef.current = true;
          const durationMs = Date.now() - started;
          setSessionDurationMs(durationMs);
          void fetch('/api/shop/b2b/showroom/3d-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionId,
              articleId,
              embedMode: 'sdk',
              durationMs,
              sdkReady,
            }),
          }).catch(() => {
            /* metrics best-effort */
          });
        }
      };
    }
  }, [payload, collectionId, articleId, sdkReady]);

  if (loading) {
    return (
      <Card className="border-dashed" data-testid="b2b-3d-stream-panel-loading">
        <CardContent className="py-6 text-center text-xs text-muted-foreground">
          Загрузка 3D stream…
        </CardContent>
      </Card>
    );
  }

  if (!payload?.embedUrl) {
    return null;
  }

  const embedMode = payload.embedMode ?? 'iframe';

  return (
    <Card
      className="b2b-3d-stream-panel overflow-hidden border-border/80 shadow-sm"
      data-testid="b2b-3d-stream-panel"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">3D showroom</CardTitle>
          <Badge variant={payload.mode === 'live' && !payload.demoMode ? 'default' : 'outline'} className="text-[9px]">
            {embedMode === 'sdk'
              ? sdkReady
                ? 'Live SDK'
                : 'Live SDK (загрузка)'
              : embedMode === 'sdk-stub'
                ? 'Демо-превью 3D'
                : payload.demoMode
                  ? 'Демо-превью 3D'
                  : payload.mode === 'live'
                    ? 'Live SDK'
                    : 'Демо-превью 3D'}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {payload.hintRu ?? 'Виртуальный показ коллекции — embed провайдера.'}
          {payload.expiresAt ? (
            <span className="mt-1 block text-[10px] opacity-80">
              token до {new Date(payload.expiresAt).toLocaleString('ru-RU')}
            </span>
          ) : null}
          {embedMode === 'sdk' && sessionDurationMs != null ? (
            <span
              className="mt-1 block text-[10px] font-medium text-emerald-800"
              data-testid="b2b-3d-session-duration"
            >
              Сессия SDK: {Math.round(sessionDurationMs / 1000)}с → journal b2b.3d.session
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <div
          className="relative aspect-video w-full max-h-[min(420px,50vh)] bg-muted/30"
          data-testid="b2b-3d-stream-embed"
          data-embed-mode={embedMode}
        >
          {embedMode === 'sdk' ? (
            <div
              className="absolute inset-0 flex flex-col"
              data-testid="b2b-3d-stream-sdk"
              data-sdk-url={payload.sdkConfig?.sdkUrl}
              data-sdk-script-url={payload.sdkScriptUrl ?? payload.sdkConfig?.sdkScriptUrl}
            >
              <div ref={sdkHostRef} className="hidden" aria-hidden data-testid="b2b-3d-sdk-script-host" />
              <iframe
                title="3D showroom SDK"
                src={payload.embedUrl}
                className="h-full w-full border-0"
                allow="fullscreen"
                loading="lazy"
                data-testid="b2b-3d-stream-sdk-iframe"
              />
              <p className="px-2 py-1 text-center text-[10px] text-muted-foreground">
                SDK bridge: {payload.sdkConfig?.bridgeVersion}
                {providerAdapter ? ` · ${providerAdapter.labelRu}` : ''} · handshake b2b-3d-ready ·
                session → b2b.3d.session
              </p>
            </div>
          ) : embedMode === 'iframe' ? (
            <iframe
              title="3D showroom stream"
              src={payload.embedUrl}
              className="absolute inset-0 h-full w-full border-0"
              allow="fullscreen; autoplay"
              loading="lazy"
              data-testid="b2b-3d-stream-iframe"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
              data-testid="b2b-3d-stream-sdk-stub"
            >
              <iframe
                title="3D showroom sdk-stub preview"
                src={payload.embedUrl}
                className="h-full w-full max-h-[320px] border-0 opacity-95"
                loading="lazy"
              />
              <p className="text-[10px] text-muted-foreground">
                SDK-stub: событие b2b.3d.view отправлено в chat (investor metrics).
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
