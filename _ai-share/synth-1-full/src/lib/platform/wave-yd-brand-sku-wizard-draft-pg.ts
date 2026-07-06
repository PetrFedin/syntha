/** Wave YD · brand SKU create-article wizard draft PG (`brand_create_article_wizard_drafts`). */

export const BRAND_SKU_WIZARD_DRAFT_API = '/api/brand/production/create-article-wizard-draft';

export const BRAND_SKU_WIZARD_DRAFT_PG_TABLE = 'brand_create_article_wizard_drafts';

export const BRAND_SKU_WIZARD_DRAFT_PG_BADGE_RU = 'PostgreSQL · черновик';
export const BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_RU = 'PG недоступен';
export const BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_RU =
  'Черновик мастера недоступен без PostgreSQL — запустите core:bootstrap.';

export const BRAND_SKU_WIZARD_DRAFT_LS_KEY_PREFIX = 'synth.workshop2.articleDraft.v1';

export const BRAND_SKU_WIZARD_DRAFT_PG_BADGE_TESTID = 'brand-w2-create-article-draft-storage-pg';
export const BRAND_SKU_WIZARD_DRAFT_PG_UNAVAILABLE_TESTID =
  'brand-w2-create-article-draft-storage-pg-unavailable';
export const BRAND_SKU_WIZARD_DRAFT_FAIL_CLOSED_BANNER_TESTID =
  'brand-w2-create-article-draft-fail-closed-banner';

export function brandSkuWizardDraftApiPath(collectionId: string): string {
  const cid = collectionId.trim();
  return `${BRAND_SKU_WIZARD_DRAFT_API}/${encodeURIComponent(cid)}`;
}
