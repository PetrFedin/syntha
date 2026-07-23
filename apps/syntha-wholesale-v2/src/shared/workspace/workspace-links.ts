import type { Route } from 'next';
import type { CommercialContext } from '@/shared/commercial-context';
import {
  getWorkspaceSectionById,
  type WorkspaceSectionId,
} from '@/shared/navigation';

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
export type WorkspaceHref = Route<`/${string}`>;

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

  return normalizeWorkspaceUrlContext(result);
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

function appendContext(url: URL, context: WorkspaceUrlContext): void {
  const normalized = normalizeWorkspaceUrlContext(context);
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

  Object.assign(merged, context);
  url.search = '';
  appendContext(url, merged);
  return `${url.pathname}${url.search}${url.hash}` as WorkspaceHref;
}
