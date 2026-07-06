'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { usePlatformCoreEmbeddedWorkspace } from '@/components/platform/PlatformCoreEmbeddedWorkspaceContext';
import { resolveCabinetPageMaxWidth } from '@/lib/cabinet-core-mode';
import { cn } from '@/lib/utils';

const MAX_WIDTH_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  /** Широкие сетки (напр. staff / дашборды) — ~1600px. */
  screen: 'max-w-[1600px]',
  full: 'max-w-none',
} as const;

export type CabinetPageContentMaxWidth = keyof typeof MAX_WIDTH_CLASS;

type CabinetPageContentProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Ширина колонки контента; горизонтальные inset даёт `CabinetHubMain` (`px-3 lg:px-4`), без лишнего `container`/`px-4`. */
  maxWidth?: CabinetPageContentMaxWidth;
  children: ReactNode;
};

/**
 * Единая оболочка страницы внутри кабинетов на базе `CabinetHubMain` (клиент, магазин, админ и т.д.).
 * Заменяет разрозненные `container mx-auto max-w-* px-4 py-6`, которые дублировали отступы и расходились по вертикали.
 */
export function CabinetPageContent({
  maxWidth = '4xl',
  className,
  children,
  ...rest
}: CabinetPageContentProps) {
  const embeddedWorkspace = usePlatformCoreEmbeddedWorkspace();
  if (embeddedWorkspace) {
    return (
      <div className={cn('min-w-0 space-y-4', className)} {...rest}>
        {children}
      </div>
    );
  }
  const resolved = resolveCabinetPageMaxWidth(maxWidth);
  const mw = MAX_WIDTH_CLASS[resolved];
  return (
    <div
      className={cn('w-full space-y-6 pb-20 pt-1', mw, resolved !== 'full' && 'mx-auto', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
