'use client';

import { shouldUseLocalStorageClientFallbackInCore } from '@/lib/production/workshop2-pg-read-path-policy';
import type { BrandTaskRecord } from './port';

/** PG-first Kanban в Platform Core; localStorage только вне core mode. */
export const BRAND_TASKS_KANBAN_STORAGE_KEY = 'brand_tasks_kanban_v1';

const STORAGE_KEY = BRAND_TASKS_KANBAN_STORAGE_KEY;

const SEED: BrandTaskRecord[] = [
  {
    id: 'seed-1',
    title: 'Утвердить сэмпл SS26-001',
    status: 'todo',
    assignee: 'Анна',
    due: 'Сегодня',
    project: 'Production',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Согласовать договор с ЦУМ',
    status: 'in_progress',
    assignee: 'Максим',
    due: 'Завтра',
    project: 'B2B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Проверить остатки по AW26',
    status: 'in_progress',
    assignee: 'Ольга',
    due: 'Пт',
    project: 'Склад',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed-4',
    title: 'Подписать PO #4521',
    status: 'done',
    assignee: '—',
    due: '—',
    project: 'Production',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadBrandTasks(): BrandTaskRecord[] {
  if (!shouldUseLocalStorageClientFallbackInCore()) return [];
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    const p = JSON.parse(raw) as BrandTaskRecord[];
    if (!Array.isArray(p) || p.length === 0) return SEED;
    return p;
  } catch {
    return SEED;
  }
}

export function saveBrandTasks(tasks: BrandTaskRecord[]): void {
  if (!shouldUseLocalStorageClientFallbackInCore()) return;
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
