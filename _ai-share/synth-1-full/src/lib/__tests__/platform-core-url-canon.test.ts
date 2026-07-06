import {
  isDefaultPlatformCoreCollectionId,
  omitDefaultCollectionSearchParam,
  platformHomeHref,
} from '@/lib/platform-core-url-canon';

describe('platform-core-url-canon', () => {
  it('treats SS27 as default collection pin', () => {
    expect(isDefaultPlatformCoreCollectionId(null)).toBe(true);
    expect(isDefaultPlatformCoreCollectionId('SS27')).toBe(true);
    expect(isDefaultPlatformCoreCollectionId('FW27')).toBe(false);
  });

  it('strips default collection from search params', () => {
    const sp = new URLSearchParams('collection=SS27&views=audit');
    const next = omitDefaultCollectionSearchParam(sp);
    expect(next.get('collection')).toBeNull();
    expect(next.get('views')).toBe('audit');
  });

  it('platformHomeHref omits default collection', () => {
    expect(platformHomeHref()).toBe('/platform');
    expect(platformHomeHref('SS27')).toBe('/platform');
    expect(platformHomeHref('FW27')).toBe('/platform?collection=FW27');
  });
});
