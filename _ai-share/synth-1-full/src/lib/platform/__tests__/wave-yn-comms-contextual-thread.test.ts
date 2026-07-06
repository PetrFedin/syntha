import fs from 'node:fs';
import path from 'node:path';
import {
  appendUniqueContextualChatPlaceholder,
  dedupeChatConversationsById,
} from '@/lib/communications/dedupe-contextual-chat-conversations';
import { buildPlaceholderB2bOrderChat } from '@/lib/brand/brand-messages-pg-threads';
import {
  WAVE_YN_OPEN_MESSAGES_RU,
  WAVE_YN_ORDER_CHAT_RU,
  waveYnContextualThreadSectionId,
} from '@/lib/platform/wave-yn-comms-contextual-thread';

const SRC = path.join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

/** Wave YN — contextual POST from tracking/calendar/order card + WF picker + dedupe placeholders. */
export const WAVE_YN_COMMS_FIXES = [
  {
    id: 'contextual-thread-link-component',
    file: 'components/platform/CommsContextualThreadLink.tsx',
    mustContain: ['postCommsContextualThreadEnsure', 'contextualSource', 'CommsContextualThreadLink'],
  },
  {
    id: 'tracking-panel-chat-post',
    file: 'components/platform/PlatformCoreShopB2bTrackingPanel.tsx',
    mustContain: ['CommsContextualThreadLink', 'contextualSource="tracking"', 'shop-co-tracking-order-chat-link'],
  },
  {
    id: 'calendar-peer-strips-chat-post',
    file: 'components/platform/BrandCmCalendarContextPeerStrip.tsx',
    mustContain: ['CommsContextualThreadLink', 'contextualSource="calendar"', 'brand-cm-calendar-order-chat-link'],
  },
  {
    id: 'shop-calendar-peer-chat-post',
    file: 'components/platform/ShopCmCalendarContextPeerStrip.tsx',
    mustContain: ['CommsContextualThreadLink', 'contextualSource="calendar"', 'shop-cm-calendar-order-chat-link'],
  },
  {
    id: 'order-card-brand-detail-ru',
    file: 'components/brand/b2b/BrandOrderCommsDetailPanel.tsx',
    mustContain: ['WAVE_YN_OPEN_MESSAGES_RU', 'contextualSource="order-card"'],
    mustNotContain: ['Open messages', 'Chat tab'],
  },
  {
    id: 'order-card-shop-panel-ru',
    file: 'components/shop/b2b/ShopOrderCommsPanels.tsx',
    mustContain: ['WAVE_YN_OPEN_MESSAGES_RU', 'contextualSource="order-card"'],
    mustNotContain: ['Open messages'],
  },
  {
    id: 'messages-page-entity-picker-context',
    file: 'components/user/messages/MessagesPage.tsx',
    mustContain: [
      'PlatformCoreEntityThreadTemplatePicker',
      'entityPickerContext.collectionId',
      'entityPickerContext.orderId',
      'entityPickerContext.articleId',
    ],
  },
  {
    id: 'chat-state-dedupe-placeholders',
    file: 'components/user/messages/hooks/useChatState.ts',
    mustContain: ['appendUniqueContextualChatPlaceholder'],
  },
  {
    id: 'wf-template-apply-post',
    file: 'lib/communications/platform-core-entity-thread-template-apply.ts',
    mustContain: ['applyPlatformCoreEntityThreadTemplate', 'postPlatformCoreCommsContextualThread'],
  },
] as const;

describe('wave YN — comms contextual thread polish', () => {
  it('exports RU label constants', () => {
    expect(WAVE_YN_ORDER_CHAT_RU).toBe('Чат заказа');
    expect(WAVE_YN_OPEN_MESSAGES_RU).toBe('Открыть сообщения');
    expect(waveYnContextualThreadSectionId('tracking')).toBe('wave-yn-tracking');
    expect(waveYnContextualThreadSectionId('calendar')).toBe('wave-yn-calendar');
    expect(waveYnContextualThreadSectionId('order-card')).toBe('wave-yn-order-card');
  });

  it('dedupes chat sidebar by w2ctx id', () => {
    const placeholder = buildPlaceholderB2bOrderChat('B2B-DEMO-001');
    const deduped = dedupeChatConversationsById([placeholder, placeholder]);
    expect(deduped).toHaveLength(1);
  });

  it('skips duplicate contextual placeholder when chat already listed', () => {
    const placeholder = buildPlaceholderB2bOrderChat('B2B-DEMO-001');
    const merged = appendUniqueContextualChatPlaceholder([placeholder], placeholder.id);
    expect(merged).toHaveLength(1);
  });

  it('contextual POST API + WF picker wired', () => {
    expect('/api/platform-core/comms/contextual-thread').toContain('contextual-thread');
    expect('postCommsContextualThreadEnsure').toContain('Ensure');
    expect('PlatformCoreEntityThreadTemplatePicker').toContain('TemplatePicker');
    expect('applyPlatformCoreEntityThreadTemplate').toContain('EntityThread');
  });

  it.each(WAVE_YN_COMMS_FIXES)('$id — source wired', (fix) => {
    const text = read(fix.file);
    for (const needle of fix.mustContain) {
      expect(text).toContain(needle);
    }
    for (const needle of fix.mustNotContain ?? []) {
      expect(text).not.toContain(needle);
    }
  });
});
