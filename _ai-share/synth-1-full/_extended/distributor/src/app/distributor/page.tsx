'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { getShopCoreRetailerB2bQuickSections } from '@/lib/platform-core-nav-augment';

const overviewSections = [
  {
    title: 'Заказы',
    items: [
      { href: ROUTES.shop.b2bOrders, label: 'B2B Заказы', desc: 'Оптовые заказы' },
      { href: ROUTES.shop.b2bCreateOrder, label: 'Создать заказ', desc: 'По коллекции' },
      { href: ROUTES.shop.b2bQuickOrder, label: 'Быстрый заказ', desc: 'По артикулам' },
    ],
  },
  {
    title: 'Каталог и партнёры',
    items: [
      { href: ROUTES.shop.b2bCatalog, label: 'Каталог', desc: 'Закупки' },
      { href: ROUTES.shop.b2bPartners, label: 'Партнёры-бренды', desc: 'Мои бренды' },
      { href: ROUTES.shop.b2bTradeShows, label: 'Выставки', desc: 'Виртуальные выставки' },
    ],
  },
  {
    title: 'Финансы и логистика',
    items: [
      { href: ROUTES.shop.b2bFinance, label: 'Финансы', desc: 'Оплаты' },
      { href: ROUTES.shop.b2bBudget, label: 'OTB Бюджет', desc: 'Планирование' },
      { href: ROUTES.shop.b2bTracking, label: 'Карта поставок', desc: 'Отслеживание' },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      { href: ROUTES.shop.analytics, label: 'Аналитика', desc: 'Отчёты' },
      { href: ROUTES.shop.b2bAnalytics, label: 'Закупки B2B', desc: 'Метрики' },
    ],
  },
];

export default function DistributorHubPage() {
  const coreMode = isPlatformCoreMode();
  const sections = coreMode ? getShopCoreRetailerB2bQuickSections() : overviewSections;

  return (
    <CabinetPageContent maxWidth="full" className="space-y-6">
      <div>
        <h2 className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          Обзор
        </h2>
        <p className="text-sm text-slate-700">
          {coreMode
            ? 'Golden path опта: showroom, матрица и реестр B2B из PostgreSQL.'
            : 'Используйте навигацию слева для перехода в разделы. Ключевые направления:'}
        </p>
      </div>

      <div className={`grid gap-6 ${coreMode ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {section.title}
            </h3>
            <ul className="space-y-1.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <span className="transition-colors group-hover:text-amber-600">
                        {item.label}
                      </span>
                      <p className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-300 group-hover:text-amber-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </CabinetPageContent>
  );
}
