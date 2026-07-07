'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { RegistryPageHeader } from '@/components/design-system';

import { cn } from '@/lib/utils';
import { clientMeNuOrderShell } from '@/lib/ui/client-me-nuorder-shell';

export type UserCabinetLayoutProps = {
  title: string;
  /** Подзаголовок под H1 (как `leadPlain` у `RegistryPageHeader`). */
  description?: string;
  actions?: ReactNode;
  /** Текст последней крошки (по умолчанию совпадает с прежним UI). */
  breadcrumbCurrentLabel?: string;
  /** Скрыть крошки (редко нужно; например встроенный вид). */
  hideBreadcrumb?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Оболочка страницы `/client/me`: та же сетка, что у операционных реестров (`CabinetPageContent`),
 * плюс крошки и шапка в одном месте — без дублирования разметки в `page.tsx`.
 * Колонка до ~1320px и локальный слой `clientMeNuOrderShell` — плотный wholesale / NuOrder без смены глобальных токенов.
 * Горизонтальный inset не дублируем: его даёт `CabinetHubMain` (`hubMainColumn` в layout клиента).
 */
export function UserCabinetLayout({
  title,
  description,
  actions,
  breadcrumbCurrentLabel = 'Профиль',
  hideBreadcrumb = false,
  className,
  children,
}: UserCabinetLayoutProps) {
  return (
    <CabinetPageContent maxWidth="full" className={cn('space-y-3 px-0 py-2 pb-16', className)}>
      <div className={clientMeNuOrderShell.canvas} data-testid="client-me-nuorder-shell">
        <RegistryPageHeader
          className={clientMeNuOrderShell.headerRow}
          title={title}
          leadPlain={description}
          actions={actions}
          eyebrow={
            hideBreadcrumb ? undefined : (
              <nav
                aria-label="Breadcrumb"
                className="text-text-muted flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
              >
                <Link href="/" className="hover:text-accent-primary transition-colors">
                  Аккаунт
                </Link>
                <ChevronRight className="h-2.5 w-2.5 shrink-0 opacity-70" aria-hidden />
                <span className="text-accent-primary">{breadcrumbCurrentLabel}</span>
              </nav>
            )
          }
        />
        {children}
      </div>
    </CabinetPageContent>
  );
}
