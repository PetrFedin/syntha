'use client';

import React from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AcademySegmentSwitcher } from '@/components/brand/AcademySegmentSwitcher';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getAcademyLinks } from '@/lib/data/entity-links';
import { ROUTES } from '@/lib/routes';
import { ACADEMY_CTA_PRIMARY, ACADEMY_CTA_SECONDARY } from '@/lib/ui/academy-cta';
import { cn } from '@/lib/utils';
import { getCourseById, academyLevelLabels } from '@/lib/education-data';
import {
  ArrowLeft,
  Clock,
  Star,
  Users,
  PlayCircle,
  Video,
  FileText,
  ChevronRight,
  Archive,
  MessageCircle,
} from 'lucide-react';
import { RegistryPageHeader } from '@/components/design-system';
import { AcademyCatalogContextCard } from '@/components/academy/academy-catalog-context-card';
import { AcademyCourseReviewsPanel } from '@/components/academy/academy-course-reviews-panel';
import {
  academyCohortChatId,
  academyStaffChatId,
  enrollInCourse,
  isCourseEnrolled,
} from '@/lib/academy/academy-course-chats';

const ROLE_LABELS: Record<string, string> = {
  shop: 'Магазины',
  brand: 'Бренды',
  distributor: 'Дистрибьюторы',
  manufacturer: 'Производители',
  supplier: 'Поставщики',
};

export default function PlatformCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string | undefined) ?? '';
  const course = getCourseById(id);

  const [learningStarted, setLearningStarted] = React.useState(false);
  React.useEffect(() => {
    setLearningStarted(isCourseEnrolled(id));
  }, [id]);

  if (!course) {
    return (
      <CabinetPageContent
        maxWidth="full"
        className="from-bg-surface2/80 to-bg-surface w-full space-y-6 bg-gradient-to-b pb-16"
      >
        <RegistryPageHeader
          title="Курс не найден"
          leadPlain="Курс отсутствует в демо-данных платформы."
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
        <Button variant="outline" asChild>
          <Link href={ROUTES.brand.academyPlatform}>Вернуться в Академию платформы</Link>
        </Button>
      </CabinetPageContent>
    );
  }

  const isRecommended = (course as { isRecommended?: boolean }).isRecommended;
  const isNew = (course as { isNew?: boolean }).isNew;

  return (
    <CabinetPageContent
      maxWidth="full"
      className="from-bg-surface2/80 to-bg-surface w-full space-y-8 bg-gradient-to-b pb-16"
    >
      <RegistryPageHeader
        title={course.title}
        leadPlain={course.description}
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
        {course.archived ? (
          <Alert className="border-amber-200/80 bg-amber-50/90 text-foreground">
            <Archive className="size-4 text-amber-800" aria-hidden />
            <AlertTitle>Архив витрины</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              Курс снят с клиентского каталога{' '}
              <Link
                href={ROUTES.academyPlatform}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                /academy
              </Link>
              . Материалы в кабинете бренда доступны для внутреннего просмотра.
            </AlertDescription>
          </Alert>
        ) : null}
        {course.thumbnail && (
          <div className="bg-bg-surface2 relative aspect-video overflow-hidden rounded-2xl">
            <Image
              src={course.thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              {isRecommended && <Badge className="bg-accent-primary">Рекомендуем</Badge>}
              {isNew && <Badge variant="secondary">Новый</Badge>}
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-wrap gap-3">
            <span className="text-text-secondary flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4" /> {course.duration}
            </span>
            <span className="text-text-secondary flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {course.rating}
            </span>
            <span className="text-text-secondary flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4" /> {course.studentsCount.toLocaleString()} слушателей
            </span>
            {course.level && (
              <Badge variant="outline">{academyLevelLabels[course.level] ?? course.level}</Badge>
            )}
          </div>
          {course.targetRoles && course.targetRoles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {course.targetRoles.map((r) => (
                <Badge key={r} variant="secondary" className="text-xs">
                  {ROLE_LABELS[r] ?? r}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <AcademyCatalogContextCard course={course} />

        {learningStarted ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className={cn('w-full sm:w-auto', ACADEMY_CTA_SECONDARY)}
              asChild
            >
              <Link href={ROUTES.brand.messagesChat(academyStaffChatId(id))} className="gap-1.5">
                <MessageCircle className="size-3.5 shrink-0" aria-hidden />
                Чат с куратором
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn('w-full sm:w-auto', ACADEMY_CTA_SECONDARY)}
              asChild
            >
              <Link href={ROUTES.brand.messagesChat(academyCohortChatId(id))} className="gap-1.5">
                <Users className="size-3.5 shrink-0" aria-hidden />
                Группа участников
              </Link>
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            className={cn(ACADEMY_CTA_PRIMARY, 'w-full gap-1.5 sm:w-auto')}
            onClick={() => {
              enrollInCourse(id);
              setLearningStarted(true);
              router.push(ROUTES.brand.messagesChat(academyStaffChatId(id)));
            }}
          >
            <PlayCircle className="size-3.5 shrink-0" aria-hidden /> Начать обучение
          </Button>
        )}

        {course.curriculum && course.curriculum.length > 0 && (
          <Card className="border-border-default/80 rounded-2xl border">
            <CardHeader>
              <h2 className="text-text-primary font-semibold">Программа курса</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {course.curriculum.map((item, i) => (
                  <li key={i} className="text-text-primary flex items-center gap-3">
                    <span className="bg-accent-primary/15 text-accent-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {course.media && course.media.length > 0 && (
          <Card className="border-border-default/80 rounded-2xl border">
            <CardHeader>
              <h2 className="text-text-primary font-semibold">Материалы</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {course.media.map((m, i) => (
                  <a
                    key={i}
                    href={m.url}
                    className="border-border-default/80 hover:bg-bg-surface2 flex items-center justify-between rounded-xl border p-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {m.type === 'video' ? (
                        <Video className="text-accent-primary h-5 w-5" />
                      ) : (
                        <FileText className="text-text-secondary h-5 w-5" />
                      )}
                      <span className="text-text-primary font-medium">{m.title}</span>
                      {m.type === 'file' && 'size' in m && m.size && (
                        <span className="text-text-secondary text-xs">{m.size}</span>
                      )}
                    </div>
                    <ChevronRight className="text-text-muted h-4 w-4" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(course as { relatedIds?: string[] }).relatedIds &&
          (course as { relatedIds: string[] }).relatedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-text-secondary text-sm">Связанные материалы:</span>
              {(course as { relatedIds: string[] }).relatedIds.map((rid) => (
                <Link key={rid} href={ROUTES.brand.academyPlatformArticle(rid)}>
                  <Badge variant="outline" className="hover:bg-accent-primary/10 cursor-pointer">
                    {rid}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

        <Card className="border-border-default/80 rounded-2xl border">
          <CardContent className="pt-6">
            <AcademyCourseReviewsPanel
              courseId={course.id}
              catalogRating={course.rating}
              embedded
            />
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" size="sm" asChild className={ACADEMY_CTA_SECONDARY}>
        <Link href={ROUTES.brand.academyPlatform} className="gap-1.5">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden /> К каталогу курсов
        </Link>
      </Button>

      <RelatedModulesBlock links={getAcademyLinks()} />
    </CabinetPageContent>
  );
}
