import { ROUTES } from '@/lib/routes';

/** Wave XF · brand dev tasks Kanban ↔ calendar UI (GET/POST `/api/brand/tasks`). */

export const BRAND_DEV_TASKS_KANBAN_API = '/api/brand/tasks';

export const BRAND_DEV_TASKS_KANBAN_TITLE_RU = 'Kanban задач разработки';
export const BRAND_DEV_TASKS_KANBAN_PG_BADGE_RU = 'PostgreSQL';
export const BRAND_DEV_TASKS_KANBAN_PG_UNAVAILABLE_RU = 'PG недоступен';
export const BRAND_DEV_TASKS_KANBAN_SAVING_RU = 'Сохранение…';
export const BRAND_DEV_TASKS_KANBAN_LOADING_RU = 'Загрузка Kanban…';
export const BRAND_DEV_TASKS_KANBAN_ADD_BTN_RU = '+ Задача';
export const BRAND_DEV_TASKS_KANBAN_ALL_TASKS_LINK_RU = 'Все задачи';
export const BRAND_DEV_TASKS_KANBAN_CALENDAR_LINK_RU = 'Календарь задач';

export const BRAND_DEV_GREENFIELD_MONETIZATION_LABEL_RU = 'Сегмент монетизации · PG';
export const BRAND_DEV_GREENFIELD_BUYER_BADGE_RU = 'Новый покупатель';
export const BRAND_DEV_GREENFIELD_LOADING_RU = 'Загрузка CRM-сегмента из PG…';
export const BRAND_DEV_GREENFIELD_UNAVAILABLE_RU =
  'CRM-сегмент greenfield недоступен — назначьте через brand CRM.';

export const BRAND_DEV_GREENFIELD_CRM_API = '/api/brand/b2b/shop-buyer-crm-assign';

export function brandDevTasksKanbanPeerHref(collectionId: string): string {
  return `${ROUTES.brand.calendar}?collection=${encodeURIComponent(collectionId)}#brand-dev-tasks-kanban-panel`;
}

export function brandDevTasksKanbanCalendarHref(collectionId: string): string {
  return `${ROUTES.brand.calendar}?collection=${encodeURIComponent(collectionId)}&layers=tasks#brand-dev-tasks-kanban-panel`;
}

export function brandDevTasksKanbanAllTasksHref(): string {
  return ROUTES.brand.tasks;
}
