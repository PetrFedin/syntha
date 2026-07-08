'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { getBrandSectionMeta } from '@/lib/data/brand-navigation';
import { useBrandSectionActions } from '@/providers/brand-section-actions';
import { shouldSuppressCabinetHubLayoutChrome } from '@/lib/platform-core-ui-surfaces';

/**
 * Единый блок заголовка раздела: breadcrumb + иконка + название + описание + кнопки справа.
 * Устраняет дублирование SectionInfoCard и короткого пути.
 */
export function BrandSectionHeaderBlock() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { actions: contextActions } = useBrandSectionActions();

  if (shouldSuppressCabinetHubLayoutChrome()) return null;
  const meta = getBrandSectionMeta(pathname || '/brand/profile', searchParams?.toString());

  const isBrandHome =
    pathname === '/brand' ||
    pathname === '/brand/' ||
    pathname === '/brand/profile' ||
    pathname === '/brand/profile/';
  const hasOwnLayout = pathname?.startsWith('/brand/academy');

  if (!meta || isBrandHome || hasOwnLayout) return null;

  const breadcrumbItems: { label: string; href?: string }[] = [
    { label: 'Бренд', href: '/brand/profile' },
  ];
  // Показываем группу, если она отличается от раздела (напр. Устойчивость → ESG Мониторинг)
  const showGroup = meta.groupLabel && meta.groupLabel !== meta.sectionLabel;
  if (showGroup) {
    breadcrumbItems.push({ label: meta.groupLabel, href: meta.groupHref });
  }
  breadcrumbItems.push({
    label: meta.sectionLabel,
    href: meta.sectionHref !== meta.groupHref ? meta.sectionHref : undefined,
  });
  if (meta.subsectionLabel) {
    breadcrumbItems.push({ label: meta.subsectionLabel });
  }

  const defaultActions = meta.quickActions?.length
    ? meta.quickActions.map((qa) => {
        const Icon = qa.icon;
        return (
          <Button key={qa.href} variant="outline" size="sm" className="h-7 text-[9px]" asChild>
            <Link href={qa.href}>
              <Icon className="mr-1 h-3 w-3" /> {qa.label}
            </Link>
          </Button>
        );
      })
    : null;
  const actions = contextActions ?? (defaultActions?.length ? defaultActions : null);

  return (
    <div className="border-border-subtle mb-3 space-y-1.5 border-t pt-2">
      <Breadcrumb items={breadcrumbItems} className="gap-0.5 text-[11px] leading-tight" />
      <SectionHeader
        compact
        icon={meta.icon}
        title={meta.subsectionLabel ?? meta.sectionLabel}
        description={meta.description}
        iconColor={meta.iconColor ?? 'indigo'}
        actions={actions ? <div className="flex flex-wrap gap-1">{actions}</div> : undefined}
      />
    </div>
  );
}
