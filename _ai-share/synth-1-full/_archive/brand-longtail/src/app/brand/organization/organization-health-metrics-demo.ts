/**
 * Демо-метрики здоровья и шаги онбординга для хаба «Организация» до полной подстановки из API.
 * Тип метрики: `@/lib/brand/organization-types` → `HealthMetric`.
 */

import type { HealthMetric } from '@/lib/brand/organization-types';

export type { HealthMetric } from '@/lib/brand/organization-types';

export type OnboardingStep = {
  id: string;
  order: number;
  label: string;
  href: string;
  /** Зачем нужен шаг */
  why: string;
  /** Что блокируется без него */
  blocksWithout: string;
  /** Что проверить / заполнить */
  checkItems: string[];
  /** Привязка к метрике здоровья для вычисления done (score >= 80) */
  healthMetricKey: 'profile' | 'team' | 'integrations' | 'compliance' | 'subscription';
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    order: 1,
    label: 'Профиль и юр.данные',
    href: '/brand',
    why: 'Для договоров, счетов и отчётов. Без юр.данных невозможны B2B-сделки.',
    blocksWithout: 'Счета, акты, участие в тендерах',
    checkItems: ['ИНН, КПП', 'Юр. наименование', 'Контакты', 'Brand DNA'],
    healthMetricKey: 'profile',
  },
  {
    id: 'team',
    order: 2,
    label: 'Команда',
    href: '/brand/team',
    why: 'Для коллаборации, задач и контроля доступа. Минимум — ответственный и исполнитель.',
    blocksWithout: 'Назначение задач, доступ к разделам',
    checkItems: ['Минимум 1 участник', 'Роли и права'],
    healthMetricKey: 'team',
  },
  {
    id: 'integrations',
    order: 3,
    label: 'Интеграции',
    href: '/brand/integrations',
    why: 'Синхронизация с ERP, маркетплейсами, логистикой. Без интеграций — ручной ввод.',
    blocksWithout: 'Автосинхрон остатков, заказы с WB/Ozon',
    checkItems: ['1С или ERP', 'ЭДО Diadoc', 'Маркетплейсы при необходимости'],
    healthMetricKey: 'integrations',
  },
  {
    id: 'compliance',
    order: 4,
    label: 'ЭДО и маркировка',
    href: '/brand/compliance',
    why: 'Честный ЗНАК и ЭДО обязательны для легальной торговли товарами под маркировкой.',
    blocksWithout: 'Приём и отгрузка маркированных товаров',
    checkItems: ['ЭДО подключено', 'Синхронизация КИЗ', 'Нет просроченных УПД'],
    healthMetricKey: 'compliance',
  },
  {
    id: 'subscription',
    order: 5,
    label: 'Подписка',
    href: '/brand/subscription',
    why: 'Активный тариф даёт доступ к функциям и лимитам.',
    blocksWithout: 'Доступ к премиум-функциям',
    checkItems: ['Тариф активен', 'Оплата до даты'],
    healthMetricKey: 'subscription',
  },
];

/** Соответствие label метрики здоровья → ключ шага онбординга */
export const HEALTH_LABEL_TO_ONBOARDING_KEY: Record<string, OnboardingStep['healthMetricKey']> = {
  'Полнота профиля': 'profile',
  'Активность команды': 'team',
  Интеграции: 'integrations',
  'ЭДО и маркировка': 'compliance',
  Подписка: 'subscription',
};

export const HEALTH_METRICS: HealthMetric[] = [
  {
    label: 'Полнота профиля',
    score: 92,
    color: 'bg-accent-primary',
    desc: 'Заполнены все обязательные поля',
    href: '/brand',
    trend: 2,
    status: 'ok',
    details: {
      lastCheck: '11.03.2025',
      checklist: ['Юр. наименование', 'ИНН', 'Контакты', 'Logo'],
      tips: 'Добавьте Brand DNA для 100%',
    },
  },
  {
    label: 'Безопасность',
    score: 88,
    color: 'bg-emerald-500',
    desc: '2FA активна, 0 уязвимостей',
    href: '/brand/security',
    trend: 0,
    status: 'ok',
    details: {
      lastCheck: '11.03.2025',
      checklist: ['2FA включена', 'API-ключи ротированы', '0 активных сессий с риском'],
    },
  },
  {
    label: 'Активность команды',
    score: 84,
    color: 'bg-blue-500',
    desc: '8 участников онлайн',
    href: '/brand/team',
    trend: 5,
    status: 'ok',
    details: {
      lastCheck: '11.03.2025',
      checklist: ['8/24 онлайн', '14 задач за неделю', '5 комментариев'],
    },
  },
  {
    label: 'Интеграции',
    score: 76,
    color: 'bg-amber-500',
    desc: '3 активных, 6 доступных',
    href: '/brand/integrations',
    trend: -2,
    status: 'warning',
    details: {
      lastCheck: '10.03.2025',
      checklist: ['1С: активна', 'Diadoc: активна', 'Маркетплейсы: 1/3'],
      tips: 'Подключите Wildberries и Ozon',
    },
  },
  {
    label: 'ЭДО и маркировка',
    score: 94,
    color: 'bg-emerald-500',
    desc: 'Честный ЗНАК, ЭДО настроены',
    href: '/brand/compliance',
    trend: 1,
    status: 'ok',
    details: {
      lastCheck: '11.03.2025',
      checklist: ['ЭДО Diadoc', 'КИЗ синхронизированы', 'Нет просроченных УПД'],
    },
  },
  {
    label: 'Подписка',
    score: 100,
    color: 'bg-emerald-500',
    desc: 'Elite активна до 01.06.2025',
    href: '/brand/subscription',
    trend: 0,
    status: 'ok',
    details: {
      lastCheck: '11.03.2025',
      checklist: ['План Elite', 'Оплата до 01.06.2025', 'Все лимиты в норме'],
    },
  },
  {
    label: 'Документы',
    score: 68,
    color: 'bg-amber-500',
    desc: '2 на подписи, 0 просроченных',
    href: '/brand/documents',
    trend: -4,
    status: 'warning',
    details: {
      lastCheck: '10.03.2025',
      checklist: ['Подписано: 94%', 'На подписи: 2', 'Просроченных: 0'],
      tips: 'Подпишите договор #4521',
    },
  },
  {
    label: 'Настройки',
    score: 78,
    color: 'bg-amber-500',
    desc: 'Конфигурация на 78%',
    href: '/brand/settings',
    trend: 3,
    status: 'warning',
    details: {
      lastCheck: '09.03.2025',
      checklist: ['Часовой пояс', 'Валюта', 'Языки', 'Webhooks частично'],
      tips: 'Настройте webhooks для уведомлений',
    },
  },
];
