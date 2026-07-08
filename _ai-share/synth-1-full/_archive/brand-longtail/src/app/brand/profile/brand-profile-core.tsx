'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { RegistryPageShell } from '@/components/design-system';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import {
  getPlatformCoreCollectionLabel,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import {
  LINESHEETS_LABEL,
  SHOWROOM_BRAND_LABEL,
} from '@/lib/platform-core-canonical-labels';
import { WORKSHOP2_COL_PARAM } from '@/lib/production/workshop2-url';
import { ROUTES, brandB2bOrderHref, brandB2bOrdersCollectionRegistryHref } from '@/lib/routes';
import { useSpineActiveWholesaleOrderId } from '@/hooks/use-spine-active-wholesale-order-id';

const { collectionId } = PLATFORM_CORE_DEMO;

export function BrandProfileCorePage() {
  const { activeOrderId: spineOrderId } = useSpineActiveWholesaleOrderId({
    fallbackOrderId: '',
    resolveFrom: ['allocation', 'operational'],
    actorRole: 'brand',
  });
  const w2Fallback = PLATFORM_CORE_DEMO.demoOrderId.startsWith('__')
    ? ''
    : PLATFORM_CORE_DEMO.demoOrderId;
  const orderId = spineOrderId || w2Fallback;

  const sections = [
    {
      title: 'Столпы цепочки',
      items: [
        {
          href: ROUTES.brand.coreCabinet,
          label: 'Мой кабинет',
          desc: 'Пять столпов × четыре роли',
        },
        {
          href: `${ROUTES.brand.productionWorkshop2}?${WORKSHOP2_COL_PARAM}=${collectionId}`,
          label: 'Разработка артикулов',
          desc: 'Наброски, ТЗ и досье артикулов',
        },
        {
          href: '/brand/linesheets',
          label: LINESHEETS_LABEL,
          desc: 'Сборка коллекций из отработанных артикулов',
        },
        {
          href: ROUTES.brand.showroom,
          label: SHOWROOM_BRAND_LABEL,
          desc: 'Коллекции для оптовых партнёров',
        },
      ],
    },
    {
      title: 'Опт и производство',
      items: [
        ...(orderId
          ? [
              {
                href: brandB2bOrderHref(orderId),
                label: `Оптовый заказ · ${getPlatformCoreCollectionLabel(collectionId)}`,
                desc: 'Цепочка и передача в производство',
              },
            ]
          : []),
        {
          href: brandB2bOrdersCollectionRegistryHref(),
          label: 'Реестр оптовых заказов',
          desc: 'Живые данные из базы',
        },
        { href: ROUTES.factory.production, label: 'Очередь цеха', desc: 'Производственные заказы' },
      ],
    },
    {
      title: 'Связь',
      items: [
        { href: ROUTES.brand.messages, label: 'Сообщения', desc: 'Чат по заказу и артикулу' },
        {
          href: `${ROUTES.brand.calendar}?layers=tasks,orders,production`,
          label: 'Календарь',
          desc: 'Задачи и этапы цепочки',
        },
      ],
    },
  ];

  return (
    <RegistryPageShell>
      <div className="space-y-8 pb-16" data-testid="brand-profile-core-hub">
        <PlatformCoreListChrome highlightRole="brand" pillarId="development">
          <div className="grid gap-6 md:grid-cols-3">
            {sections.map((section) => (
              <div
                key={section.title}
                className="border-border-default rounded-lg border bg-white p-4 shadow-sm"
              >
                <h3 className="text-text-muted mb-3 text-[10px] font-black uppercase tracking-widest">
                  {section.title}
                </h3>
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-text-primary hover:bg-bg-surface2 group flex items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <div>
                          <span className="transition-colors group-hover:text-indigo-600">
                            {item.label}
                          </span>
                          <p className="text-text-muted mt-0.5 text-[9px] font-normal normal-case tracking-normal">
                            {item.desc}
                          </p>
                        </div>
                        <ArrowUpRight className="text-text-muted size-3 shrink-0 group-hover:text-indigo-500" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </PlatformCoreListChrome>
      </div>
    </RegistryPageShell>
  );
}
