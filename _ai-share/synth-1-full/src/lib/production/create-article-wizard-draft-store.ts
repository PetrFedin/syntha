'use client';

import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';

import type { CreateArticleWizardDraftV1 } from './create-article-wizard-draft.types';
import {
  createArticleWizardDraftStorageKey,
  parseCreateArticleWizardDraftV1,
} from './create-article-wizard-draft.types';

export type { CreateArticleWizardDraftV1 } from './create-article-wizard-draft.types';
export {
  CREATE_ARTICLE_WIZARD_DRAFT_STORAGE_VER,
  createArticleWizardDraftStorageKey,
  parseCreateArticleWizardDraftV1,
} from './create-article-wizard-draft.types';

export function loadCreateArticleWizardDraftFromStorage(
  collectionId: string
): CreateArticleWizardDraftV1 | null {
  if (!shouldUseLocalStorageClientFallbackInCore()) return null;
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(createArticleWizardDraftStorageKey(collectionId));
    if (!raw) return null;
    return parseCreateArticleWizardDraftV1(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function saveCreateArticleWizardDraftToStorage(
  collectionId: string,
  payload: CreateArticleWizardDraftV1
): void {
  if (!shouldUseLocalStorageClientFallbackInCore()) return;
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    createArticleWizardDraftStorageKey(collectionId),
    JSON.stringify(payload)
  );
}

export function clearCreateArticleWizardDraftFromStorage(collectionId: string): void {
  if (!shouldUseLocalStorageClientFallbackInCore()) return;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(createArticleWizardDraftStorageKey(collectionId));
  } catch {
    /* ignore */
  }
}
