'use client';

import Link from 'next/link';
import { ClipboardCheck, ExternalLink } from 'lucide-react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getAcademyCatalogOverview, getCoursesPendingPlatformReview } from '@/lib/academy-catalog';
import { getClientCatalogPreview } from '@/lib/academy-course-context';
import { ROUTES } from '@/lib/routes';
import {
  courseAudienceKindLabel,
  courseProfessionalScopeLabel,
  formatCoursePrice,
} from '@/lib/academy-course-meta';
import { catalogSourceLabel, courseCategoryRu } from '@/lib/academy-moderation-labels';

export default function AdminAcademyModerationPage() {
  const queue = getCoursesPendingPlatformReview();
  const overview = getAcademyCatalogOverview();

  return (
    <TooltipProvider delayDuration={200}>
      <CabinetPageContent maxWidth="full" className="min-h-screen bg-[#fcfdfe] p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ClipboardCheck className="size-6 text-muted-foreground" aria-hidden />
                <h1 className="text-2xl font-semibold tracking-tight">
                  Академия: модерация курсов
                </h1>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Заявки от брендов на платформе и от организаций-партнёров. После одобрения курс
                попадает в клиентский каталог{' '}
                <Link
                  href={ROUTES.academyPlatform}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  /academy
                </Link>
                . Кнопки решения пока демо — подключение к API и журнал решений позже.
              </p>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                Контекст студий:{' '}
                <Link
                  href={ROUTES.brand.academyPlatform}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  витрина платформы (бренд)
                </Link>
                {' · '}
                <Link
                  href={ROUTES.brand.academyOrganizationStudio}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  студия организации
                </Link>
                .
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.admin.home}>В админку</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Всего курсов (мок)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {overview.totalCoursesInDataset}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Витрина /academy
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {overview.clientCatalogCourseCount}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Очередь
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-700 text-foreground">
                {overview.pendingModerationCount}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Траектории
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {overview.clientLearningPathCount}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Бренд (демо)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {overview.demoBrandManagedCourseCount}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Орг. (демо)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {overview.demoOrganizationManagedCourseCount}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            В демо-данных помечено архивом:{' '}
            <span className="font-medium tabular-nums text-foreground">
              {overview.archivedCourseCountInDataset}
            </span>{' '}
            курсов — они не попадают в клиентский каталог (и траектории с ними скрываются на
            витрине).
          </p>

          {queue.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Очередь пуста — заявок на согласовании нет.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                <Link
                  href={ROUTES.brand.academyPlatform}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Витрина платформы в кабинете бренда
                </Link>
                {' · '}
                <Link
                  href={ROUTES.brand.academyOrganizationStudio}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  студия организации
                </Link>
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                В очереди: <span className="font-semibold text-foreground">{queue.length}</span>
              </p>
              <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Курс</TableHead>
                      <TableHead className="whitespace-nowrap">Категория</TableHead>
                      <TableHead>Источник</TableHead>
                      <TableHead className="min-w-[120px]">Аудитория</TableHead>
                      <TableHead className="whitespace-nowrap">Условия</TableHead>
                      <TableHead className="max-w-[180px]">Провайдер</TableHead>
                      <TableHead className="min-w-[130px]">Витрина клиента</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map((c) => {
                      const scope = courseProfessionalScopeLabel(c);
                      const clientPreview = getClientCatalogPreview(c);
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <Link
                              href={ROUTES.brand.academyPlatformCourse(c.id)}
                              className="font-medium text-primary hover:underline"
                            >
                              {c.title}
                            </Link>
                            <p className="mt-1 font-mono text-[11px] leading-tight text-muted-foreground">
                              {c.id}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {courseCategoryRu(c.category)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {catalogSourceLabel(c.catalogSource)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span>{courseAudienceKindLabel(c)}</span>
                            {scope ? (
                              <span className="mt-0.5 block text-[11px] text-muted-foreground/90">
                                {scope}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatCoursePrice(c)}
                          </TableCell>
                          <TableCell
                            className="max-w-[180px] truncate text-sm text-muted-foreground"
                            title={c.provider}
                          >
                            {c.provider}
                          </TableCell>
                          <TableCell>
                            {clientPreview.kind === 'live' ? (
                              <Link
                                href={clientPreview.href}
                                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                              >
                                Открыть как клиент
                              </Link>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help border-b border-dotted border-muted-foreground/50 text-xs text-muted-foreground">
                                    Ожидает публикации
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[280px] text-xs">
                                  <p className="font-medium">После одобрения</p>
                                  <p className="mt-1 break-all text-muted-foreground">
                                    {ROUTES.clientAcademyCourse(c.id)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 px-2 text-xs"
                                asChild
                              >
                                <Link href={ROUTES.brand.academyPlatformCourse(c.id)}>
                                  <ExternalLink className="size-3.5" aria-hidden />
                                  Студия
                                </Link>
                              </Button>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Button size="sm" className="h-8 px-2 text-xs" disabled>
                                      Одобрить
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[240px] text-xs">
                                  Демо: решение будет записываться через API модерации.
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2 text-xs"
                                      disabled
                                    >
                                      Отклонить
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[240px] text-xs">
                                  Демо: причина отказа и уведомление автору — в будущей интеграции.
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </CabinetPageContent>
    </TooltipProvider>
  );
}
