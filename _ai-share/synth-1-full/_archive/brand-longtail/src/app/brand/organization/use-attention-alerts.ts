/**
 * Состояние алертов «Требует внимания».
 * Блок активен когда items.length > 0. При dismiss — удаляем элемент, блок становится неактивным когда пусто.
 * activeSince — время, с которого блок активен (для отображения в углу).
 * historyByBlock — история действий по каждому блоку (появилось, устранено, изменено) + автор.
 * Dismiss с id: localStorage + при USE_FASTAPI PATCH `/brand/attention-dismiss` и merge при загрузке из GET.
 */

import { useState, useCallback, useEffect, startTransition } from 'react';
import {
  appendDismissedAlertId,
  applyAttentionDismissFilters,
  attentionDismissRecordsEqual,
  loadAttentionDismiss,
  mergeAttentionDismissRecords,
  parseAttentionDismissFromApi,
  saveAttentionDismiss,
  type AttentionDismissRecord,
} from './attention-dismiss-storage';

/** Стабильный id для legacy-строк в payload (до появления id с бэка). */
function stableIntegrationIssueIdFromMessage(message: string): string {
  let h = 5381;
  for (let i = 0; i < message.length; i++) {
    h = (h * 33 + message.charCodeAt(i)) >>> 0;
  }
  return `intg:auto:${h.toString(16)}`;
}
import { USE_FASTAPI } from '@/lib/syntha-api-mode';
import { fastApiService } from '@/lib/fastapi-service';

export type HistoryEntry = {
  id: string;
  action: 'appeared' | 'dismissed' | 'changed';
  label: string;
  author: string;
  timestamp: number;
};

export type CertificateAlert = { id: string; name: string; daysLeft: number };
export type ProfileAlert = { id: string; name: string; detail: string };
export type TaskAlert = { id: string; title: string; priority: string };

export type IntegrationIssueAlert = { id: string; message: string };

export type AttentionAlertsState = {
  certificates: CertificateAlert[];
  profile: ProfileAlert[];
  tasks: TaskAlert[];
  /** Пусто = системы в норме (зелёный блок). Непусто = сбои. */
  integrationIssues: IntegrationIssueAlert[];
};

import { getInitialAlertsState } from './organization-demo-data';

export type BlockId =
  | 'certificates'
  | 'profile'
  | 'systems'
  | 'tasks'
  | 'approval'
  | 'contract'
  | 'confirmation'
  | 'delivery'
  | 'lowStock'
  | 'overduePayment'
  | 'moderation'
  | 'dataErrors'
  | 'syncFail'
  | 'documents'
  | 'accessRequests'
  | 'suspicious'
  | 'photos'
  | 'apiKey'
  | 'integrationUpdate'
  | 'audit'
  | 'inactiveUsers'
  | '2fa';

const BLOCK_LABELS: Record<BlockId, string> = {
  certificates: 'Истекающие сертификаты',
  profile: 'Незаполненные данные',
  systems: 'Системы в норме',
  tasks: 'Задачи без исполнителя',
  approval: 'Ожидает одобрения',
  contract: 'Истекает договор',
  confirmation: 'Ожидает подтверждения',
  delivery: 'Задержка поставки',
  lowStock: 'Низкий остаток',
  overduePayment: 'Просроченный платёж',
  moderation: 'Ожидает модерации',
  dataErrors: 'Ошибки в данных',
  syncFail: 'Сбой синхронизации',
  documents: 'Документы на подпись',
  accessRequests: 'Заявки на доступ',
  suspicious: 'Подозрительная активность',
  photos: 'Обновить фото',
  apiKey: 'Истекает API-ключ',
  integrationUpdate: 'Обновление интеграции',
  audit: 'Проверка аудита',
  inactiveUsers: 'Неактивные пользователи',
  '2fa': 'Двухфакторная аутентификация',
};

/** Форматирует длительность в читаемый вид */
export function formatActiveDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const h = Math.floor(min / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} д`;
  if (h > 0) return `${h} ч`;
  if (min > 0) return `${min} мин`;
  return '<1 мин';
}

let historyId = 0;
function addHistory(
  prev: Record<BlockId, HistoryEntry[]>,
  blockId: BlockId,
  action: HistoryEntry['action'],
  label: string,
  author: string
): Record<BlockId, HistoryEntry[]> {
  const list = prev[blockId] ?? [];
  return {
    ...prev,
    [blockId]: [
      { id: `h${++historyId}`, action, label, author, timestamp: Date.now() },
      ...list,
    ].slice(0, 50),
  };
}

/** Validates dashboard/API payload → состояние «Требует внимания». null если передано некорректно. */
export function normalizeAttentionAlertsPayload(raw: unknown): AttentionAlertsState | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const certsRaw = Array.isArray(o.certificates) ? o.certificates : [];
  const certificates = certsRaw
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    .map((x) => ({
      id: String(x.id ?? ''),
      name: String(x.name ?? ''),
      daysLeft: Number(Number.isFinite(Number(x.daysLeft)) ? x.daysLeft : 0),
    }))
    .filter((x) => x.id !== '' && x.name !== '');

  const profileRaw = Array.isArray(o.profile) ? o.profile : [];
  const profile = profileRaw
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    .map((x) => ({
      id: String(x.id ?? ''),
      name: String(x.name ?? ''),
      detail: String(x.detail ?? ''),
    }))
    .filter((x) => x.id !== '' && x.name !== '');

  const tasksRaw = Array.isArray(o.tasks) ? o.tasks : [];
  const tasks = tasksRaw
    .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object')
    .map((x) => ({
      id: String(x.id ?? ''),
      title: String(x.title ?? ''),
      priority: String(x.priority ?? ''),
    }))
    .filter((x) => x.id !== '' && x.title !== '');

  const rawIssues = Array.isArray(o.integrationIssues) ? o.integrationIssues : [];
  const integrationIssues: IntegrationIssueAlert[] = [];
  for (const x of rawIssues) {
    if (typeof x === 'string' && x.trim()) {
      const message = x.trim();
      integrationIssues.push({ id: stableIntegrationIssueIdFromMessage(message), message });
      continue;
    }
    if (x != null && typeof x === 'object') {
      const rec = x as Record<string, unknown>;
      const id = String(rec.id ?? '').trim();
      const message = String(rec.message ?? rec.text ?? '').trim();
      if (id && message) integrationIssues.push({ id, message });
    }
  }

  return { certificates, profile, tasks, integrationIssues };
}

function buildHistorySeed(init: AttentionAlertsState): Record<BlockId, HistoryEntry[]> {
  const h: Record<BlockId, HistoryEntry[]> = {} as Record<BlockId, HistoryEntry[]>;
  init.certificates.forEach((c) => {
    if (!h.certificates) h.certificates = [];
    h.certificates.push({
      id: `h${++historyId}`,
      action: 'appeared',
      label: `Появилось: ${c.name}`,
      author: 'Система',
      timestamp: Date.now() - 86400000 * 2,
    });
  });
  init.profile.forEach((p) => {
    if (!h.profile) h.profile = [];
    h.profile.push({
      id: `h${++historyId}`,
      action: 'appeared',
      label: `Появилось: ${p.name}`,
      author: 'Система',
      timestamp: Date.now() - 86400000,
    });
  });
  init.tasks.forEach((t) => {
    if (!h.tasks) h.tasks = [];
    h.tasks.push({
      id: `h${++historyId}`,
      action: 'appeared',
      label: `Появилось: ${t.title}`,
      author: 'Система',
      timestamp: Date.now() - 3600000,
    });
  });
  if (!h.systems) h.systems = [];
  h.systems.push({
    id: `h${++historyId}`,
    action: 'appeared',
    label: 'Системы в норме',
    author: 'Система',
    timestamp: Date.now() - 7200000,
  });
  return h;
}

export type UseAttentionAlertsOpts = {
  attentionAlertsFromDashboard?: unknown;
  healthLoading?: boolean;
  /** Ключ persisted dismiss (profile.brand.id или BRAND_ID). */
  brandId?: string;
};

export function useAttentionAlerts(opts?: UseAttentionAlertsOpts) {
  const [alerts, setAlerts] = useState<AttentionAlertsState>(getInitialAlertsState);
  const [activeSince, setActiveSince] = useState<Partial<Record<BlockId, number>>>({});
  const [historyByBlock, setHistoryByBlock] = useState<Record<BlockId, HistoryEntry[]>>(() =>
    buildHistorySeed(getInitialAlertsState())
  );

  useEffect(() => {
    if (opts?.healthLoading) return;
    const raw = opts?.attentionAlertsFromDashboard;
    if (raw === undefined) return;
    const normalized = normalizeAttentionAlertsPayload(raw);
    if (normalized === null) return;
    const bid = opts?.brandId;
    if (!bid) {
      startTransition(() => {
        setAlerts(normalized);
        setHistoryByBlock(buildHistorySeed(normalized));
      });
      return;
    }

    let cancelled = false;
    (async () => {
      const local = loadAttentionDismiss(bid);
      let serverRec: AttentionDismissRecord | null = null;
      if (USE_FASTAPI) {
        try {
          const res = await fastApiService.getAttentionDismiss(bid);
          const payload =
            res && typeof res === 'object' && 'data' in res ? (res as { data: unknown }).data : res;
          serverRec = parseAttentionDismissFromApi(payload);
        } catch {
          serverRec = null;
        }
      }
      const merged = mergeAttentionDismissRecords(local, serverRec);
      if (!cancelled && !attentionDismissRecordsEqual(local, merged)) {
        saveAttentionDismiss(bid, merged);
      }
      if (!cancelled) {
        const filtered = applyAttentionDismissFilters(normalized, merged);
        startTransition(() => {
          setAlerts(filtered);
          setHistoryByBlock(buildHistorySeed(filtered));
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [opts?.healthLoading, opts?.attentionAlertsFromDashboard, opts?.brandId]);

  const isBlockActive = useCallback(
    (id: BlockId) => {
      if (id === 'certificates') return alerts.certificates.length > 0;
      if (id === 'profile') return alerts.profile.length > 0;
      if (id === 'systems') return alerts.integrationIssues.length === 0;
      if (id === 'tasks') return alerts.tasks.length > 0;
      return false;
    },
    [alerts]
  );

  useEffect(() => {
    const now = Date.now();
    const active: BlockId[] = [];
    if (alerts.certificates.length > 0) active.push('certificates');
    if (alerts.profile.length > 0) active.push('profile');
    if (alerts.integrationIssues.length === 0) active.push('systems');
    if (alerts.tasks.length > 0) active.push('tasks');
    startTransition(() => {
      setActiveSince((prev) => {
        const next = { ...prev };
        active.forEach((id) => {
          if (next[id] == null) next[id] = now;
        });
        (['certificates', 'profile', 'systems', 'tasks'] as BlockId[]).forEach((id) => {
          if (!active.includes(id)) delete next[id];
        });
        return next;
      });
    });
  }, [
    alerts.certificates.length,
    alerts.profile.length,
    alerts.tasks.length,
    alerts.integrationIssues.length,
  ]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const brandId = opts?.brandId;

  const dismissCertificate = useCallback(
    (id: string) => {
      const cert = alerts.certificates.find((c) => c.id === id);
      setHistoryByBlock((prev) =>
        addHistory(prev, 'certificates', 'dismissed', `Устранено: ${cert?.name ?? id}`, 'Вы')
      );
      if (brandId) {
        appendDismissedAlertId(brandId, 'certificateIds', id);
        if (USE_FASTAPI) {
          void fastApiService
            .patchAttentionDismiss(brandId, { certificateIds: [id] })
            .catch(() => {});
        }
      }
      setAlerts((prev) => ({
        ...prev,
        certificates: prev.certificates.filter((c) => c.id !== id),
      }));
    },
    [alerts.certificates, brandId]
  );

  const dismissProfile = useCallback(
    (id: string) => {
      const p = alerts.profile.find((x) => x.id === id);
      setHistoryByBlock((prev) =>
        addHistory(prev, 'profile', 'dismissed', `Устранено: ${p?.name ?? id}`, 'Вы')
      );
      if (brandId) {
        appendDismissedAlertId(brandId, 'profileIds', id);
        if (USE_FASTAPI) {
          void fastApiService.patchAttentionDismiss(brandId, { profileIds: [id] }).catch(() => {});
        }
      }
      setAlerts((prev) => ({
        ...prev,
        profile: prev.profile.filter((p) => p.id !== id),
      }));
    },
    [alerts.profile, brandId]
  );

  const dismissTask = useCallback(
    (id: string) => {
      const t = alerts.tasks.find((x) => x.id === id);
      setHistoryByBlock((prev) =>
        addHistory(prev, 'tasks', 'dismissed', `Устранено: ${t?.title ?? id}`, 'Вы')
      );
      if (brandId) {
        appendDismissedAlertId(brandId, 'taskIds', id);
        if (USE_FASTAPI) {
          void fastApiService.patchAttentionDismiss(brandId, { taskIds: [id] }).catch(() => {});
        }
      }
      setAlerts((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));
    },
    [alerts.tasks, brandId]
  );

  const dismissIntegrationIssue = useCallback(
    (id: string) => {
      const row = alerts.integrationIssues.find((x) => x.id === id);
      setHistoryByBlock((prev) =>
        addHistory(prev, 'systems', 'dismissed', `Устранено: ${row?.message ?? id}`, 'Вы')
      );
      if (brandId) {
        appendDismissedAlertId(brandId, 'integrationIssueIds', id);
        if (USE_FASTAPI) {
          void fastApiService
            .patchAttentionDismiss(brandId, { integrationIssueIds: [id] })
            .catch(() => {});
        }
      }
      setAlerts((prev) => ({
        ...prev,
        integrationIssues: prev.integrationIssues.filter((x) => x.id !== id),
      }));
    },
    [alerts.integrationIssues, brandId]
  );

  const getActiveDuration = useCallback(
    (id: BlockId) => {
      const since = activeSince[id];
      if (since == null) return null;
      return formatActiveDuration(Date.now() - since);
    },
    [activeSince]
  );

  const getHistory = useCallback(
    (blockId: BlockId) => historyByBlock[blockId] ?? [],
    [historyByBlock]
  );
  const getBlockLabel = useCallback((blockId: BlockId) => BLOCK_LABELS[blockId] ?? blockId, []);

  return {
    alerts,
    activeSince,
    historyByBlock,
    getHistory,
    getBlockLabel,
    getActiveDuration,
    isBlockActive,
    dismissCertificate,
    dismissProfile,
    dismissTask,
    dismissIntegrationIssue,
  };
}
