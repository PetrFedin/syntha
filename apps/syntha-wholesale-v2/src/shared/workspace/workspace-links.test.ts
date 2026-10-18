import { describe, expect, it } from 'vitest';
import {
  buildWorkspaceHref,
  mergeWorkspaceContextIntoHref,
  parseWorkspaceSearchParams,
  sanitizeWorkspaceUrlContext,
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

  it('removes an explicitly emptied parent and all of its descendants', () => {
    const href = '/showroom?campaignId=old&collectionId=collection-1&showroomId=showroom-1';
    expect(mergeWorkspaceContextIntoHref(href, { campaignId: '' })).toBe('/showroom');
  });

  it.each([
    [{ collectionId: 'collection-1' }, {}],
    [{ orderId: 'order-1' }, {}],
    [{ dealId: 'deal-1' }, {}],
  ])('removes orphan commercial context %o', (context, expected) => {
    expect(sanitizeWorkspaceUrlContext(context)).toEqual(expected);
  });

  it('keeps a complete commercial path and neutral parameters', () => {
    const context = {
      organisationId: 'organisation-1',
      seasonId: 'season-1',
      campaignId: 'campaign-1',
      collectionId: 'collection-1',
      showroomId: 'showroom-1',
      selectionId: 'selection-1',
      orderDraftId: 'draft-1',
      orderId: 'order-1',
      confirmationId: 'confirmation-1',
      dealId: 'deal-1',
      q: 'coat',
      locale: 'ru-RU',
    };
    expect(sanitizeWorkspaceUrlContext(context)).toEqual(context);
  });

  it('keeps valid parents but removes a descendant separated by a gap', () => {
    expect(sanitizeWorkspaceUrlContext({
      campaignId: 'campaign-1',
      collectionId: 'collection-1',
      selectionId: 'selection-1',
      q: 'coat',
    })).toEqual({
      campaignId: 'campaign-1',
      collectionId: 'collection-1',
      q: 'coat',
    });
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

  it('merges and encodes a message thread without clearing commercial context', () => {
    const href = mergeWorkspaceContextIntoHref(
      '/messages?campaignId=campaign-1&threadId=old#latest',
      { threadId: 'thread / 2' },
    );
    const result = new URL(href, 'https://workspace.local');

    expect(result.pathname).toBe('/messages');
    expect(result.searchParams.getAll('threadId')).toEqual(['thread / 2']);
    expect(result.searchParams.get('campaignId')).toBe('campaign-1');
    expect(result.hash).toBe('#latest');
  });

  it('adds a thread to a URL without an existing query string', () => {
    expect(mergeWorkspaceContextIntoHref('/messages', { threadId: 'thread-1' }))
      .toBe('/messages?threadId=thread-1');
  });
});
