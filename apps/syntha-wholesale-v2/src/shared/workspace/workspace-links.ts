import type { CommercialContext } from '@/shared/commercial-context';
import {
  getWorkspaceSectionById,
  type WorkspaceSectionId,
} from '@/shared/navigation';
import type { WorkspaceHref } from '@/shared/routing';

export interface WorkspaceUrlContext extends CommercialContext {
  readonly partnerId?: string;
  readonly currency?: string;
  readonly locale?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly threadId?: string;
  readonly q?: string;
}

export type WorkspaceSearchParamKey = keyof WorkspaceUrlContext;

const workspaceSearchParamKeys = [
  'organisationId',
  'seasonId',
  'campaignId',
  'collectionId',
  'showroomId',
  'selectionId',
  'orderDraftId',
  'orderId',
  'confirmationId',
  'dealId',
  'partnerId',
  'currency',
  'locale',
  'entityType',
  'entityId',
  'threadId',
  'q',
] as const satisfies readonly WorkspaceSearchParamKey[];

const dependentKeys = [
  'organisationId',
  'seasonId',
  'campaignId',
  'collectionId',
  'showroomId',
  'selectionId',
  'orderDraftId',
  'orderId',
  'confirmationId',
  'dealId',
] as const satisfies readonly WorkspaceSearchParamKey[];

const requiredUrlParent: Partial<
  Record<(typeof dependentKeys)[number], (typeof dependentKeys)[number]>
> = {
  seasonId: 'organisationId',
  collectionId: 'campaignId',
  showroomId: 'collectionId',
  selectionId: 'showroomId',
  orderDraftId: 'selectionId',
  orderId: 'orderDraftId',
  confirmationId: 'orderId',
  dealId: 'confirmationId',
};

type SearchParamsInput =
  | URLSearchParams
  | Readonly<Record<string, string | readonly string[] | undefined>>;

function firstValue(value: string | readonly string[] | undefined): string | undefined {
  return typeof value === 'string' || value === undefined ? value : value[0];
}

function cleanValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function parseWorkspaceSearchParams(input: SearchParamsInput): WorkspaceUrlContext {
  const result: Partial<Record<WorkspaceSearchParamKey, string>> = {};

  for (const key of workspaceSearchParamKeys) {
    const rawValue =
      input instanceof URLSearchParams
        ? input.get(key) ?? undefined
        : firstValue(input[key]);
    const value = cleanValue(rawValue);
    if (value) result[key] = value;
  }

  return sanitizeWorkspaceUrlContext(result);
}

export function normalizeWorkspaceUrlContext(
  context: WorkspaceUrlContext,
): WorkspaceUrlContext {
  const normalized: Partial<Record<WorkspaceSearchParamKey, string>> = {};

  for (const key of workspaceSearchParamKeys) {
    const value = cleanValue(context[key]);
    if (value) normalized[key] = value;
  }

  return normalized;
}

export function sanitizeWorkspaceUrlContext(
  context: WorkspaceUrlContext,
): WorkspaceUrlContext {
  const sanitized = { ...normalizeWorkspaceUrlContext(context) };

  for (const key of dependentKeys) {
    const requiredParent = requiredUrlParent[key];
    if (sanitized[key] && requiredParent && !sanitized[requiredParent]) {
      delete sanitized[key];
    }
  }

  if (
    (sanitized.entityType && !sanitized.entityId)
    || (!sanitized.entityType && sanitized.entityId)
  ) {
    delete sanitized.entityType;
    delete sanitized.entityId;
  }

  return sanitized;
}

function appendContext(url: URL, context: WorkspaceUrlContext): void {
  const normalized = sanitizeWorkspaceUrlContext(context);
  for (const key of workspaceSearchParamKeys) {
    const value = normalized[key];
    if (value) url.searchParams.set(key, value);
  }
}

export function buildWorkspaceHref(
  destination: WorkspaceSectionId | '/',
  context: WorkspaceUrlContext = {},
): WorkspaceHref {
  const href =
    destination === '/' ? '/' : getWorkspaceSectionById(destination).href;
  const url = new URL(href, 'https://workspace.local');
  appendContext(url, context);
  return `${url.pathname}${url.search}` as WorkspaceHref;
}

export function mergeWorkspaceContextIntoHref(
  href: string,
  context: WorkspaceUrlContext,
): WorkspaceHref {
  const url = new URL(href, 'https://workspace.local');
  const existing = parseWorkspaceSearchParams(url.searchParams);
  const normalizedPatch = normalizeWorkspaceUrlContext(context);
  const merged: Partial<Record<WorkspaceSearchParamKey, string>> = {
    ...existing,
  };
  const changedIndex = dependentKeys.findIndex((key) =>
    Object.prototype.hasOwnProperty.call(context, key),
  );

  if (changedIndex >= 0) {
    for (const key of dependentKeys.slice(changedIndex + 1)) {
      delete merged[key];
    }
  }

  for (const key of workspaceSearchParamKeys) {
    if (!Object.prototype.hasOwnProperty.call(context, key)) continue;
    const value = normalizedPatch[key];
    if (value) {
      merged[key] = value;
    } else {
      delete merged[key];
    }
  }
  url.search = '';
  appendContext(url, sanitizeWorkspaceUrlContext(merged));
  return `${url.pathname}${url.search}${url.hash}` as WorkspaceHref;
}
