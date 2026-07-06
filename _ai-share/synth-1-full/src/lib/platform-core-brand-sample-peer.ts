import { factoryProductionDossierHref } from '@/lib/platform-core-routes';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';

export type BrandDevelopmentSamplePeerOpts = {
  sampleStatus?: string | null;
};

function isBrandSampleDispatched(sampleStatus?: string | null): boolean {
  const status = sampleStatus?.trim().toLowerCase() ?? '';
  return status !== '' && status !== 'draft';
}

/** Brand peer для образца — не `/factory/production#sample-queue` (UI роли цеха). */
export function brandDevelopmentSamplePeerHref(
  collectionId: string,
  articleId: string,
  opts?: BrandDevelopmentSamplePeerOpts
): string {
  if (isBrandSampleDispatched(opts?.sampleStatus)) {
    return factoryProductionDossierHref(articleId, { collectionId });
  }
  return workshop2ArticleHref(collectionId, articleId, {
    w2pane: 'sample',
    hash: 'w2article-section-plan-po',
  });
}

export function brandDevelopmentSamplePeerLabelShort(
  opts?: BrandDevelopmentSamplePeerOpts
): string {
  return isBrandSampleDispatched(opts?.sampleStatus) ? 'Статус образца' : 'Образец в цех';
}

export function brandDevelopmentSamplePeerLabelLong(
  opts?: BrandDevelopmentSamplePeerOpts
): string {
  return isBrandSampleDispatched(opts?.sampleStatus)
    ? 'Статус образца в цехе →'
    : 'Образец в цех →';
}
