'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ACADEMY_CTA_PRIMARY, ACADEMY_CTA_SECONDARY } from '@/lib/ui/academy-cta';
import { cn } from '@/lib/utils';
import { academyLevelLabels, getLearningPathById } from '@/lib/education-data';
import { getCourseByIdForClient, getLearningPathByIdForClient } from '@/lib/academy-catalog';
import {
  ArrowLeft,
  Archive,
  Clock,
  Award,
  ChevronRight,
  PlayCircle,
  ListOrdered,
} from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';

export default function PlatformPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const path = getLearningPathByIdForClient(id);
  const pathAny = getLearningPathById(id);

  if (!path) {
    const lead =
      pathAny?.archived === true
        ? 'Программа в архиве и скрыта с клиентской витрины /academy.'
        : 'Нет программы с таким id или не все курсы доступны в клиентском каталоге (модерация).';
    return (
      <CabinetPageContent
        maxWidth="full"
        className="from-bg-surface2/80 to-bg-surface w-full space-y-6 bg-gradient-to-b pb-16"
      >
        <RegistryPageHeader
          title="Траектория не найдена"
          leadPlain={lead}
          eyebrow={
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 shrink-0"
              onClick={() => router.back()}
              aria-label="Назад"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          }
        />
        <Button variant="outline" size="sm" asChild className={ACADEMY_CTA_SECONDARY}>
          <Link href={ROUTES.brand.academyPlatform}>Вернуться в Академию платформы</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  const pathCourses = path.courses
    .map((cid) => getCourseByIdForClient(cid))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const leadPlain = path.description;
  const stepCount = path.courses.length;
  const stepLabel =
    stepCount === 1 ? '1 курс' : stepCount < 5 ? `${stepCount} курса` : `${stepCount} курсов`;
  const firstCourseId = path.courses[0];

  return (
    <CabinetPageContent
      maxWidth="full"
      className="from-bg-surface2/80 to-bg-surface w-full space-y-8 bg-gradient-to-b pb-16"
    >
      <RegistryPageHeader
        title={path.title}
        leadPlain={leadPlain}
        eyebrow={
          <Button variant="ghost" size="icon" className="-ml-2 shrink-0" asChild>
            <Link href={ROUTES.brand.academyPlatform} aria-label="К каталогу платформы">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={<AcademySegmentSwitcher active="platform" />}
      />

      <div className="flex flex-col gap-6">
        {path.archived ? (
          <Alert className="border-amber-200/80 bg-amber-50/90 text-foreground">
            <Archive className="size-4 text-amber-800" aria-hidden />
            <AlertTitle>Архив программы</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              На клиентской витрине программа отмечена как архивная; новые зачисления не
              оформляются.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="border-border-default/80 flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
              <ListOrdered className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {stepLabel}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[11px] font-medium">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {path.totalDuration}
            </Badge>
            {path.level ? (
              <Badge variant="outline" className="text-[11px] font-medium">
                {academyLevelLabels[path.level]}
              </Badge>
            ) : null}
            {path.format ? (
              <Badge
                variant="outline"
                className="max-w-full truncate text-[11px] font-normal"
                title={path.format}
              >
                {path.format}
              </Badge>
            ) : null}
          </div>
          {path.audience ? (
            <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest">
              {path.audience}
            </p>
          ) : null}
          <div className="border-border-default/70 bg-bg-surface2/50 flex items-start gap-3 rounded-xl border p-4">
            <Award className="text-accent-primary mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="text-text-muted text-[10px] font-bold uppercase tracking-wide">
                Итог программы
              </p>
              <p className="text-text-primary mt-1 text-sm font-semibold leading-snug">
                {path.outcome}
              </p>
            </div>
          </div>
        </div>

        {firstCourseId ? (
          <Button size="sm" asChild className={cn(ACADEMY_CTA_PRIMARY, 'w-full sm:w-auto')}>
            <Link href={ROUTES.brand.academyPlatformCourse(firstCourseId)} className="gap-1.5">
              <PlayCircle className="size-3.5 shrink-0" aria-hidden />
              Начать с первого курса
            </Link>
          </Button>
        ) : null}

        <div>
          <h2 className="text-text-primary mb-1 font-semibold">Шаги программы</h2>
          <p className="text-text-secondary mb-4 text-sm">
            Проходите по порядку — каждый курс ведёт к следующему блоку компетенций.
          </p>
          <ul className="relative space-y-0">
            {pathCourses.map((course, i) => (
              <li key={course.id} className="relative pb-6 last:pb-0">
                {i < pathCourses.length - 1 ? (
                  <span
                    className="bg-accent-primary/25 absolute left-[1.15rem] top-10 hidden h-[calc(100%-0.5rem)] w-px sm:block"
                    aria-hidden
                  />
                ) : null}
                <Link href={ROUTES.brand.academyPlatformCourse(course.id)}>
                  <Card className="border-border-default/80 hover:border-accent-primary/30 group overflow-hidden rounded-2xl border transition-all hover:shadow-md">
                    <CardContent className="flex p-0">
                      <div className="bg-bg-surface2 relative aspect-video w-32 shrink-0 sm:w-40">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt=""
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="160px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="text-text-muted h-8 w-8" />
                          </div>
                        )}
                        <span className="text-text-primary absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-xs font-bold shadow-sm ring-1 ring-black/5">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-4 p-4">
                        <div className="min-w-0">
                          <p className="text-text-muted mb-0.5 text-[10px] font-bold uppercase tracking-wide">
                            Шаг {i + 1}
                          </p>
                          <h3 className="text-text-primary line-clamp-2 font-semibold">
                            {course.title}
                          </h3>
                          <p className="text-text-secondary mt-0.5 text-sm">{course.duration}</p>
                        </div>
                        <ChevronRight className="text-text-muted h-5 w-5 shrink-0" aria-hidden />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button variant="outline" size="sm" asChild className={ACADEMY_CTA_SECONDARY}>
        <Link href={ROUTES.brand.academyPlatform} className="gap-1.5">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden /> К траекториям
        </Link>
      </Button>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
