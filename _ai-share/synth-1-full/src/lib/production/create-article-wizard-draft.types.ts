import type { Workshop2TzSignatoryExtraRow } from '@/lib/production/workshop2-dossier-phase1.types';

export const CREATE_ARTICLE_WIZARD_DRAFT_STORAGE_VER = 1;

export type CreateArticleWizardDraftV1 = {
  v: 1;
  mode: 'base' | 'new';
  baseLineId: string;
  baseSearch: string;
  sku: string;
  name: string;
  comment: string;
  audienceId: string;
  l1Name: string;
  l2Name: string;
  l3Name: string;
  tzDesigner?: string;
  tzTechnologist?: string;
  tzManager?: string;
  tzExtraRows?: Workshop2TzSignatoryExtraRow[];
};

export function parseCreateArticleWizardDraftV1(raw: unknown): CreateArticleWizardDraftV1 | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as CreateArticleWizardDraftV1;
  if (p.v !== CREATE_ARTICLE_WIZARD_DRAFT_STORAGE_VER) return null;
  if (p.mode !== 'base' && p.mode !== 'new') return null;
  return p;
}

export function createArticleWizardDraftStorageKey(collectionId: string): string {
  return `synth.workshop2.articleDraft.v${CREATE_ARTICLE_WIZARD_DRAFT_STORAGE_VER}:${collectionId}`;
}
