'use client';

import Link from 'next/link';
import {
  getPlatformCoreDemo,
  getPlatformCoreCollectionLabel,
  isPlatformCoreEmptyChainDemo,
  PLATFORM_CORE_COLLECTION_PRESETS,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { W2_WORKSPACE_SHORT } from '@/lib/platform-core-canonical-labels';

type Props = {
  collectionId?: string;
};

/** Контекст коллекции на hub — якоря цепочки и переключатель коллекций. */
export function PlatformHubDemoContext({ collectionId: collectionIdProp }: Props) {
  const demo = getPlatformCoreDemo(collectionIdProp);
  const { collectionId, demoOrderId, demoArticleId, productionOrderId } = demo;
  const collectionLabel = getPlatformCoreCollectionLabel(collectionId);
  const emptyChain = isPlatformCoreEmptyChainDemo(demo);
  const goldenLabel = getPlatformCoreCollectionLabel(PLATFORM_CORE_DEMO.collectionId);

  const chainChips = [
    {
      id: 'collection',
      label: W2_WORKSPACE_SHORT,
      title: `Столп 1 · разработка · ${collectionLabel}`,
      href: `/brand/production/workshop2?w2col=${collectionId}`,
    },
    {
      id: 'article',
      label: demoArticleId,
      title: `Столп 1 · артикул · ${collectionLabel}`,
      href: `/factory/production/dossier/${demoArticleId}`,
    },
    {
      id: 'order',
      label: demoOrderId,
      title: 'Столп 3 · оптовый заказ магазина',
      href: `/shop/b2b/orders/${demoOrderId}`,
    },
    {
      id: 'po',
      label: productionOrderId,
      title: 'Столп 4 · производственный заказ',
      href: '/factory/production#handoff-queue',
    },
  ] as const;

  const activePresets = PLATFORM_CORE_COLLECTION_PRESETS.filter((p) => p.available);

  return (
    <div className="flex flex-col gap-2">
      {activePresets.length > 0 ? (
        <nav
          data-testid="platform-core-hub-collection-switcher"
          aria-label="Коллекции"
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
            Коллекция
          </span>
          {activePresets.map((preset) => {
            const active = preset.id === collectionId;
            return (
              <Link
                key={preset.id}
                href={`/platform?collection=${preset.id}`}
                title={preset.label}
                data-testid={`platform-core-hub-collection-${preset.id}`}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'bg-accent-primary/15 text-accent-primary border-accent-primary/30 rounded-md border px-2 py-1 text-[10px] font-semibold'
                    : 'bg-bg-surface2 text-text-primary hover:bg-accent-primary/10 hover:text-accent-primary rounded-md border border-transparent px-2 py-1 text-[10px] font-semibold transition-colors'
                }
              >
                {preset.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
      {emptyChain ? (
        <p
          data-testid="platform-core-hub-demo-empty-hint"
          className="text-text-muted text-xs leading-relaxed"
        >
          Нет заказа и артикула — пустая коллекция для сравнения с{' '}
          <Link
            href={`/platform?collection=${PLATFORM_CORE_DEMO.collectionId}`}
            className="text-accent-primary font-medium underline"
          >
            {goldenLabel}
          </Link>
          .
        </p>
      ) : (
        <nav
          data-testid="platform-core-hub-demo-context"
          aria-label={`Контекст цепочки · ${collectionLabel}`}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">
            Цепочка
          </span>
          {chainChips.map((chip) => (
            <Link
              key={chip.id}
              href={chip.href}
              title={chip.title}
              data-testid={`platform-core-hub-demo-${chip.id}`}
              className="bg-bg-surface2 text-text-primary hover:bg-accent-primary/10 hover:text-accent-primary rounded-md border border-transparent px-2 py-1 text-[10px] font-semibold transition-colors"
            >
              {chip.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
