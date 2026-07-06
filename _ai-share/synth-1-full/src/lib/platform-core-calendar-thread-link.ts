import type { Workshop2B2bCalendarEvent } from '@/lib/production/workshop2-b2b-campaign-hub';
import { WORKSHOP2_ARTICLE_CONTEXT_TYPE } from '@/lib/production/workshop2-domain-event-types';
import { buildPgB2bOrderChatId } from '@/lib/brand/brand-messages-pg-threads';
import type { UserRole } from '@/lib/types';
import {
  brandMessagesB2bOrderContextHref,
  brandMessagesWorkshop2ArticleContextHref,
  factoryMessagesB2bOrderContextHref,
  factoryMessagesWorkshop2ArticleContextHref,
  factorySupplierMessagesB2bOrderContextHref,
  factorySupplierMessagesWorkshop2ArticleContextHref,
  shopMessagesB2bOrderContextHref,
  shopMessagesWorkshop2ArticleContextHref,
} from '@/lib/platform-core-routes';

/** PG chat id (`w2ctx:…`) для события B2B-календаря Platform Core. */
export function resolvePlatformCoreCalendarThreadChatId(
  event: Workshop2B2bCalendarEvent
): string | undefined {
  const orderId = event.b2bOrderId?.trim();
  if (orderId) return buildPgB2bOrderChatId(orderId);

  const collectionId = event.collectionId?.trim();
  const articleId = event.articleId?.trim();
  if (collectionId && articleId) {
    return `w2ctx:${WORKSHOP2_ARTICLE_CONTEXT_TYPE}:${collectionId}:${articleId}`;
  }
  return undefined;
}

function appendThreadChatFocusParam(href: string, targetChatId: string): string {
  const q = href.indexOf('?');
  const base = q >= 0 ? href.slice(0, q) : href;
  const sp = new URLSearchParams(q >= 0 ? href.slice(q + 1) : '');
  sp.set('chat', targetChatId);
  const query = sp.toString();
  return query ? `${base}?${query}` : base;
}

/** Ссылка на сообщения по `targetChatId` и роли кабинета (с `chat=` для авто-фокуса треда). */
export function calendarMessagesHrefFromThreadChatId(
  targetChatId: string,
  ownerRole: UserRole
): string | undefined {
  if (targetChatId.startsWith('w2ctx:b2b_order:')) {
    const orderId = targetChatId.slice('w2ctx:b2b_order:'.length).trim();
    if (!orderId) return undefined;
    let href: string | undefined;
    if (ownerRole === 'shop') href = shopMessagesB2bOrderContextHref(orderId);
    else if (ownerRole === 'brand') href = brandMessagesB2bOrderContextHref(orderId);
    else if (ownerRole === 'manufacturer') {
      href = factoryMessagesB2bOrderContextHref(orderId, { role: 'manufacturer' });
    } else if (ownerRole === 'supplier') {
      href = factorySupplierMessagesB2bOrderContextHref(orderId);
    } else href = shopMessagesB2bOrderContextHref(orderId);
    return href ? appendThreadChatFocusParam(href, targetChatId) : undefined;
  }

  const articlePrefix = `w2ctx:${WORKSHOP2_ARTICLE_CONTEXT_TYPE}:`;
  if (targetChatId.startsWith(articlePrefix)) {
    const body = targetChatId.slice(articlePrefix.length);
    const sep = body.indexOf(':');
    if (sep <= 0) return undefined;
    const collectionId = body.slice(0, sep).trim();
    const articleId = body.slice(sep + 1).trim();
    if (!collectionId || !articleId) return undefined;
    let href: string | undefined;
    if (ownerRole === 'brand') {
      href = brandMessagesWorkshop2ArticleContextHref(collectionId, articleId);
    } else if (ownerRole === 'manufacturer') {
      href = factoryMessagesWorkshop2ArticleContextHref(collectionId, articleId, {
        role: 'manufacturer',
      });
    } else if (ownerRole === 'supplier') {
      href = factorySupplierMessagesWorkshop2ArticleContextHref(collectionId, articleId);
    } else href = shopMessagesWorkshop2ArticleContextHref(collectionId, articleId);
    return href ? appendThreadChatFocusParam(href, targetChatId) : undefined;
  }

  return undefined;
}
