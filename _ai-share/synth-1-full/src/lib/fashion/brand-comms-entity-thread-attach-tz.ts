import type { BrandCommsEntityThreadKind } from '@/lib/fashion/brand-comms-entity-threads';

export function brandCommsEntityThreadAttachTzMessage(input: {
  threadKind: BrandCommsEntityThreadKind;
  collectionId: string;
  articleId: string;
  dossierHref: string;
}): string {
  const label =
    input.threadKind === 'bom'
      ? 'BOM · material'
      : input.threadKind === 'sample'
        ? 'Sample round'
        : input.threadKind;
  return `TZ из dossier прикреплён к thread «${label}» · ${input.collectionId}:${input.articleId}`;
}

export function brandCommsEntityThreadSupportsAttachTz(kind: BrandCommsEntityThreadKind): boolean {
  return kind === 'bom' || kind === 'sample';
}
