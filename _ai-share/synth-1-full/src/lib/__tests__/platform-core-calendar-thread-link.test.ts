import { buildPlaceholderB2bOrderChat } from '@/lib/brand/brand-messages-pg-threads';
import { mapPlatformCoreB2bEventToCalendar } from '@/lib/platform-core-calendar-events-client';
import {
  calendarMessagesHrefFromThreadChatId,
  resolvePlatformCoreCalendarThreadChatId,
} from '@/lib/platform-core-calendar-thread-link';

describe('platform-core-calendar-thread-link', () => {
  it('привязывает отгрузку к чату B2B-заказа', () => {
    const chatId = resolvePlatformCoreCalendarThreadChatId({
      id: 'b2b-ship-order-B2B-DEMO-SHOP1-SS27',
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      b2bOrderId: 'B2B-DEMO-SHOP1-SS27',
      source: 'b2b',
      title: 'Отгрузка',
      startAt: '2026-07-01T09:00:00.000Z',
      endAt: '2026-07-01T18:00:00.000Z',
      kind: 'delivery_window',
    });
    expect(chatId).toBe('w2ctx:b2b_order:B2B-DEMO-SHOP1-SS27');
  });

  it('привязывает предзаказ к чату артикула', () => {
    const chatId = resolvePlatformCoreCalendarThreadChatId({
      id: 'b2b-preorder-SS27-demo-ss27-01-start',
      collectionId: 'SS27',
      articleId: 'demo-ss27-01',
      source: 'b2b',
      title: 'Предзаказ',
      startAt: '2026-06-01T09:00:00.000Z',
      endAt: '2026-06-01T18:00:00.000Z',
      kind: 'preorder_window',
    });
    expect(chatId).toBe('w2ctx:workshop2_article:SS27:demo-ss27-01');
  });

  it('строит ссылку на сообщения магазина из targetChatId', () => {
    const href = calendarMessagesHrefFromThreadChatId(
      'w2ctx:b2b_order:B2B-DEMO-SHOP1-SS27',
      'shop'
    );
    expect(href).toContain('/shop/messages');
    expect(href).toContain('B2B-DEMO-SHOP1-SS27');
    expect(href).toContain('chat=w2ctx%3Ab2b_order%3AB2B-DEMO-SHOP1-SS27');
  });

  it('brand B2B order → canonical messages href (не syntha overlay)', () => {
    const href = calendarMessagesHrefFromThreadChatId(
      'w2ctx:b2b_order:B2B-DEMO-SHOP1-SS27',
      'brand'
    );
    expect(href).toContain('/brand/messages');
    expect(href).toContain('contextType=b2b_order');
    expect(href).not.toContain('layers=tasks');
  });

  it('brand article → W2 messages href', () => {
    const href = calendarMessagesHrefFromThreadChatId(
      'w2ctx:workshop2_article:SS27:demo-ss27-01',
      'brand'
    );
    expect(href).toContain('/brand/messages');
    expect(href).toContain('contextType=workshop2_article');
    expect(href).not.toContain('layers=tasks');
  });

  it('mapPlatformCoreB2bEventToCalendar прокидывает targetChatId', () => {
    const mapped = mapPlatformCoreB2bEventToCalendar(
      {
        id: 'b2b-handoff-B2B-DEMO',
        collectionId: 'SS27',
        b2bOrderId: 'B2B-DEMO',
        source: 'b2b',
        title: 'Передача в производство',
        startAt: '2026-07-01T10:00:00.000Z',
        endAt: '2026-07-01T11:00:00.000Z',
        kind: 'market_date',
      },
      'brand'
    );
    expect(mapped.targetChatId).toBe('w2ctx:b2b_order:B2B-DEMO');
    expect(mapped.description).toContain('заказ B2B-DEMO');
  });

  it('materials_supplied event maps to B2B order chat', () => {
    const mapped = mapPlatformCoreB2bEventToCalendar(
      {
        id: 'b2b-materials-B2B-DEMO-SHOP1-SS27',
        collectionId: 'SS27',
        articleId: 'demo-ss27-01',
        b2bOrderId: 'B2B-DEMO-SHOP1-SS27',
        source: 'b2b',
        title: 'Материалы подтверждены · B2B-DEMO-SHOP1-SS27',
        startAt: '2026-07-01T14:00:00.000Z',
        endAt: '2026-07-01T15:00:00.000Z',
        kind: 'delivery_window',
      },
      'shop'
    );
    expect(mapped.targetChatId).toBe('w2ctx:b2b_order:B2B-DEMO-SHOP1-SS27');
    expect(mapped.layer).toBe('logistics');
  });

  it('placeholder B2B order chat uses w2ctx id and readable order label', () => {
    const chat = buildPlaceholderB2bOrderChat('ORD-NEW-42');
    expect(chat.id).toBe('w2ctx:b2b_order:ORD-NEW-42');
    expect(chat.title).toContain('ORD-NEW-42');
    expect(chat.subtitle).toContain('Начните переписку');
  });
});
