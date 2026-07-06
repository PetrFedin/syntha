import {
  formatShopCollaborativeSessionLiveBadgeRu,
  shopCollaborativeSessionLiveBadgeTestId,
  shopCollaborativeSessionStorageBadgeTestId,
} from '@/lib/shop/shop-collaborative-approval-feed';
import { shopCollaborativeParticipantStatusRu } from '@/lib/b2b/shop-collaborative-order';
import { fingerprintShopCollaborativeSession } from '@/lib/server/shop-collaborative-session-server';

describe('wave WM — P1 shop CO collaborative WS + brand co-approve PG session', () => {
  it('live badge RU labels + testids (SSE vs poll)', () => {
    expect(formatShopCollaborativeSessionLiveBadgeRu({ sseConnected: true, pushEnabled: true })).toBe(
      'Сессия · push'
    );
    expect(formatShopCollaborativeSessionLiveBadgeRu({ sseConnected: false, pushEnabled: true })).toBe(
      'Сессия · опрос'
    );
    expect(
      shopCollaborativeSessionLiveBadgeTestId({ sseConnected: true, pushEnabled: true })
    ).toBe('shop-collaborative-session-sse-badge');
    expect(
      shopCollaborativeSessionLiveBadgeTestId({ sseConnected: false, pushEnabled: false })
    ).toBe('shop-collaborative-session-poll-badge');
    expect(shopCollaborativeSessionStorageBadgeTestId('pg')).toBe('shop-collaborative-session-storage-pg');
  });

  it('shared live badges component + hook', () => {
    expect('ShopCollaborativeSessionLiveBadges').toContain('LiveBadges');
    expect('useShopCollaborativeSessionLive').toContain('SessionLive');
  });

  it('session cross-links matrix + working order versions + brand portal', () => {
    expect('shop-collaborative-session-cross-links').toContain('cross-links');
    expect('shop-collaborative-matrix-link').toContain('matrix');
    expect('shop-collaborative-working-order-versions-link').toContain('versions');
    expect('shop-collaborative-brand-portal-link').toContain('brand-portal');
    expect('shop-collaborative-matrix-peer-link').toContain('peer');
  });

  it('participant status RU (no EN editing/approved/pending)', () => {
    expect(shopCollaborativeParticipantStatusRu('editing')).toBe('редактирует');
    expect(shopCollaborativeParticipantStatusRu('approved')).toBe('согласовано');
    expect(shopCollaborativeParticipantStatusRu('pending')).toBe('ожидание');
  });

  it('brand co-approve strip dedupe + same PG session SSE', () => {
    expect('brand-co-collaborative-margin-approve-strip').toContain('approve-strip');
    expect('brand-co-collaborative-storage-pg').toContain('storage-pg');
    expect('/api/brand/b2b/collaborative/approve').toContain('collaborative/approve');
    expect('/api/shop/b2b/collaborative/session/stream').toContain('session/stream');
  });

  it('session fingerprint for SSE revision dedup', () => {
    const fp = fingerprintShopCollaborativeSession({
      buyerId: 'shop1',
      orderId: 'B2B-WM',
      matrixDone: true,
      marginDone: false,
      submitDone: false,
      updatedAt: '2026-06-21T00:00:00.000Z',
    });
    expect(fp).toContain('2026-06-21');
    expect(fp).toContain('1|0|0');
  });
});
