'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PLATFORM_CORE_B2B_BASE,
  PLATFORM_CORE_B2B_MARKETROOM_HREF,
  PLATFORM_CORE_B2B_PARTNERS_HREF,
  resolvePlatformCoreB2bNavView,
} from '@/lib/platform-core-mode-surfaces';
import {
  PLATFORM_CORE_HEADER_ICON_BTN,
  platformCoreHeaderHubTabClass,
} from '@/lib/platform-core-header-controls';

const BUTTONS = [
  {
    id: 'hub' as const,
    href: PLATFORM_CORE_B2B_BASE,
    label: 'Обзор',
    testId: 'platform-core-b2b-view-hub',
  },
  {
    id: 'partners' as const,
    href: PLATFORM_CORE_B2B_PARTNERS_HREF,
    label: 'Партнёры',
    testId: 'platform-core-b2b-view-partners',
  },
  {
    id: 'marketroom' as const,
    href: PLATFORM_CORE_B2B_MARKETROOM_HREF,
    label: 'Маркетрум',
    testId: 'platform-core-b2b-view-marketroom',
  },
];

function activeLabel(view: ReturnType<typeof resolvePlatformCoreB2bNavView>): string {
  if (view === 'marketroom') return 'Маркетрум';
  if (view === 'partners') return 'Партнёры';
  return 'Обзор';
}

/** B2B hub tabs — как «Продукт · Аудит · План» в B2C, но маршруты partners / marketroom. */
export function PlatformCoreB2bViewToggle() {
  const pathname = usePathname() ?? '';
  const activeView = resolvePlatformCoreB2bNavView(pathname);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-testid="platform-core-b2b-view-menu"
          className={cn(
            PLATFORM_CORE_HEADER_ICON_BTN,
            'btn-tab-active border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 sm:hidden'
          )}
          aria-label={`B2B раздел: ${activeLabel(activeView)}. Открыть список`}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="min-w-[10rem] p-1">
          {BUTTONS.map(({ href, label, testId, id }) => (
            <DropdownMenuItem key={id} asChild className="cursor-pointer p-0">
              <Link
                href={href}
                data-testid={testId}
                className={cn(
                  'block w-full rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-wide',
                  activeView === id && 'bg-slate-100'
                )}
              >
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <nav
        data-testid="platform-core-b2b-view-toggle"
        className="hidden shrink-0 flex-nowrap items-center gap-1 sm:flex"
        aria-label="B2B: Обзор · Партнёры · Маркетрум"
      >
        {BUTTONS.map(({ href, label, testId, id }) => {
          const active = activeView === id;
          return (
            <Link
              key={id}
              href={href}
              data-testid={testId}
              aria-current={active ? 'page' : undefined}
              className={cn(platformCoreHeaderHubTabClass(active), 'shrink-0')}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
