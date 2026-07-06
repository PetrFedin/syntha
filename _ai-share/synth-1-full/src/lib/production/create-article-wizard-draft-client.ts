'use client';

import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { shouldMirrorPgClientStoreToLocalStorage } from '@/lib/production/workshop2-pg-read-path-policy';
import type { CreateArticleWizardDraftV1 } from './create-article-wizard-draft.types';
import {
  clearCreateArticleWizardDraftFromStorage,
  loadCreateArticleWizardDraftFromStorage,
  saveCreateArticleWizardDraftToStorage,
} from './create-article-wizard-draft-store';

export type CreateArticleWizardDraftPersistMode = 'postgres' | 'local';

export type CreateArticleWizardDraftLoadResult = {
  draft: CreateArticleWizardDraftV1 | null;
  persistMode: CreateArticleWizardDraftPersistMode;
  pgUnavailable: boolean;
};

let cachedPersistMode: CreateArticleWizardDraftPersistMode | null = null;

export function resetCreateArticleWizardDraftPersistModeCacheForTests(): void {
  cachedPersistMode = null;
}

function apiPath(collectionId: string): string {
  return `/api/brand/production/create-article-wizard-draft/${encodeURIComponent(collectionId)}`;
}

/** PG BFF when доступен; иначе localStorage (не в core). */
export async function loadCreateArticleWizardDraftWithMode(
  collectionId: string
): Promise<CreateArticleWizardDraftLoadResult> {
  const corePgOnly = isPlatformCoreMode();
  const cid = collectionId.trim();
  if (!cid) {
    return {
      draft: null,
      persistMode: corePgOnly ? 'postgres' : 'local',
      pgUnavailable: false,
    };
  }

  try {
    const res = await fetch(apiPath(cid), { cache: 'no-store' });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; draft?: CreateArticleWizardDraftV1 | null };
      if (data.ok) {
        cachedPersistMode = 'postgres';
        const draft = data.draft ?? null;
        if (draft && shouldMirrorPgClientStoreToLocalStorage()) {
          saveCreateArticleWizardDraftToStorage(cid, draft);
        }
        return { draft, persistMode: 'postgres', pgUnavailable: false };
      }
    }
    if (corePgOnly) {
      cachedPersistMode = 'postgres';
      return { draft: null, persistMode: 'postgres', pgUnavailable: true };
    }
  } catch {
    if (corePgOnly) {
      cachedPersistMode = 'postgres';
      return { draft: null, persistMode: 'postgres', pgUnavailable: true };
    }
  }

  cachedPersistMode = 'local';
  return {
    draft: loadCreateArticleWizardDraftFromStorage(cid),
    persistMode: 'local',
    pgUnavailable: false,
  };
}

export async function persistCreateArticleWizardDraft(
  collectionId: string,
  payload: CreateArticleWizardDraftV1
): Promise<{ persistMode: CreateArticleWizardDraftPersistMode }> {
  const cid = collectionId.trim();
  const mode =
    cachedPersistMode ?? (await loadCreateArticleWizardDraftWithMode(cid)).persistMode;

  if (mode === 'postgres') {
    await fetch(apiPath(cid), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draft: payload }),
    });
    if (shouldMirrorPgClientStoreToLocalStorage()) {
      saveCreateArticleWizardDraftToStorage(cid, payload);
    }
    return { persistMode: 'postgres' };
  }

  saveCreateArticleWizardDraftToStorage(cid, payload);
  return { persistMode: 'local' };
}

export async function clearCreateArticleWizardDraft(
  collectionId: string
): Promise<{ persistMode: CreateArticleWizardDraftPersistMode }> {
  const cid = collectionId.trim();
  const mode =
    cachedPersistMode ?? (await loadCreateArticleWizardDraftWithMode(cid)).persistMode;

  if (mode === 'postgres') {
    await fetch(apiPath(cid), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true }),
    });
    if (shouldMirrorPgClientStoreToLocalStorage()) {
      clearCreateArticleWizardDraftFromStorage(cid);
    }
    return { persistMode: 'postgres' };
  }

  clearCreateArticleWizardDraftFromStorage(cid);
  return { persistMode: 'local' };
}
