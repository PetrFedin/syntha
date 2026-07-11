'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, MessageSquare, StickyNote } from 'lucide-react';
import { CommsPillarCardBaseline } from '@/components/platform/pillars/CommsPillarCardBaseline';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';

type Role = 'brand' | 'shop';

type Props = {
  role: Role;
  collectionId: string;
  sectionId: string;
  orderId?: string | null;
  articleId?: string | null;
};

const BRAND_SECTIONS = new Set([
  'brand-cm-order-chat',
  'brand-cm-article-chat',
  'brand-cm-calendar',
  'brand-cm-notes',
]);

const SHOP_SECTIONS = new Set(['shop-cm-order-chat', 'shop-cm-calendar-order']);

function defaultSection(role: Role): string {
  return role === 'brand' ? 'brand-cm-order-chat' : 'shop-cm-order-chat';
}

function sectionMeta(role: Role, sectionId: string) {
  if (sectionId.includes('calendar')) {
    return {
      title: 'Календарь и контроль сроков',
      description:
        'Планируйте встречи, дедлайны, окна поставки и действия по заказу в контексте текущей коллекции.',
      icon: Calendar,
      nextLabel: 'Открыть чат заказа',
      nextSection: defaultSection(role),
    };
  }

  if (sectionId.includes('notes')) {
    return {
      title: 'Заметки и рабочие договорённости',
      description:
        'Фиксируйте решения, задачи и важные уточнения рядом с заказом, не перенося их в сторонние сервисы.',
      icon: StickyNote,
      nextLabel: 'Открыть чат заказа',
      nextSection: defaultSection(role),
    };
  }

  if (sectionId.includes('article')) {
    return {
      title: 'Обсуждение артикула',
      description:
        'Обсуждайте материалы, изменения, образцы и согласования в контексте конкретного артикула.',
      icon: MessageSquare,
      nextLabel: 'Открыть чат заказа',
      nextSection: defaultSection(role),
    };
  }

  return {
    title: 'Коммуникации по заказу',
    description:
      'Чат, календарь, заметки и вложения собраны в одном контексте заказа и доступны обеим сторонам.',
    icon: MessageSquare,
    nextLabel: role === 'brand' ? 'Открыть календарь' : 'Открыть календарь заказа',
    nextSection: role === 'brand' ? 'brand-cm-calendar' : 'shop-cm-calendar-order',
  };
}

/** Brand/Shop Communications: единый section-aware workspace поверх canonical comms engine. */
export function BaselineCommunicationsCabinetWorkspace({
  role,
  collectionId,
  sectionId,
  orderId,
  articleId,
}: Props) {
  const allowed = role === 'brand' ? BRAND_SECTIONS : SHOP_SECTIONS;

  if (!allowed.has(sectionId)) {
    return (
      <PlatformCoreEmptyState
        title="Раздел коммуникаций не найден"
        reason="Ссылка устарела или вкладка больше не входит в рабочий контур Communications."
        nextActionLabel="Открыть чат заказа"
        nextActionHref={roleCoreCabinetHref({
          roleId: role,
          pillarId: 'comms',
          collectionId,
          sectionId: defaultSection(role),
          orderId,
          articleId,
        })}
      />
    );
  }

  const meta = sectionMeta(role, sectionId);
  const Icon = meta.icon;
  const nextHref = roleCoreCabinetHref({
    roleId: role,
    pillarId: 'comms',
    collectionId,
    sectionId: meta.nextSection,
    orderId,
    articleId,
  });

  return (
    <div data-testid={`${role}-communications-workspace`} className="min-w-0 space-y-2.5">
      <header className="border-border-subtle flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            <h1 className="truncate text-[15px] font-semibold text-text-primary">{meta.title}</h1>
          </div>
          <p className="mt-0.5 max-w-3xl text-[12px] leading-5 text-text-secondary">
            {meta.description}
          </p>
        </div>
        <Link
          href={nextHref}
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border-subtle px-2.5 text-[11px] font-medium text-text-primary transition-colors hover:bg-bg-surface2"
        >
          {meta.nextLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </header>

      <CommsPillarCardBaseline variant={role} compact={false} minimalChrome />
    </div>
  );
}
