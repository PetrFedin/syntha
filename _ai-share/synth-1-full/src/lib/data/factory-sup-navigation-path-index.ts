/**
 * Лёгкий path-index для breadcrumbs — без lucide / nav groups в layout chunk.
 * Синхронизация: npm run cabinet-hub-nav:sync-path-index
 */

import type { CabinetNavPathCandidate } from '@/lib/ui/cabinet-nav-active';

export const factorySupNavPathCandidates: readonly CabinetNavPathCandidate[] = [
  {
    href: '/factory?role=supplier',
    label: 'Дашборд',
  },
  {
    href: '/factory/staff',
    label: 'Команда',
  },
  {
    href: '/brand/calendar?layers=tasks,orders,logistics',
    label: 'Календарь',
  },
  {
    href: '/brand/messages',
    label: 'Сообщения',
  },
  {
    href: '/brand/suppliers',
    label: 'Партнёры',
  },
  {
    href: '/factory/production/catalog',
    label: 'Каталог материалов',
  },
  {
    href: '/factory/production/materials',
    label: 'BOM · спецификация',
  },
  {
    href: '/factory/production/materials',
    label: 'BOM из досье',
  },
  {
    href: '/factory/production/catalog',
    label: 'Каталог материалов',
  },
  {
    href: '/factory/production/materials',
    label: 'Закупка под PO',
  },
  {
    href: '/brand/logistics',
    label: 'Логистика и склад',
  },
  {
    href: '/brand/compliance',
    label: 'Соответствие требованиям',
  },
  {
    href: '/brand/analytics',
    label: 'Аналитика',
  },
] as const;
