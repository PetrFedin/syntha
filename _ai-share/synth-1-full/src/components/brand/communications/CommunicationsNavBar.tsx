'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { getDefaultUpcomingDeadlines } from '@/lib/data/calendar-events';
import { RECENT_CHATS_PREVIEW } from '@/lib/data/communications-data';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { usePgCommunicationsUnread } from '@/lib/communications/use-pg-communications-unread';

const COMM_LINKS = [
  { href: '/brand/messages', label: 'Сообщения', icon: MessageSquare },
  { href: '/brand/calendar', label: 'Календарь', icon: Calendar },
] as const;

function pathMatchesCommHub(pathname: string | null, href: string): boolean {
  const base = (pathname || '').split('?')[0].replace(/\/$/, '') || '/';
  const target = href.replace(/\/$/, '') || '/';
  return base === target || base.startsWith(`${target}/`);
}

const RECENT_UNREAD = RECENT_CHATS_PREVIEW.reduce((s, c) => s + (c.unread ?? 0), 0);

export function CommunicationsNavBar({
  currentPath,
  unreadCount,
}: {
  currentPath: string;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const pgUnread = usePgCommunicationsUnread('brand', !isPlatformCoreMode());
  if (isPlatformCoreMode()) return null;
  const deadlines = getDefaultUpcomingDeadlines({ limit: 20 });
  const overdueCount = deadlines.filter((d) => d.isOverdue).length;
  const unread = unreadCount ?? (pgUnread.totalUnread > 0 ? pgUnread.totalUnread : RECENT_UNREAD);

  return (
    <>
      {/* cabinetSurface v1 */}
      <div
        className={cn(
          cabinetSurface.groupTabList,
          'h-auto min-h-10 w-fit flex-wrap items-center gap-1'
        )}
      >
        {COMM_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathMatchesCommHub(pathname ?? currentPath, href);
          const badge =
            href === '/brand/messages' && unread > 0
              ? unread
              : href === '/brand/calendar' && overdueCount > 0
                ? overdueCount
                : null;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all',
                isActive
                  ? 'text-text-primary border-border-default border bg-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/60'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge !== null && (
                <span
                  className={cn(
                    'ml-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[8px] font-black',
                    href === '/brand/calendar' && overdueCount > 0
                      ? 'bg-rose-500 text-white'
                      : 'bg-accent-primary text-white'
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
