import { describe, expect, it } from 'vitest';
import {
  buildWorkspaceHref,
  mergeWorkspaceContextIntoHref,
  parseWorkspaceSearchParams,
} from '@/shared/workspace/workspace-links';

describe('workspace href helpers', () => {
  it('keeps supported context, omits empty values and URL-encodes data', () => {
    expect(buildWorkspaceHref('collections', {
      campaignId: 'campaign / 1',
      collectionId: '',
      locale: 'ru-RU',
    })).toBe('/collections?campaignId=campaign+%2F+1&locale=ru-RU');
  });

  it('parses only typed workspace keys', () => {
    expect(parseWorkspaceSearchParams(
      new URLSearchParams('campaignId=campaign-1&unknown=unsafe&q=test'),
    )).toEqual({ campaignId: 'campaign-1', q: 'test' });
  });

  it('clears incompatible descendants when a parent changes', () => {
    const href = '/showroom?campaignId=old&collectionId=collection-1&showroomId=showroom-1';
    expect(mergeWorkspaceContextIntoHref(href, { campaignId: 'new' }))
      .toBe('/showroom?campaignId=new');
  });

  it('preserves unrelated existing parameters and hash', () => {
    const result = new URL(
      mergeWorkspaceContextIntoHref('/search?q=coat#results', { locale: 'ru-RU' }),
      'https://workspace.local',
    );
    expect(result.searchParams.get('q')).toBe('coat');
    expect(result.searchParams.get('locale')).toBe('ru-RU');
    expect(result.hash).toBe('#results');
  });
});
