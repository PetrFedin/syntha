'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard } from '@/components/ui/stat-card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { BookOpen, GraduationCap, FileText, Store, UserCircle } from 'lucide-react';
import {
  getBrandKnowledgeArticles,
  getCollectionTrainings,
  getClientMaterials,
  getBrandCourses,
} from '@/lib/academy/brand-academy-data';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

const TABS = [
  {
    href: ROUTES.brand.academy,
    label: 'Курсы бренда',
    match: (p: string) => p === '/brand/academy' || p === '/brand/academy/',
  },
  {
    href: ROUTES.brand.academyTeam,
    label: 'Повышение квалификации',
    match: (p: string) => p.startsWith('/brand/academy/team'),
  },
  {
    href: ROUTES.brand.academyKnowledge,
    label: 'База знаний',
    match: (p: string) => p.startsWith('/brand/academy/knowledge'),
  },
  {
    href: ROUTES.brand.academyStores,
    label: 'Для магазинов',
    match: (p: string) =>
      p.startsWith('/brand/academy/stores') || p.startsWith('/brand/academy/collections'),
  },
  {
    href: ROUTES.brand.academyClients,
    label: 'Для клиентов',
    match: (p: string) => p.startsWith('/brand/academy/clients'),
  },
] as const;

const KPI_ITEMS = [
  {
    href: ROUTES.brand.academy,
    label: 'Курсов в процессе',
    getValue: (n: number) => String(n),
    icon: BookOpen,
  },
  {
    href: ROUTES.brand.academyTeam,
    label: 'Завершили обучение',
    getValue: (n: number) => String(n),
    icon: GraduationCap,
  },
  {
    href: ROUTES.brand.academyKnowledge,
    label: 'Статей в базе',
    getValue: (n: number) => String(n),
    icon: FileText,
  },
  {
    href: ROUTES.brand.academyStores,
    label: 'Тренингов для магазинов',
    getValue: (n: number) => String(n),
    icon: Store,
  },
  {
    href: ROUTES.brand.academyClients,
    label: 'Материалов для клиентов',
    getValue: (n: number) => String(n),
    icon: UserCircle,
  },
] as const;

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlatformShell =
    pathname.startsWith('/brand/academy/platform') ||
    pathname.startsWith('/brand/academy/organization-studio');
  const platformSwitcherActive = pathname.startsWith('/brand/academy/organization-studio')
    ? 'organization'
    : 'platform';
  const courses = getBrandCourses();
  const inProgressCount = courses.filter((c) => c.status === 'in_progress').length;
  const completedCount = courses.filter((c) => c.status === 'completed').length;
  const totalKnowledge = getBrandKnowledgeArticles().length;
  const totalTrainings = getCollectionTrainings().length;
  const totalClientMaterials = getClientMaterials().length;

  if (isPlatformShell) {
    const breadcrumbItems = pathname.startsWith('/brand/academy/organization-studio')
      ? [
          { label: 'Бренд', href: ROUTES.brand.home },
          { label: 'Академия платформы', href: ROUTES.brand.academyPlatform },
          { label: 'Студия организации' },
        ]
      : [{ label: 'Бренд', href: ROUTES.brand.home }, { label: 'Академия платформы' }];

    return (
      <CabinetPageContent maxWidth="5xl">
        <Breadcrumb items={breadcrumbItems} className="mb-2" />
        <SectionHeader
          icon={BookOpen}
          title="Академия платформы"
          description="Best practices, compliance, производство и ритейл. Курсы, траектории и база знаний для всех ролей."
          iconColor="indigo"
          actions={<AcademySegmentSwitcher active={platformSwitcherActive} />}
        />
        {children}
      </CabinetPageContent>
    );
  }

  const kpiValues = [
    inProgressCount,
    completedCount,
    totalKnowledge,
    totalTrainings,
    totalClientMaterials,
  ];
  const isNestedPage =
    pathname.includes('/courses/create') ||
    /^\/brand\/academy\/courses\/[^/]+$/.test(pathname) ||
    (pathname !== '/brand/academy/knowledge' && pathname.startsWith('/brand/academy/knowledge/'));

  return (
    <CabinetPageContent maxWidth="5xl">
      {!isNestedPage && (
        <Breadcrumb
          items={[{ label: 'Бренд', href: ROUTES.brand.home }, { label: 'Академия' }]}
          className="mb-2"
        />
      )}
      <SectionHeader
        icon={GraduationCap}
        title="Академия бренда"
        description="Курсы, база знаний и материалы для партнёров и магазинов."
        iconColor="indigo"
        actions={<AcademySegmentSwitcher active="brand" />}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {KPI_ITEMS.map((item, i) => {
          const value = item.getValue(kpiValues[i] ?? 0);
          return (
            <StatCard
              key={item.href}
              icon={item.icon}
              label={item.label}
              value={value}
              href={item.href}
              iconColor="slate"
              className="h-full"
            />
          );
        })}
      </div>
      <nav className="bg-bg-surface2 border-border-default flex items-center gap-1 overflow-x-auto rounded-lg border p-1">
        {TABS.map(({ href, label, match }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
              match(pathname)
                ? 'text-text-primary border-border-default border bg-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/60'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </CabinetPageContent>
  );
}
