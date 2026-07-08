/**
 * Persist dismissed «Требует внимания» items per brand (localStorage).
 * Сервер: GET/PATCH `/api/v1/brand/attention-dismiss/{brandId}` — union с локальным снимком при загрузке.
 */

const STORAGE_PREFIX = 'fashion-org-attention-dismiss:v1:';

export type IntegrationIssueDismissItem = { id: string; message: string };

export type AttentionDismissSlice = {
  certificates: { id: string }[];
  profile: { id: string }[];
  tasks: { id: string }[];
  integrationIssues: IntegrationIssueDismissItem[];
};

export type AttentionDismissRecord = {
  v: 1;
  certificateIds: string[];
  profileIds: string[];
  taskIds: string[];
  integrationIssueIds: string[];
};

export function emptyAttentionDismissRecord(): AttentionDismissRecord {
  return { v: 1, certificateIds: [], profileIds: [], taskIds: [], integrationIssueIds: [] };
}

export function attentionDismissRecordsEqual(
  a: AttentionDismissRecord | null | undefined,
  b: AttentionDismissRecord | null | undefined
): boolean {
  const norm = (r: AttentionDismissRecord | null | undefined) => {
    if (!r || r.v !== 1) return null;
    const s = (xs: string[]) => [...xs].sort().join('\u0001');
    return `${s(r.certificateIds)}\u0002${s(r.profileIds)}\u0002${s(r.taskIds)}\u0002${s(r.integrationIssueIds)}`;
  };
  return norm(a) === norm(b);
}

/** GenericResponse.data из GET attention-dismiss */
export function parseAttentionDismissFromApi(data: unknown): AttentionDismissRecord | null {
  if (data == null || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.v !== 1) return null;
  return {
    v: 1,
    certificateIds: Array.isArray(o.certificateIds)
      ? o.certificateIds.filter((x): x is string => typeof x === 'string')
      : [],
    profileIds: Array.isArray(o.profileIds)
      ? o.profileIds.filter((x): x is string => typeof x === 'string')
      : [],
    taskIds: Array.isArray(o.taskIds)
      ? o.taskIds.filter((x): x is string => typeof x === 'string')
      : [],
    integrationIssueIds: Array.isArray(o.integrationIssueIds)
      ? o.integrationIssueIds.filter((x): x is string => typeof x === 'string')
      : [],
  };
}

export function mergeAttentionDismissRecords(
  a: AttentionDismissRecord | null | undefined,
  b: AttentionDismissRecord | null | undefined
): AttentionDismissRecord {
  const out = emptyAttentionDismissRecord();
  const mergeKey = (
    k: keyof Pick<
      AttentionDismissRecord,
      'certificateIds' | 'profileIds' | 'taskIds' | 'integrationIssueIds'
    >
  ) => {
    const set = new Set<string>();
    for (const rec of [a, b]) {
      rec?.[k]?.forEach((id) => {
        if (typeof id === 'string' && id) set.add(id);
      });
    }
    out[k] = Array.from(set).sort();
  };
  mergeKey('certificateIds');
  mergeKey('profileIds');
  mergeKey('taskIds');
  mergeKey('integrationIssueIds');
  return out;
}

function keyForBrand(brandId: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(brandId)}`;
}

export function loadAttentionDismiss(brandId: string): AttentionDismissRecord | null {
  if (typeof window === 'undefined' || !brandId) return null;
  try {
    const raw = window.localStorage.getItem(keyForBrand(brandId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AttentionDismissRecord>;
    if (parsed?.v !== 1) return null;
    return {
      v: 1,
      certificateIds: Array.isArray(parsed.certificateIds)
        ? parsed.certificateIds.filter((x): x is string => typeof x === 'string')
        : [],
      profileIds: Array.isArray(parsed.profileIds)
        ? parsed.profileIds.filter((x): x is string => typeof x === 'string')
        : [],
      taskIds: Array.isArray(parsed.taskIds)
        ? parsed.taskIds.filter((x): x is string => typeof x === 'string')
        : [],
      integrationIssueIds: Array.isArray(parsed.integrationIssueIds)
        ? parsed.integrationIssueIds.filter((x): x is string => typeof x === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

export function saveAttentionDismiss(brandId: string, record: AttentionDismissRecord): void {
  if (typeof window === 'undefined' || !brandId) return;
  try {
    window.localStorage.setItem(keyForBrand(brandId), JSON.stringify(record));
  } catch {
    // quota / private mode — UI всё равно обновлён в памяти
  }
}

export function appendDismissedAlertId(
  brandId: string,
  bucket: keyof Pick<
    AttentionDismissRecord,
    'certificateIds' | 'profileIds' | 'taskIds' | 'integrationIssueIds'
  >,
  id: string
): void {
  if (!brandId || !id) return;
  const cur = loadAttentionDismiss(brandId) ?? emptyAttentionDismissRecord();
  if (cur[bucket].includes(id)) return;
  cur[bucket] = [...cur[bucket], id];
  saveAttentionDismiss(brandId, cur);
}

export function applyAttentionDismissFilters<T extends AttentionDismissSlice>(
  state: T,
  dismissed: AttentionDismissRecord | null
): T {
  if (!dismissed) return state;
  const c = new Set(dismissed.certificateIds);
  const p = new Set(dismissed.profileIds);
  const t = new Set(dismissed.taskIds);
  const ii = new Set(dismissed.integrationIssueIds);
  return {
    ...state,
    certificates: state.certificates.filter((x) => !c.has(x.id)),
    profile: state.profile.filter((x) => !p.has(x.id)),
    tasks: state.tasks.filter((x) => !t.has(x.id)),
    integrationIssues: state.integrationIssues.filter((x) => !ii.has(x.id)),
  };
}
