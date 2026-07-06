'use client';

import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { PLATFORM_CORE_HUB_CARD, PLATFORM_CORE_HUB_CARD_ROLE } from '@/lib/platform-core-hub-carousel';
import { platformCoreHubLayout } from '@/lib/platform-core-hub-layout';
import { cn } from '@/lib/utils';

type Props = {
  testId: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  className?: string;
  id?: string;
  /** role — сетка 2×2; pillar — карусель 68vw */
  variant?: 'role' | 'pillar';
  selected?: boolean;
} & (
  | { as?: 'link'; href: string; onSelect?: never }
  | { as: 'button'; onSelect: () => void; href?: never }
);

function QuickCardBody({
  Icon,
  title,
  subtitle,
  showArrow,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  showArrow: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="bg-bg-surface2 text-text-primary inline-flex shrink-0 rounded-md p-0.5">
        <Icon className="h-3 w-3 md:h-2 md:w-2" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-text-primary line-clamp-1 text-[13px] font-semibold leading-tight md:text-sm">
          {title}
        </h3>
        <p className="text-text-secondary line-clamp-1 text-[11px] leading-snug">
          {subtitle}
        </p>
      </div>
      {showArrow ? (
        <ArrowRight
          className="text-text-muted group-hover:text-accent-primary h-3 w-3 shrink-0 transition-colors"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function PlatformCoreHubQuickCard({
  href,
  testId,
  icon: Icon,
  title,
  subtitle,
  className,
  id,
  variant = 'pillar',
  selected = false,
  as = 'link',
  onSelect,
}: Props) {
  const shell = cn(
    variant === 'role' ? PLATFORM_CORE_HUB_CARD_ROLE : PLATFORM_CORE_HUB_CARD,
    selected && 'border-accent-primary ring-1 ring-accent-primary/30',
    className
  );

  const innerClass = cn(
    'group flex w-full items-center rounded-md p-1 transition-colors hover:bg-accent-primary/5',
    platformCoreHubLayout.quickCardRow
  );

  if (as === 'button') {
    return (
      <button
        type="button"
        id={id}
        data-testid={testId}
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(shell, innerClass, 'text-left')}
      >
        <QuickCardBody Icon={Icon} title={title} subtitle={subtitle} showArrow={false} />
      </button>
    );
  }

  return (
    <div id={id} className={shell}>
      <Link href={href} data-testid={testId} className={innerClass}>
        <QuickCardBody Icon={Icon} title={title} subtitle={subtitle} showArrow />
      </Link>
    </div>
  );
}
