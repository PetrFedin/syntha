'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const overviewSections = [
  {
    title: 'Гардероб и избранное',
    items: [
      { href: ROUTES.client.wardrobe, label: 'Мой гардероб', desc: 'Ваши вещи' },
      { href: ROUTES.client.wishlist, label: 'Избранное', desc: 'Список желаний' },
    ],
  },
  {
    title: 'Покупки',
    items: [
      { href: ROUTES.client.catalog, label: 'Каталог', desc: 'Товары' },
      { href: ROUTES.client.tryBeforeYouBuy, label: 'Try Before Buy', desc: 'Примерка' },
      { href: ROUTES.client.giftRegistry, label: 'Реестр подарков', desc: 'Подарки' },
      { href: ROUTES.client.scanner, label: 'Сканер', desc: 'Сканирование' },
    ],
  },
  {
    title: 'Открытия и персонализация',
    items: [
      { href: ROUTES.client.visualSearch, label: 'Визуальный поиск', desc: 'Похожее по фото' },
      { href: ROUTES.client.capsules, label: 'Капсулы / луки', desc: '3 вещи = образ' },
      { href: ROUTES.client.forYou, label: 'Для вас', desc: 'Лента без спама' },
      { href: ROUTES.client.colorStudio, label: 'Цвет и сочетания', desc: 'Палитра к товару' },
      { href: ROUTES.client.fitAdvisor, label: 'Посадка и размер', desc: 'SKU + ваш размер' },
      { href: ROUTES.client.outfitBuilder, label: 'Конструктор образа', desc: 'Слоты и пробелы' },
      {
        href: ROUTES.client.sustainabilityExplorer,
        label: 'Eco-каталог',
        desc: 'Скоринг сигналов',
      },
      { href: ROUTES.client.inspirationBoard, label: 'Доска вдохновения', desc: 'Пины и JSON' },
      { href: ROUTES.client.sizeCompare, label: 'Сравнение SKU', desc: 'Два артикула' },
      { href: ROUTES.client.seasonAtlas, label: 'Сезонный атлас', desc: 'SS/FW, carryover' },
      { href: ROUTES.client.categoryAtlas, label: 'Атлас категорий', desc: 'Дерево из PIM-полей' },
      { href: ROUTES.client.priceWatch, label: 'Слежение за ценой', desc: 'Локально в браузере' },
      { href: ROUTES.client.sizeConverter, label: 'Конвертер размеров', desc: 'EU / US / UK' },
      { href: ROUTES.client.skuAlternatives, label: 'Похожие SKU', desc: 'Замены при OOS' },
      { href: ROUTES.client.styleQuiz, label: 'Квиз стиля', desc: 'Профиль → «Для вас»' },
      { href: ROUTES.client.dutyEstimate, label: 'Пошлина (демо)', desc: 'Импорт одежды' },
      { href: ROUTES.client.careSymbols, label: 'Пиктограммы ухода', desc: 'Справочник символов' },
      { href: ROUTES.client.waitlist, label: 'Лист ожидания', desc: 'Размеры OOS' },
      { href: ROUTES.client.fitProfile, label: 'Мой Fit Profile', desc: 'Авто-подбор размера' },
    ],
  },
  {
    title: 'Заказы и возвраты',
    items: [
      { href: ROUTES.client.orders, label: 'Мои заказы', desc: 'История' },
      { href: ROUTES.client.returns, label: 'Возвраты', desc: 'Возврат' },
      { href: ROUTES.client.passport, label: 'Паспорта вещей', desc: 'Digital Passport' },
    ],
  },
  {
    title: 'Аккаунт',
    items: [
      { href: ROUTES.client.profile, label: 'Профиль', desc: 'Настройки' },
      { href: '/wallet', label: 'Кошелёк Syntha', desc: 'Баланс' },
    ],
  },
];

export default function ClientHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-text-secondary mb-1 text-[11px] font-black uppercase tracking-[0.2em]">
          Обзор
        </h2>
        <p className="text-text-primary text-sm">
          Wardrobe, Wishlist, заказы и возвраты. Используйте навигацию слева для перехода в разделы.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {overviewSections.map((section) => (
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
                      <span className="group-hover:text-accent-primary transition-colors">
                        {item.label}
                      </span>
                      <p className="text-text-muted mt-0.5 text-[9px] font-normal normal-case tracking-normal">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowUpRight className="text-text-muted group-hover:text-accent-primary h-3 w-3 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
