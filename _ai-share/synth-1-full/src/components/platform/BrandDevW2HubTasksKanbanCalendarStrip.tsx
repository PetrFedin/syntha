'use client';

import Link from 'next/link';
import { BrandDevTasksKanbanMiniPanel } from '@/components/platform/BrandDevTasksKanbanMiniPanel';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import {
  brandDevTasksKanbanAllTasksHref,
  brandDevTasksKanbanCalendarHref,
  BRAND_DEV_TASKS_KANBAN_ALL_TASKS_LINK_RU,
  BRAND_DEV_TASKS_KANBAN_CALENDAR_LINK_RU,
} from '@/lib/platform-core-ports/platform/brand-dev-tasks-kanban-calendar';

type Props = {
  collectionId: string;
};

/** Wave XF · W2 hub: compact Kanban + calendar peer (без дубля user-task strip). */
export function BrandDevW2HubTasksKanbanCalendarStrip({ collectionId }: Props) {
  const calendarHref = brandDevTasksKanbanCalendarHref(collectionId);
  const allTasksHref = brandDevTasksKanbanAllTasksHref();

  return (
    <div className="space-y-1.5" data-testid="brand-dev-w2-hub-tasks-kanban-strip">
      <BrandDevTasksKanbanMiniPanel collectionId={collectionId} variant="compact" />
      <div className={hubGadget.goldenPath} data-testid="brand-dev-w2-hub-tasks-kanban-peer">
        <Link
          href={calendarHref}
          data-testid="brand-dev-w2-hub-tasks-calendar-link"
          className={hubGadget.goldenLink}
        >
          {BRAND_DEV_TASKS_KANBAN_CALENDAR_LINK_RU}
        </Link>
        <span className={hubGadget.goldenSep} aria-hidden>
          ·
        </span>
        <Link
          href={allTasksHref}
          data-testid="brand-dev-w2-hub-tasks-all-link"
          className={hubGadget.goldenLink}
        >
          {BRAND_DEV_TASKS_KANBAN_ALL_TASKS_LINK_RU}
        </Link>
      </div>
    </div>
  );
}
