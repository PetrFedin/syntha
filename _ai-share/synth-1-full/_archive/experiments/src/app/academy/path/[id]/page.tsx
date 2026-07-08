'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  Archive,
  TrendingUp,
  Clock,
  ListOrdered,
  CalendarDays,
  Video,
  BookOpen,
  ClipboardCheck,
  Target,
  CheckCircle2,
  Circle,
  GraduationCap,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { academyLevelLabels, mockAssessments } from '@/lib/education-data';
import { getCourseByIdForClient, getLearningPathByIdForClient } from '@/lib/academy-catalog';
import {
  courseOutcomeLabel,
  courseProviderKindShortLabel,
  formatCoursePrice,
} from '@/lib/academy-course-meta';
import { ROUTES } from '@/lib/routes';
import {
  ACADEMY_CTA_DISABLED,
  ACADEMY_CTA_PRIMARY,
  ACADEMY_CTA_SECONDARY,
} from '@/lib/ui/academy-cta';
import { nuOrderDeskShell } from '@/lib/ui/nuorder-desk-shell';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { LearningPathCourseBlock } from '@/lib/types';
import { enrollCourses } from '@/lib/academy/academy-course-chats';
import { getCourseRatingSummary } from '@/lib/academy/academy-course-reviews';
import { AcademyClientLearningBar } from '@/components/academy/academy-client-learning-bar';
import { useToast } from '@/hooks/use-toast';

const progressStorageKey = (pathId: string) => `synth-academy-path-progress:${pathId}`;

function loadCompletedCourseIds(pathId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(progressStorageKey(pathId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveCompletedCourseIds(pathId: string, ids: string[]) {
  try {
    sessionStorage.setItem(progressStorageKey(pathId), JSON.stringify(ids));
  } catch {
    /* ignore quota */
  }
}

export default function ClientAcademyPathPage() {
  const params = useParams();
  const { toast } = useToast();
  const id = String(params?.id ?? '');
  const path = getLearningPathByIdForClient(id);

  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);

  useEffect(() => {
    setCompletedCourseIds(loadCompletedCourseIds(id));
  }, [id]);

  const setCompleted = useCallback(
    (updater: (prev: string[]) => string[]) => {
      const p = getLearningPathByIdForClient(id);
      if (!p || p.archived) return;
      setCompletedCourseIds((prev) => {
        const next = updater(prev);
        saveCompletedCourseIds(p.id, next);
        return next;
      });
    },
    [id]
  );

  const toggleCourseDone = useCallback(
    (courseId: string) => {
      setCompleted((prev) =>
        prev.includes(courseId) ? prev.filter((c) => c !== courseId) : [...prev, courseId]
      );
    },
    [setCompleted]
  );

  const d = path?.programDetail;
  const stepCount = path?.courses.length ?? 0;
  const stepLabel =
    stepCount === 1 ? '1 курс' : stepCount < 5 ? `${stepCount} курса` : `${stepCount} курсов`;

  const blockByCourseId = useMemo(() => {
    const m = new Map<string, LearningPathCourseBlock>();
    const blocks = path?.programDetail?.courseBlocks;
    if (!blocks) return m;
    for (const b of blocks) m.set(b.courseId, b);
    return m;
  }, [path?.programDetail?.courseBlocks]);

  const doneInPath = useMemo(
    () => (path?.courses ?? []).filter((cid) => completedCourseIds.includes(cid)).length,
    [path?.courses, completedCourseIds]
  );
  const progressPct = stepCount ? Math.round((doneInPath / stepCount) * 100) : 0;
  const nextCourseId = path?.courses.find((cid) => !completedCourseIds.includes(cid));
  const allDone = stepCount > 0 && doneInPath === stepCount;

  const relatedAssessments = useMemo(
    () =>
      !path
        ? []
        : mockAssessments.filter(
            (a) => a.courseId && path.courses.includes(a.courseId) && !a.archived
          ),
    [path]
  );

  const pathReviewsAggregate = useMemo(() => {
    if (!path) return null;
    let sum = 0;
    let n = 0;
    for (const cid of path.courses) {
      const s = getCourseRatingSummary(cid);
      if (s.count > 0) {
        sum += s.average * s.count;
        n += s.count;
      }
    }
    if (n === 0) return null;
    return { average: Math.round((sum / n) * 10) / 10, count: n };
  }, [path]);

  const academyLiveHref = `${ROUTES.academyPlatform}?tab=live`;
  const academyTestsHref = `${ROUTES.academyPlatform}?tab=tests`;
  const academyWikiHref = `${ROUTES.academyPlatform}?tab=wiki`;

  if (!path) {
    return (
      <div className={nuOrderDeskShell.canvas}>
        <p className="text-[13px] text-[#5b6675]">Программа не найдена.</p>
        <Button asChild variant="outline" size="sm" className={cn('mt-3', ACADEMY_CTA_SECONDARY)}>
          <Link href={ROUTES.academyPlatform}>К академии</Link>
        </Button>
      </div>
    );
  }

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
          <span className="text-[11px] font-medium text-[#6b7788]">Траектории</span>
        </div>

        <div className="rounded-sm border border-[#c5ccd6] bg-white p-4 shadow-none sm:p-5">
          {path.archived ? (
            <Alert className="mb-4 border-amber-200/90 bg-amber-50/95 text-foreground">
              <Archive className="size-4 text-amber-800" aria-hidden />
              <AlertTitle className="text-[13px]">Программа в архиве</AlertTitle>
              <AlertDescription className="text-[12px] text-[#5b6675]">
                Новые зачисления не оформляются; материалы доступны для ознакомления. Прогресс и
                отметки недоступны.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                <TrendingUp className="size-5 text-indigo-600" aria-hidden />
              </div>
              <div className="min-w-0">
                <Badge className="mb-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium normal-case text-slate-600">
                  Программа
                </Badge>
                {path.audience ? (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b95a5]">
                    {path.audience}
                  </p>
                ) : null}
                <h1 className="text-[18px] font-semibold leading-snug text-[#1a2433] sm:text-[20px]">
                  {path.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="gap-1 rounded-md border border-[#e6e9ef] bg-[#f7f8fa] px-2 py-0.5 text-[10px] font-medium normal-case text-[#3d4a5c]"
            >
              <ListOrdered className="size-3 shrink-0" aria-hidden />
              {stepLabel}
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1 rounded-md border border-[#e6e9ef] bg-[#f7f8fa] px-2 py-0.5 text-[10px] font-medium normal-case text-[#3d4a5c]"
            >
              <Clock className="size-3 shrink-0" aria-hidden />
              {path.totalDuration}
            </Badge>
            {path.level ? (
              <Badge
                variant="outline"
                className="rounded-md px-2 py-0.5 text-[10px] font-medium normal-case"
              >
                {academyLevelLabels[path.level]}
              </Badge>
            ) : null}
            {path.format ? (
              <Badge
                variant="outline"
                className="max-w-[min(100%,14rem)] truncate rounded-md px-2 py-0.5 text-[10px] font-normal normal-case"
                title={path.format}
              >
                {path.format}
              </Badge>
            ) : null}
          </div>

          {pathReviewsAggregate ? (
            <p className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px] text-[#5b6675]">
              <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden />
              <span className="font-semibold tabular-nums text-[#1a2433]">
                {pathReviewsAggregate.average.toFixed(1).replace('.', ',')}
              </span>
              <span>
                средняя оценка по отзывам модулей ({pathReviewsAggregate.count}{' '}
                {pathReviewsAggregate.count === 1
                  ? 'оценка'
                  : pathReviewsAggregate.count < 5
                    ? 'оценки'
                    : 'оценок'}
                )
              </span>
            </p>
          ) : null}

          <div className="mb-4 space-y-2">
            {!path.archived ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={ACADEMY_CTA_SECONDARY}
                  onClick={() => {
                    enrollCourses([...path.courses]);
                    toast({
                      title: 'Чаты подключены',
                      description:
                        'В разделе «Сообщения» появились каналы куратора и групп по всем модулям программы.',
                    });
                  }}
                >
                  Подключить чаты всех модулей
                </Button>
              </div>
            ) : null}
            <AcademyClientLearningBar messagesRole="shop" limitToCourseIds={path.courses} />
          </div>

          <div className="mb-5 space-y-2 rounded-lg border border-[#e6e9ef] bg-[#f7f8fa] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7788]">
                Прогресс программы
              </p>
              <span className="text-[12px] font-semibold tabular-nums text-[#1a2433]">
                {doneInPath}/{stepCount} модулей
              </span>
            </div>
            <Progress value={progressPct} className="h-2 bg-white" />
            {allDone ? (
              <p className="text-[12px] font-medium text-emerald-800">
                Все модули отмечены — осталось пройти контроль и зачёт.
              </p>
            ) : nextCourseId ? (
              <p className="text-[12px] text-[#5b6675]">
                Следующий шаг:{' '}
                <Link
                  href={ROUTES.clientAcademyCourse(nextCourseId)}
                  className="font-semibold text-[#0b63ce] hover:underline"
                >
                  открыть курс в программе →
                </Link>
              </p>
            ) : null}
          </div>

          <p className="mb-5 text-[13px] leading-relaxed text-[#5b6675]">{path.description}</p>

          <Tabs defaultValue="progress" className="space-y-4">
            <TabsList className="flex h-auto min-h-0 w-full flex-wrap justify-start gap-1 rounded-lg border border-[#e6e9ef] bg-[#f7f8fa] p-1">
              <TabsTrigger
                value="progress"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0b63ce]"
              >
                Ход обучения
              </TabsTrigger>
              <TabsTrigger
                value="plan"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0b63ce]"
              >
                План
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0b63ce]"
              >
                Задания
              </TabsTrigger>
              <TabsTrigger
                value="materials"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0b63ce]"
              >
                Материалы
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0b63ce]"
              >
                Календарь и эфиры
              </TabsTrigger>
              <TabsTrigger
                value="cert"
                className="rounded-md px-2.5 py-1.5 text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0b63ce]"
              >
                Контроль и зачёт
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-4">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
                Модули и статус
              </h2>
              <ol className="space-y-3">
                {path.courses.map((courseId, i) => {
                  const course = getCourseByIdForClient(courseId);
                  if (!course) return null;
                  const done = completedCourseIds.includes(courseId);
                  return (
                    <li key={courseId}>
                      <div className="flex gap-3 rounded-sm border border-[#e6e9ef] bg-[#f7f8fa] p-3 sm:items-start">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-[13px] font-semibold text-indigo-600 shadow-sm">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <Link
                                href={ROUTES.clientAcademyCourse(courseId)}
                                className="text-[14px] font-semibold text-[#0b63ce] hover:underline"
                              >
                                {course.title}
                              </Link>
                              <p className="mt-0.5 text-[12px] text-[#6b7788]">{course.duration}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-[#6b7788]">
                              {done ? (
                                <>
                                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                                  <span className="text-emerald-800">Пройден</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="size-4 text-[#bcc3ce]" aria-hidden />
                                  <span>В работе</span>
                                </>
                              )}
                            </div>
                          </div>
                          {!path.archived ? (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={done ? 'outline' : 'default'}
                                className={done ? ACADEMY_CTA_SECONDARY : ACADEMY_CTA_PRIMARY}
                                onClick={() => toggleCourseDone(courseId)}
                              >
                                {done ? 'Снять отметку' : 'Подтвердить прохождение модуля'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className={ACADEMY_CTA_SECONDARY}
                                asChild
                              >
                                <Link href={ROUTES.clientAcademyCourse(courseId)}>
                                  К материалам курса
                                </Link>
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </TabsContent>

            <TabsContent value="plan" className="space-y-4">
              <Card className="rounded-sm border-[#e6e9ef] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-[14px] text-[#1a2433]">
                    <Target className="size-4 text-[#0b63ce]" aria-hidden />
                    Цели и нагрузка
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-[13px] leading-relaxed text-[#5b6675]">
                  <p>{d?.overviewExtended ?? path.description}</p>
                  {d?.audienceDetail ? (
                    <>
                      <Separator />
                      <p>
                        <span className="font-semibold text-[#1a2433]">Для кого: </span>
                        {d.audienceDetail}
                      </p>
                    </>
                  ) : null}
                  {d?.workload ? (
                    <p>
                      <span className="font-semibold text-[#1a2433]">Нагрузка и темп: </span>
                      {d.workload}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
              {d?.competencies?.length ? (
                <Card className="rounded-sm border-[#e6e9ef] shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[14px] text-[#1a2433]">Компетенции</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-1.5 text-[13px] text-[#5b6675]">
                      {d.competencies.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}
              {d?.prerequisites?.length ? (
                <Card className="rounded-sm border-[#e6e9ef] shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[14px] text-[#1a2433]">Входные требования</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-inside list-disc space-y-1.5 text-[13px] text-[#5b6675]">
                      {d.prerequisites.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <p className="text-[12px] text-[#6b7788]">
                Юниты и проекты по шагам программы. Выполнение фиксируется в курсах; здесь —
                дорожная карта и контрольные точки.
              </p>
              {path.courses.map((courseId, i) => {
                const course = getCourseByIdForClient(courseId);
                const block = blockByCourseId.get(courseId);
                if (!course) return null;
                return (
                  <Card key={courseId} className="rounded-sm border-[#e6e9ef] shadow-none">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#8b95a5]">
                            Шаг {i + 1}
                          </p>
                          <CardTitle className="text-[15px] text-[#1a2433]">
                            {course.title}
                          </CardTitle>
                          {block?.roleInPath ? (
                            <CardDescription className="mt-1 text-[13px] text-[#5b6675]">
                              {block.roleInPath}
                            </CardDescription>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn('shrink-0', ACADEMY_CTA_SECONDARY)}
                          asChild
                        >
                          <Link href={ROUTES.clientAcademyCourse(courseId)}>К курсу</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-[13px] text-[#5b6675]">
                      {block?.narrative ? <p>{block.narrative}</p> : null}
                      {block?.keyUnits?.length ? (
                        <div>
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#6b7788]">
                            Контрольные темы
                          </p>
                          <ul className="list-inside list-disc space-y-1">
                            {block.keyUnits.map((u) => (
                              <li key={u}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {block?.labOrProject ? (
                        <div className="rounded-md border border-indigo-100 bg-indigo-50/60 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-900">
                            Домашнее задание / проект
                          </p>
                          <p className="mt-1 text-[13px] text-indigo-950">{block.labOrProject}</p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card className="rounded-sm border-[#e6e9ef] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-[14px] text-[#1a2433]">
                    <BookOpen className="size-4 text-[#0b63ce]" aria-hidden />
                    Инструменты и чтение
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-[13px] text-[#5b6675]">
                  {d?.tools?.length ? (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase text-[#6b7788]">
                        Инструменты
                      </p>
                      <ul className="list-inside list-disc space-y-1">
                        {d.tools.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>Список инструментов уточняется внутри каждого курса.</p>
                  )}
                  {d?.readings?.length ? (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase text-[#6b7788]">
                        Материалы
                      </p>
                      <ul className="list-inside list-disc space-y-1">
                        {d.readings.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <Button variant="outline" size="sm" className={ACADEMY_CTA_SECONDARY} asChild>
                    <Link href={academyWikiHref}>База знаний академии</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card className="rounded-sm border-[#e6e9ef] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-[14px] text-[#1a2433]">
                    <CalendarDays className="size-4 text-[#0b63ce]" aria-hidden />
                    Календарь и синхронные встречи
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-[13px] leading-relaxed text-[#5b6675]">
                  <p>
                    {path.format ? (
                      <>
                        <span className="font-semibold text-[#1a2433]">Формат: </span>
                        {path.format}.{' '}
                      </>
                    ) : null}
                    {d?.workload
                      ? 'Разборы и Q&A выходят по расписанию академии; записи эфиров попадают в архив после мероприятия.'
                      : 'Расписание эфиров и дедлайнов смотрите в разделе эфиров и в карточках курсов.'}
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-[13px] text-[#5b6675]">
                    <li>Видеолекции — асинхронно, в любое время внутри курса.</li>
                    <li>Живые разборы и созвоны — по слотам в календаре академии (демо).</li>
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className={ACADEMY_CTA_PRIMARY} asChild>
                      <Link href={academyLiveHref}>
                        <Video className="size-3.5" aria-hidden />
                        Эфиры и календарь
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cert" className="space-y-4">
              <Card className="rounded-sm border-[#e6e9ef] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-[14px] text-[#1a2433]">
                    <ClipboardCheck className="size-4 text-[#0b63ce]" aria-hidden />
                    Тесты, кейсы и подтверждение
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-[13px] leading-relaxed text-[#5b6675]">
                  {d?.assessmentAndCert ? (
                    <p>{d.assessmentAndCert}</p>
                  ) : (
                    <p>Промежуточные проверки и итоговый зачёт описаны внутри курсов программы.</p>
                  )}
                  {d?.certificationDetail ? (
                    <p>
                      <span className="font-semibold text-[#1a2433]">Сертификация: </span>
                      {d.certificationDetail}
                    </p>
                  ) : null}
                  <Separator />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7788]">
                    Логика подтверждения (демо)
                  </p>
                  <ol className="list-inside list-decimal space-y-1.5 text-[13px] text-[#5b6675]">
                    <li>Отметить модули программы на вкладке «Ход обучения».</li>
                    <li>Пройти привязанные аттестации в разделе «Тесты и аттестация».</li>
                    <li>
                      Сдать практические задания / кейс по требованиям курса (проверка в демо —
                      вручную).
                    </li>
                  </ol>
                  {relatedAssessments.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase text-[#6b7788]">
                        Аттестации по курсам программы
                      </p>
                      <ul className="space-y-2">
                        {relatedAssessments.map((a) => (
                          <li
                            key={a.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#e6e9ef] bg-[#f7f8fa] px-3 py-2"
                          >
                            <span className="min-w-0 text-[13px] font-medium text-[#1a2433]">
                              {a.title}
                            </span>
                            <span className="text-[11px] text-[#6b7788]">
                              порог {a.passingScore}%
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <Button size="sm" className={ACADEMY_CTA_PRIMARY} asChild>
                    <Link href={academyTestsHref}>Перейти к аттестациям</Link>
                  </Button>
                </CardContent>
              </Card>
              <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/80 p-4">
                <Award className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                    Результат программы
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-emerald-900">{path.outcome}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
            Краткий список курсов
          </h2>
          <ol className="space-y-3">
            {path.courses.map((courseId, i) => {
              const course = getCourseByIdForClient(courseId);
              if (!course) return null;
              return (
                <li key={courseId}>
                  <Link
                    href={ROUTES.clientAcademyCourse(courseId)}
                    className="flex gap-3 rounded-sm border border-[#e6e9ef] bg-[#f7f8fa] p-3 transition-colors hover:border-[#0b63ce]/35 hover:bg-white"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-[13px] font-semibold text-indigo-600 shadow-sm">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold text-[#1a2433]">{course.title}</p>
                      <p className="mt-0.5 text-[12px] text-[#6b7788]">{course.duration}</p>
                      <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-[#6b7788]">
                        <span className="font-medium text-[#1a2433]">
                          {formatCoursePrice(course)}
                        </span>
                        {courseProviderKindShortLabel(course.providerKind) ? (
                          <span>{courseProviderKindShortLabel(course.providerKind)}</span>
                        ) : null}
                        {courseOutcomeLabel(course) ? (
                          <span className="text-[#5b6675]">{courseOutcomeLabel(course)}</span>
                        ) : null}
                      </p>
                    </div>
                    <span className="shrink-0 self-center text-[11px] font-semibold text-[#0b63ce]">
                      Открыть →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex flex-wrap gap-2">
            {path.archived ? (
              <Button type="button" size="sm" disabled className={ACADEMY_CTA_DISABLED}>
                Программа в архиве
              </Button>
            ) : (
              <Button asChild size="sm" className={ACADEMY_CTA_PRIMARY}>
                <Link
                  href={
                    nextCourseId
                      ? ROUTES.clientAcademyCourse(nextCourseId)
                      : path.courses[0]
                        ? ROUTES.clientAcademyCourse(path.courses[0])
                        : ROUTES.academyPlatform
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="size-4" aria-hidden />
                    {nextCourseId ? 'Продолжить обучение' : 'Открыть первый курс'}
                  </span>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className={ACADEMY_CTA_SECONDARY}>
              <Link href={ROUTES.academyPlatform}>Назад к каталогу</Link>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
