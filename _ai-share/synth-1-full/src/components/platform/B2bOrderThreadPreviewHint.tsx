'use client';

import Link from 'next/link';
import { buildPgB2bOrderChatId } from '@/lib/platform-core-ports/brand/brand-messages-pg-threads';
import { ROUTES } from '@/lib/platform-core-routes';

type Role = 'brand' | 'shop';

type Props = {
  orderId: string;
  role: Role;
  preview?: string;
};

/** Превью треда или ссылка «Начать чат» вместо тупика «Нет сообщений». */
export function B2bOrderThreadPreviewHint({ orderId, role, preview }: Props) {
  if (preview?.trim()) {
    return (
      <span
        className="text-text-muted max-w-[14rem] truncate text-[9px] normal-case"
        data-testid={`${role}-b2b-order-chat-preview-${orderId}`}
        title={preview}
      >
        {preview}
      </span>
    );
  }

  const chatId = buildPgB2bOrderChatId(orderId);
  const href =
    role === 'brand' ? ROUTES.brand.messagesChat(chatId) : ROUTES.shop.messagesChat(chatId);

  return (
    <Link
      href={href}
      className="text-accent-primary text-[9px] font-semibold normal-case hover:underline"
      data-testid={`${role}-b2b-order-chat-start-${orderId}`}
    >
      Начать чат
    </Link>
  );
}
