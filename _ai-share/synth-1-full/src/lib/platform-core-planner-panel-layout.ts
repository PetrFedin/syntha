import type { PlannerPriority, PlatformCorePlannerItem } from '@/lib/platform-core-planner';

export const PLANNER_PANEL_PRIORITIES: PlannerPriority[] = ['P0', 'P1', 'P2'];

export const PLANNER_PRIORITY_RANK: Record<PlannerPriority, number> = { P0: 0, P1: 1, P2: 2 };

export const PLANNER_STATUS_RANK: Record<NonNullable<PlatformCorePlannerItem['status']>, number> = {
  open: 0,
  in_progress: 1,
  done: 2,
};

export function sortPlannerItemsByPriorityThenStatus<
  T extends {
    priority: PlannerPriority;
    status?: PlatformCorePlannerItem['status'];
    title: string;
  },
>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      PLANNER_PRIORITY_RANK[a.priority] - PLANNER_PRIORITY_RANK[b.priority] ||
      PLANNER_STATUS_RANK[a.status ?? 'open'] - PLANNER_STATUS_RANK[b.status ?? 'open'] ||
      a.title.localeCompare(b.title, 'ru')
  );
}

export const PLANNER_PRIORITY_BORDER: Record<PlannerPriority, string> = {
  P0: 'border-l-red-500',
  P1: 'border-l-amber-500',
  P2: 'border-l-slate-300',
};

export const PLANNER_STATUS_DOT = {
  open: 'bg-slate-300',
  in_progress: 'bg-blue-500',
  done: 'bg-emerald-500',
} as const;
