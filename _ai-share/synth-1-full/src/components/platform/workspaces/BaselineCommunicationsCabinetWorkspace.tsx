'use client';

import { Calendar, MessageSquare, StickyNote } from 'lucide-react';
import { CommsEntitySwitcher } from '@/components/platform/CommsEntitySwitcher';
import { CommsPillarCardBaseline } from '@/components/platform/pillars/CommsPillarCardBaseline';
import { PlatformCoreEmptyState } from '@/components/platform/shared';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';

type Role = 'brand' | 'shop';
type Entity = 'collection' | 'order' | 'article';

type Props = {
  role: Role;
  collectionId: string;
  sectionId: string;
  orderId?: string | null;
  articleId?: string | null;
};

const BRAND_SECTIONS = new Set([
  'brand-cm-collection-chat',
  'brand-cm-order-chat',
  'brand-cm-article-chat',
  'brand-cm-calendar',
  'brand-cm-notes',
]);

const SHOP_SECTIONS = new Set([
  'shop-cm-collection-chat',
  'shop-cm-order-chat',
  'shop-cm-article-chat',
  'shop-cm-calendar-order',
]);

function defaultSection(role: Role): string {
  return role === 'brand' ? 'brand-cm-order-chat' : 'shop-cm-order-chat';
}

function activeEntity(sectionId: string): Entity {
  if (sectionId.includes('collection')) return 'collection';
  if (sectionId.includes('article')) return 'article';
  return 'order';
}

function sectionMeta(sectionId: string) {
  if (sectionId.includes('calendar')) {
    return {
      title: 'Календарь и контроль сроков',
      description:
        'Планируйте встречи, дедлайны, окна поставки и действия в контексте выбранной сущности.',
      icon: Calendar,
    };
  }

  if (sectionId.includes('notes')) {
    return {
      title: 'Заметки и рабочие договорённости',
      description:
        'Фиксируйте решения, задачи и важные уточнения рядом с коллекцией, заказом или артикулом.',
      icon: StickyNote,
    };
  }

  if (sectionId.includes('collection')) {
    return {
      title: 'Обсуждение коллекции',
      description:
        'Обсуждайте запуск, публикацию, ассортимент и коммерческие условия всей коллекции в одном треде.',
      icon: MessageSquare,
    };
  }

  if (sectionId.includes('article')) {
    return {
      title: 'Обсуждение артикула',
      description:
        'Обсуждайте материалы, изменения, образцы и согласования в контексте конкретного артикула.',
      icon: MessageSquare,
    };
  }

  return {
    title: 'Коммуникации по заказу',
    description:
      'Чат, календарь, заметки и вложения собраны в одном контексте заказа и доступны обеим сторонам.',
    icon: MessageSquare,
  };
}

/** Brand/Shop Communications: единый entity-aware split workspace. */
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

  const meta = sectionMeta(sectionId);
  const Icon = meta.icon;

  return (
    <div data-testid={`${role}-communications-workspace`} className="min-w-0 space-y-2.5">
      <header className="border-border-subtle space-y-2 border-b pb-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
            <h1 className="truncate text-[15px] font-semibold text-text-primary">{meta.title}</h1>
          </div>
          <p className="mt-0.5 max-w-3xl text-[12px] leading-5 text-text-secondary">
            {meta.description}
          </p>
        </div>

        <CommsEntitySwitcher
          role={role}
          activeEntity={activeEntity(sectionId)}
          collectionId={collectionId}
          orderId={orderId}
          articleId={articleId}
        />
      </header>

      <CommsPillarCardBaseline variant={role} compact minimalChrome />
    </div>
  );
}
