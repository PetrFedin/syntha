'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, FileText, MessageCircle, Star, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSuggestedCourses, mockArticles } from '@/lib/education-data';
import { getCourseByIdForClient, getLearningPathsForCourseForClient } from '@/lib/academy-catalog';
import {
  academyCohortChatId,
  academyStaffChatId,
  enrollInCourse,
  isCourseEnrolled,
} from '@/lib/academy/academy-course-chats';
import { AcademyCourseReviewsPanel } from '@/components/academy/academy-course-reviews-panel';
import { AcademyClientLearningBar } from '@/components/academy/academy-client-learning-bar';
import {
  courseAudienceKindLabel,
  courseOutcomeLabel,
  courseProfessionalScopeLabel,
  courseProviderKindShortLabel,
  formatCoursePrice,
  inferCourseAccess,
} from '@/lib/academy-course-meta';
import { ROUTES } from '@/lib/routes';
import { ACADEMY_CTA_PRIMARY, ACADEMY_CTA_SECONDARY } from '@/lib/ui/academy-cta';
import { nuOrderDeskShell } from '@/lib/ui/nuorder-desk-shell';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GlossaryText } from '../../glossary-text';

const categoryRu: Record<string, string> = {
  economics: 'Экономика',
  design: 'Дизайн',
  production: 'Производство',
  analytics: 'Аналитика',
  management: 'Менеджмент',
  retail: 'Ритейл',
  legal: 'Право',
};

const levelRu: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  pro: 'Эксперт',
};

export default function ClientAcademyCoursePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? '');
  const course = getCourseByIdForClient(id);

  const [learningStarted, setLearningStarted] = React.useState(false);
  React.useEffect(() => {
    setLearningStarted(isCourseEnrolled(id));
  }, [id]);

  if (!course) {
    return (
      <div className={nuOrderDeskShell.canvas}>
        <p className="text-[13px] text-[#5b6675]">Курс не найден.</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href={ROUTES.academyPlatform}>К академии</Link>
        </Button>
      </div>
    );
  }

  const relatedArticles = (course.relatedIds ?? [])
    .map((rid) => mockArticles.find((a) => a.id === rid))
    .filter(Boolean);

  const pathsWithCourse = getLearningPathsForCourseForClient(id);
  const suggestedCourses = getSuggestedCourses(id, 4);

  return (
    <TooltipProvider>
      <div className={nuOrderDeskShell.canvas}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] font-semibold"
            asChild
          >
            <Link href={ROUTES.academyPlatform}>
              <ArrowLeft className="size-3.5" aria-hidden />
              Академия
            </Link>
          </Button>
          <span className="text-[#bcc3ce]" aria-hidden>
            /
          </span>
          <span className="text-[11px] font-medium text-[#6b7788]">Курсы</span>
        </div>

        <AcademyClientLearningBar messagesRole="shop" className="mb-4" />

        <div className="overflow-hidden rounded-sm border border-[#c5ccd6] bg-white shadow-none">
          <div className="relative aspect-[21/9] max-h-[220px] w-full bg-[#dde1e8] sm:aspect-[24/9]">
            <Image
              src={course.thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 960px"
              priority
              unoptimized
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
              aria-hidden
            />
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
              <Badge className="border-0 bg-white/95 px-2 py-0.5 text-[11px] font-medium text-[#1a2433] shadow-sm">
                {categoryRu[course.category] ?? course.category}
              </Badge>
              {course.isNew ? (
                <Badge className="border-0 bg-emerald-600 px-2 py-0.5 text-[11px] text-white">
                  Новое
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6b7788]">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5 text-[#0b63ce]" aria-hidden />
                {course.duration}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 text-amber-500" aria-hidden />
                {course.rating}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5 text-[#0b63ce]" aria-hidden />
                {course.studentsCount.toLocaleString('ru-RU')} слушателей
              </span>
              <span className="rounded-sm bg-[#f7f8fa] px-1.5 py-0.5 font-medium text-[#1a2433]">
                {levelRu[course.level] ?? course.level}
              </span>
              <span
                className={
                  inferCourseAccess(course) === 'free'
                    ? 'rounded-sm bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-800'
                    : 'rounded-sm bg-amber-50 px-1.5 py-0.5 font-medium text-amber-900'
                }
              >
                {formatCoursePrice(course)}
              </span>
              {courseProviderKindShortLabel(course.providerKind) ? (
                <span className="rounded-sm border border-[#e6e9ef] bg-white px-1.5 py-0.5 font-medium text-[#1a2433]">
                  {courseProviderKindShortLabel(course.providerKind)}
                </span>
              ) : null}
              {courseOutcomeLabel(course) ? (
                <span className="rounded-sm border border-[#e6e9ef] bg-white px-1.5 py-0.5 font-medium text-[#1a2433]">
                  {courseOutcomeLabel(course)}
                </span>
              ) : null}
              <span className="rounded-sm bg-violet-50 px-1.5 py-0.5 font-medium text-violet-900">
                {courseAudienceKindLabel(course)}
                {courseProfessionalScopeLabel(course)
                  ? ` · ${courseProfessionalScopeLabel(course)}`
                  : ''}
              </span>
            </div>

            <h1 className="text-[18px] font-semibold leading-snug text-[#1a2433] sm:text-[20px]">
              <GlossaryText text={course.title} />
            </h1>

            <p className="text-[13px] leading-relaxed text-[#5b6675]">
              <GlossaryText text={course.description} />
            </p>

            {course.curriculum?.length ? (
              <div>
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
                  Программа
                </h2>
                <ul className="space-y-1.5">
                  {course.curriculum.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2 text-[13px] text-[#1a2433] before:mt-2 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-[#0b63ce]"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {course.media?.length ? (
              <div className="border-t border-[#e6e9ef] pt-4">
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
                  Материалы
                </h2>
                <ul className="space-y-2">
                  {course.media.map((m, i) => (
                    <li
                      key={`${m.title}-${i}`}
                      className="flex items-start gap-2 rounded-sm border border-[#e6e9ef] bg-[#f7f8fa] px-3 py-2"
                    >
                      {m.type === 'video' ? (
                        <Video className="mt-0.5 size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                      ) : (
                        <FileText className="mt-0.5 size-4 shrink-0 text-[#0b63ce]" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[#1a2433]">{m.title}</p>
                        {m.size ? <p className="text-[11px] text-[#6b7788]">{m.size}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {relatedArticles.length > 0 ? (
              <div className="border-t border-[#e6e9ef] pt-4">
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
                  Связанные материалы
                </h2>
                <ul className="space-y-2">
                  {relatedArticles.map((article) =>
                    article ? (
                      <li key={article.id}>
                        <Link
                          href={ROUTES.clientAcademyKnowledgeArticle(article.slug)}
                          className="text-[13px] font-medium text-[#0b63ce] hover:underline"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ) : null
                  )}
                </ul>
              </div>
            ) : null}

            {pathsWithCourse.length > 0 ? (
              <div className="border-t border-[#e6e9ef] pt-4">
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
                  Входит в программы
                </h2>
                <ul className="space-y-2">
                  {pathsWithCourse.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={ROUTES.clientAcademyPath(p.id)}
                        className="text-[13px] font-semibold text-[#0b63ce] hover:underline"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-[#6b7788]">
                        {p.totalDuration} · {p.outcome}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {suggestedCourses.length > 0 ? (
              <div className="border-t border-[#e6e9ef] pt-4">
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
                  Ещё в каталоге
                </h2>
                <ul className="space-y-2">
                  {suggestedCourses.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={ROUTES.clientAcademyCourse(c.id)}
                        className="text-[13px] font-medium text-[#0b63ce] hover:underline"
                      >
                        {c.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-[#6b7788]">
                        {formatCoursePrice(c)}
                        {courseProviderKindShortLabel(c.providerKind)
                          ? ` · ${courseProviderKindShortLabel(c.providerKind)}`
                          : ''}
                        {courseOutcomeLabel(c) ? ` · ${courseOutcomeLabel(c)}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <AcademyCourseReviewsPanel courseId={course.id} catalogRating={course.rating} />

            <div className="flex flex-wrap gap-2 border-t border-[#e6e9ef] pt-4">
              {learningStarted ? (
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <span className="text-[12px] font-medium text-[#1a2433]">Чаты по курсу</span>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 rounded-sm border-[#c5ccd6] text-[12px]"
                  >
                    <Link href={ROUTES.shop.messagesChat(academyStaffChatId(id))}>
                      <MessageCircle className="size-3.5" aria-hidden />
                      Куратор
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 rounded-sm border-[#c5ccd6] text-[12px]"
                  >
                    <Link href={ROUTES.shop.messagesChat(academyCohortChatId(id))}>
                      <Users className="size-3.5" aria-hidden />
                      Группа участников
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className={ACADEMY_CTA_PRIMARY}
                  onClick={() => {
                    enrollInCourse(id);
                    setLearningStarted(true);
                    router.push(ROUTES.shop.messagesChat(academyStaffChatId(id)));
                  }}
                >
                  Начать обучение
                </Button>
              )}
              <Button asChild size="sm" className={ACADEMY_CTA_PRIMARY}>
                <Link href={`${ROUTES.academyPlatform}?tab=tests`}>Перейти к аттестации</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className={ACADEMY_CTA_SECONDARY}>
                <Link href={ROUTES.academyPlatform}>Все курсы</Link>
              </Button>
            </div>

            <p className="text-[11px] text-[#6b7788]">
              Организация: <span className="font-medium text-[#1a2433]">{course.provider}</span>
              {course.catalogSource !== 'platform' ? (
                <>
                  {' '}
                  · запись от{' '}
                  <span className="font-medium text-[#1a2433]">
                    {course.catalogSource === 'brand' ? 'бренда' : 'организации'}
                  </span>
                  {course.moderationStatus === 'approved'
                    ? ' (одобрено для каталога клиентов)'
                    : null}
                </>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
