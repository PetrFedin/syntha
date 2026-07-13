'use client';

import Link from 'next/link';
import { Layers3, MessageSquare, Shirt } from 'lucide-react';
import { roleCoreCabinetHref } from '@/lib/platform-core-cabinet-workspace';
import { cn } from '@/lib/utils';

type Role = 'brand' | 'shop';
type Entity = 'collection' | 'order' | 'article';

type Props = {
  role: Role;
  activeEntity: Entity;
  collectionId: string;
  orderId?: string | null;
  articleId?: string | null;
};

function sectionId(role: Role, entity: Entity): string {
  if (entity === 'collection') return `${role}-cm-collection-chat`;
  if (entity === 'article') return `${role}-cm-article-chat`;
  return `${role}-cm-order-chat`;
}

export function CommsEntitySwitcher({
  role,
  activeEntity,
  collectionId,
  orderId,
  articleId,
}: Props) {
  const entities: Array<{
    id: Entity;
    label: string;
    icon: typeof Layers3;
    enabled: boolean;
  }> = [
    { id: 'collection', label: 'Коллекция', icon: Layers3, enabled: true },
    { id: 'order', label: 'Заказ', icon: MessageSquare, enabled: Boolean(orderId?.trim()) },
    { id: 'article', label: 'Артикул', icon: Shirt, enabled: Boolean(articleId?.trim()) },
  ];

  return (
    <nav
      className="flex flex-wrap gap-0.5 rounded-md border border-border-subtle bg-bg-surface p-0.5"
      aria-label="Контекст коммуникаций"
      data-testid="comms-entity-switcher"
    >
      {entities.map((entity) => {
        const Icon = entity.icon;
        if (!entity.enabled) {
          return (
            <span
              key={entity.id}
              className="inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-[11px] font-medium text-text-muted/50"
              aria-disabled="true"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {entity.label}
            </span>
          );
        }

        return (
          <Link
            key={entity.id}
            href={roleCoreCabinetHref({
              roleId: role,
              pillarId: 'comms',
              collectionId,
              sectionId: sectionId(role, entity.id),
              orderId,
              articleId,
            })}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-[11px] font-medium transition-colors',
              activeEntity === entity.id
                ? 'bg-accent-primary/10 text-text-primary ring-1 ring-accent-primary/20'
                : 'text-text-secondary hover:bg-bg-surface2'
            )}
            data-testid={`comms-entity-${entity.id}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {entity.label}
          </Link>
        );
      })}
    </nav>
  );
}
