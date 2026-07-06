'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import { stampPhase1DossierForPersist } from '@/components/brand/production/workshop2-phase1-dossier-panel-stamp-for-persist';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2DossierMetricsFlushContext } from '@/lib/production/workshop2-dossier-metrics-ingest';
import { flushW2DossierMetricsToServer } from '@/lib/production/workshop2-dossier-metrics-ingest';
import {
  recordW2DossierPersistFailure,
  recordW2DossierPersistSuccess,
} from '@/lib/production/workshop2-dossier-session-metrics';
import {
  postWorkshop2Event,
  saveWorkshop2DossierToApi,
} from '@/lib/production/workshop2-api-client';
import {
  evaluateWorkshop2DossierSaveHonesty,
  workshop2DossierStoreModeMessageRu,
} from '@/lib/production/workshop2-dossier-store-mode';
import {
  getWorkshop2ServerDossierVersion,
  notifyWorkshop2VersionConflict,
  setWorkshop2ServerDossierVersion,
} from '@/lib/production/workshop2-dossier-version-sync';
import type { Workshop2EventType } from '@/lib/production/workshop2-event-bridge';
import { setWorkshop2Phase1Dossier } from '@/lib/production/workshop2-phase1-dossier-storage';
import { computeWorkshop2BomCostingRollup } from '@/lib/production/workshop2-bom-costing';
import { syncWorkshop2CostingRubMirrorOnDossier } from '@/lib/production/workshop2-dossier-costing-rub';
import {
  bumpWorkshop2VaultSnapshot,
  workshop2EventBridge,
} from '@/lib/production/workshop2-event-bridge';
import { syncTaMilestonesForDossier } from '@/lib/production/workshop2-ta-templates';
import { syncWorkshop2RoutingStepsOnDossier } from '@/lib/production/workshop2-routing-steps';
import {
  resolveDossierLifecycleState,
  calculateDossierReadiness,
} from '@/lib/production/dossier-readiness-engine';
import { shouldPersistPhase1DossierOfflineDualWrite } from '@/lib/production/workshop2-pg-read-path-policy';

type ToastFn = (opts: {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}) => void;

const PERSIST_DEBOUNCE_MS = 400;

function mirrorWorkshop2EventToApi(
  collectionId: string,
  articleId: string,
  type: Workshop2EventType,
  payload: { by?: string; meta?: Record<string, unknown>; at?: string }
): void {
  void postWorkshop2Event({
    collectionId,
    articleId,
    eventType: type,
    eventPayload: {
      at: payload.at ?? new Date().toISOString(),
      ...(payload.by ? { by: payload.by } : {}),
      ...(payload.meta ?? {}),
    },
  }).catch(() => undefined);
}

export type UseWorkshop2Phase1DossierPersistInput = {
  collectionId: string;
  articleId: string;
  updatedByLabel: string;
  tzWriteDisabled: boolean;
  toast: ToastFn;
  w2DossierMetricsCtx: Workshop2DossierMetricsFlushContext;
  setDossierInternal: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  setDossierMetricsTick: Dispatch<SetStateAction<number>>;
  setSaveError: Dispatch<SetStateAction<string | null>>;
  setSavedHint: Dispatch<SetStateAction<string | null>>;
  onVersionConflict?: (payload: { currentVersion: number; conflictFieldsRu?: string[] }) => void;
};

export type Workshop2DossierPersistOptions = {
  freezeUpdatedAt?: boolean;
  skipServerSync?: boolean;
  /** Явное «Сохранить черновик» — без debounce, актуальный снимок из ref. */
  immediate?: boolean;
};

export type UseWorkshop2Phase1DossierPersistResult = {
  persist: (next: Workshop2DossierPhase1, opts?: Workshop2DossierPersistOptions) => void;
  lastPersistedDossierRef: MutableRefObject<Workshop2DossierPhase1 | null>;
};

function enrichDossierBeforePersist(
  stamped: Workshop2DossierPhase1,
  prev: Workshop2DossierPhase1 | null
): Workshop2DossierPhase1 {
  let next = syncTaMilestonesForDossier(stamped);
  next = syncWorkshop2RoutingStepsOnDossier(next);
  const rollup = computeWorkshop2BomCostingRollup(next);
  next = {
    ...next,
    bomCostingSnapshot: {
      computedAt: new Date().toISOString(),
      materialsTotal: rollup.materialsTotal,
      trimsTotal: rollup.trimsTotal,
      operationsTotal: rollup.operationsTotal,
      estimatedFob: rollup.estimatedFob,
      currency: rollup.currency,
      targetFob: rollup.targetFob,
      deltaBand: rollup.deltaBand,
      deltaPct: rollup.deltaPct,
    },
  };
  if (!prev || prev.updatedAt !== next.updatedAt) {
    next = bumpWorkshop2VaultSnapshot(next, next.updatedBy);
  }
  next = syncWorkshop2CostingRubMirrorOnDossier(next);
  const readiness = calculateDossierReadiness(next, null);
  next = {
    ...next,
    lifecycleState: resolveDossierLifecycleState(next, readiness),
  };
  return next;
}

/** Сохранение досье: API primary + honest file_persist_only footer suppression. */
export function useWorkshop2Phase1DossierPersist(
  input: UseWorkshop2Phase1DossierPersistInput
): UseWorkshop2Phase1DossierPersistResult {
  const {
    collectionId,
    articleId,
    updatedByLabel,
    tzWriteDisabled,
    toast,
    w2DossierMetricsCtx,
    setDossierInternal,
    setDossierMetricsTick,
    setSaveError,
    setSavedHint,
    onVersionConflict,
  } = input;

  const lastPersistedDossierRef = useRef<Workshop2DossierPhase1 | null>(null);
  const lastPersistSuccessToastAtRef = useRef(0);
  const serverDossierVersionRef = useRef<number | null>(getWorkshop2ServerDossierVersion());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPersistRef = useRef<{
    next: Workshop2DossierPhase1;
    opts?: Workshop2DossierPersistOptions;
  } | null>(null);

  const persistImmediate = useCallback(
    async (
      next: Workshop2DossierPhase1,
      opts?: { freezeUpdatedAt?: boolean; skipServerSync?: boolean }
    ) => {
      if (tzWriteDisabled) {
        toast({
          title: 'Только просмотр',
          description: 'Сохранение недоступно без права «Редактировать производство».',
          variant: 'destructive',
        });
        return;
      }
      const stampedRaw = stampPhase1DossierForPersist(
        next,
        opts,
        updatedByLabel,
        lastPersistedDossierRef.current
      );
      const prevLifecycle = lastPersistedDossierRef.current?.lifecycleState;
      const stamped = enrichDossierBeforePersist(stampedRaw, lastPersistedDossierRef.current);
      lastPersistedDossierRef.current = stamped;
      setDossierInternal(stamped);

      let apiSynced = false;
      let apiOffline = false;
      let filePersistOnly = false;
      let saveMessageRu: string | undefined;
      if (!opts?.skipServerSync) {
        const apiSave = await saveWorkshop2DossierToApi({
          collectionId,
          articleId,
          dossier: stamped,
          baseVersion: serverDossierVersionRef.current ?? undefined,
        });
        const honesty = evaluateWorkshop2DossierSaveHonesty({
          apiOk: apiSave.ok,
          storeMode: apiSave.ok ? apiSave.data.storeMode : undefined,
          reason: apiSave.ok ? undefined : apiSave.reason,
        });
        saveMessageRu = apiSave.ok
          ? (apiSave.data.messageRu ?? honesty.messageRu)
          : honesty.messageRu;
        filePersistOnly = honesty.filePersistOnly;
        if (apiSave.ok) {
          serverDossierVersionRef.current = apiSave.data.version;
          setWorkshop2ServerDossierVersion(apiSave.data.version);
          apiSynced = true;
        } else if (apiSave.reason === 'version_conflict') {
          const cv = apiSave.currentVersion ?? serverDossierVersionRef.current ?? 0;
          serverDossierVersionRef.current = cv;
          notifyWorkshop2VersionConflict(cv);
          onVersionConflict?.({
            currentVersion: cv,
            conflictFieldsRu: apiSave.conflictFieldsRu,
          });
          setSaveError(
            `Конфликт версий: досье изменено другим пользователем (сервер v${cv}). Используйте модальное окно для обновления.`
          );
          return;
        } else if (apiSave.reason === 'network_or_server_error') {
          apiOffline = true;
        } else {
          console.warn('[workshop2-persist] API save:', apiSave.reason, collectionId, articleId);
        }
      }

      const allowOfflineDualWrite = shouldPersistPhase1DossierOfflineDualWrite();
      let savedOk = false;
      if (apiSynced) {
        savedOk = true;
        if (allowOfflineDualWrite) {
          setWorkshop2Phase1Dossier(collectionId, articleId, stamped);
        }
      } else if (apiOffline && allowOfflineDualWrite) {
        savedOk = setWorkshop2Phase1Dossier(collectionId, articleId, stamped);
      }

      const emitAt = new Date().toISOString();
      workshop2EventBridge.emit('DOSSIER_SAVED', {
        collectionId,
        articleId,
        dossier: stamped,
        by: updatedByLabel,
        at: emitAt,
        meta: { vaultVersion: stamped.vaultSnapshotVersion },
      });
      mirrorWorkshop2EventToApi(collectionId, articleId, 'DOSSIER_SAVED', {
        by: updatedByLabel,
        at: emitAt,
        meta: { vaultVersion: stamped.vaultSnapshotVersion },
      });

      if (prevLifecycle !== stamped.lifecycleState && stamped.lifecycleState) {
        workshop2EventBridge.emit('DOSSIER_STATUS_CHANGED', {
          collectionId,
          articleId,
          dossier: stamped,
          by: updatedByLabel,
          at: emitAt,
          meta: { from: prevLifecycle, to: stamped.lifecycleState },
        });
      }

      if (!savedOk && !apiSynced) {
        recordW2DossierPersistFailure(collectionId, articleId);
        setDossierMetricsTick((n) => n + 1);
        flushW2DossierMetricsToServer(collectionId, articleId, w2DossierMetricsCtx);
        setSaveError('Не удалось сохранить на сервер. Проверьте WORKSHOP2_DATABASE_URL и сеть.');
        toast({
          title: 'Сохранение не записано',
          description: 'PostgreSQL/API недоступен — настройте backend или повторите позже.',
          variant: 'destructive',
        });
        return;
      }

      setSaveError(
        filePersistOnly
          ? null
          : apiSynced && !savedOk && allowOfflineDualWrite
            ? 'Сервер сохранил досье, но localStorage недоступен. Продолжайте работу онлайн.'
            : apiOffline && allowOfflineDualWrite
              ? 'Офлайн-кэш (localStorage)'
              : !allowOfflineDualWrite && apiOffline
                ? 'PostgreSQL недоступен — офлайн-кэш отключён в Platform Core.'
                : null
      );
      recordW2DossierPersistSuccess(collectionId, articleId);
      setDossierMetricsTick((n) => n + 1);
      flushW2DossierMetricsToServer(collectionId, articleId, w2DossierMetricsCtx);
      const toastAt = Date.now();
      if (toastAt - lastPersistSuccessToastAtRef.current >= 3500) {
        lastPersistSuccessToastAtRef.current = toastAt;
        toast({
          title: filePersistOnly
            ? 'Файловый сервер (PG off)'
            : apiSynced
              ? 'Сохранено на сервере'
              : 'Черновик в кэше',
          description: filePersistOnly
            ? (saveMessageRu ??
              'PostgreSQL недоступен — запись на файловом сервере (не PG primary).')
            : apiSynced
              ? !allowOfflineDualWrite
                ? 'Досье в PostgreSQL (Platform Core).'
                : workshop2DossierStoreModeMessageRu('server_postgres')
              : !allowOfflineDualWrite
                ? 'PostgreSQL недоступен — нужен npm run core:bootstrap.'
                : 'Сеть недоступна — запись только в localStorage.',
          variant: filePersistOnly ? 'destructive' : 'default',
        });
      }
      setSavedHint(filePersistOnly ? 'Файл (PG off)' : apiSynced ? 'На сервере' : 'Офлайн-кэш');
      window.setTimeout(() => setSavedHint(null), 6000);
    },
    [
      collectionId,
      articleId,
      updatedByLabel,
      tzWriteDisabled,
      toast,
      w2DossierMetricsCtx,
      setDossierInternal,
      setDossierMetricsTick,
      setSaveError,
      setSavedHint,
      onVersionConflict,
    ]
  );

  const persist = useCallback(
    (next: Workshop2DossierPhase1, opts?: Workshop2DossierPersistOptions) => {
      if (opts?.freezeUpdatedAt || opts?.immediate) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        pendingPersistRef.current = null;
        persistImmediate(next, opts);
        return;
      }
      pendingPersistRef.current = { next, opts };
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const pending = pendingPersistRef.current;
        pendingPersistRef.current = null;
        debounceTimerRef.current = null;
        if (pending) void persistImmediate(pending.next, pending.opts);
      }, PERSIST_DEBOUNCE_MS);
    },
    [persistImmediate]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        const pending = pendingPersistRef.current;
        if (pending) void persistImmediate(pending.next, pending.opts);
      }
    };
  }, [persistImmediate]);

  return { persist, lastPersistedDossierRef };
}
