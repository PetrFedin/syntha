import { getAttributeDossierSection } from '@/lib/production/attribute-catalog';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';

const SECTION_TO_W2SEC: Record<string, string> = {
  general: 'general',
  visuals: 'visuals',
  material: 'material',
  construction: 'construction',
  assignment: 'general',
};

/** Drill-down: missing catalog attr → W2 TZ section (no duplicate PIM form). */
export function brandAttributeMissingFixHref(input: {
  attributeId: string;
  collectionId?: string;
  articleId?: string;
}): string {
  const collectionId = input.collectionId?.trim() || PLATFORM_CORE_DEMO.collectionId;
  const articleId = input.articleId?.trim() || PLATFORM_CORE_DEMO.demoArticleId || 'demo-ss27-01';
  const section = getAttributeDossierSection(input.attributeId) ?? 'general';
  const w2sec = SECTION_TO_W2SEC[section] ?? 'general';
  return workshop2ArticleHref(collectionId, articleId, { w2pane: 'tz', w2sec });
}

export function brandAttributeMissingFixLabel(attributeId: string): string {
  const section = getAttributeDossierSection(attributeId) ?? 'general';
  return `W2 · ${section}`;
}
