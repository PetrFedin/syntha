'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  ListOrdered,
  Clock,
  Layers,
  Shield,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import type { LearningPath } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SynthaDemoMark } from '@/components/ui/syntha-demo-mark';
import { academyLevelLabels } from '@/lib/education-data';
import { getCourseByIdForClient } from '@/lib/academy-catalog';
import { ROUTES } from '@/lib/routes';
import { courseOutcomeLabel, formatCoursePrice } from '@/lib/academy-course-meta';
import { cn } from '@/lib/utils';

function SectionTitle({ children, icon: Icon }: { children: ReactNode; icon?: typeof BookOpen }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
      <span className="inline-flex items-center gap-2">
        {Icon ? <Icon className="size-3.5 shrink-0 text-[#0b63ce]" aria-hidden /> : null}
        {children}
      </span>
    </h3>
  );
}

function BulletList({ items, icon: Icon }: { items: string[]; icon?: typeof CheckCircle2 }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-2 text-[13px] leading-snug text-slate-700">
          {Icon ? <Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden /> : null}
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function LearningPathAboutDialog({
  path,
  open,
  onOpenChange,
}: {
  path: LearningPath;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathHref = ROUTES.clientAcademyPath(path.id);
  const d = path.programDetail;
  const stepCount = path.courses.length;
  const stepLabel =
    stepCount === 1 ? '1 курс' : stepCount < 5 ? `${stepCount} курса` : `${stepCount} курсов`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[min(92vh,880px)] w-[calc(100vw-1.25rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-xl border-2 border-slate-200/95 p-0 shadow-xl ring-1 ring-slate-900/[0.04]',
          'sm:w-full'
        )}
      >
        <DialogHeader className="shrink-0 space-y-2 border-b border-slate-100 bg-slate-50/90 px-6 py-5 sm:px-8 sm:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <SynthaDemoMark compact className="order-first sm:order-none" />
            <Badge variant="secondary" className="gap-1 text-[10px] font-medium normal-case">
              <ListOrdered className="size-3" aria-hidden />
              {stepLabel}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[10px] font-medium normal-case">
              <Clock className="size-3" aria-hidden />
              {path.totalDuration}
            </Badge>
            {path.level ? (
              <Badge variant="outline" className="text-[10px] font-medium normal-case">
                {academyLevelLabels[path.level]}
              </Badge>
            ) : null}
            {path.format ? (
              <Badge
                variant="outline"
                className="max-w-[200px] truncate text-[10px] font-normal normal-case"
                title={path.format}
              >
                {path.format}
              </Badge>
            ) : null}
          </div>
          <DialogTitle className="text-left text-[17px] font-semibold leading-snug text-slate-900 sm:text-[18px]">
            {path.title}
          </DialogTitle>
          <DialogDescription className="text-left text-[13px] leading-relaxed text-slate-600">
            {path.description}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 sm:px-8 sm:py-6">
          <div className="space-y-6 pb-2">
            {d?.overviewExtended ? (
              <section className="space-y-2">
                <SectionTitle icon={Sparkles}>О программе подробно</SectionTitle>
                <p className="text-[13px] leading-relaxed text-slate-700">{d.overviewExtended}</p>
              </section>
            ) : null}

            {path.audience || d?.audienceDetail ? (
              <section className="space-y-2">
                <SectionTitle icon={Target}>Для кого</SectionTitle>
                {path.audience ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {path.audience}
                  </p>
                ) : null}
                {d?.audienceDetail ? (
                  <p className="text-[13px] leading-relaxed text-slate-700">{d.audienceDetail}</p>
                ) : null}
              </section>
            ) : null}

            {d?.competencies?.length ? (
              <section className="space-y-2">
                <SectionTitle icon={GraduationCap}>Компетенции после прохождения</SectionTitle>
                <BulletList items={d.competencies} icon={CheckCircle2} />
              </section>
            ) : null}

            {d?.prerequisites?.length ? (
              <section className="space-y-2">
                <SectionTitle icon={ClipboardList}>Входные требования</SectionTitle>
                <BulletList items={d.prerequisites} />
              </section>
            ) : null}

            <section className="space-y-2">
              <SectionTitle icon={Layers}>Состав программы по курсам</SectionTitle>
              <ol className="space-y-4">
                {path.courses.map((courseId, i) => {
                  const course = getCourseByIdForClient(courseId);
                  const block = d?.courseBlocks.find((b) => b.courseId === courseId);
                  return (
                    <li
                      key={courseId}
                      className="rounded-lg border border-slate-200/90 bg-white p-3 shadow-sm sm:p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#0b63ce]">
                          Шаг {i + 1}
                        </p>
                        {course ? (
                          <span className="text-[11px] text-slate-500">
                            {course.duration}
                            {course.provider ? ` · ${course.provider}` : ''}
                          </span>
                        ) : null}
                      </div>
                      {course ? (
                        <Link
                          href={ROUTES.clientAcademyCourse(courseId)}
                          className="text-[15px] font-semibold text-slate-900 underline-offset-2 hover:text-[#0b63ce] hover:underline"
                        >
                          {course.title}
                        </Link>
                      ) : (
                        <p className="text-[14px] font-semibold text-slate-800">{courseId}</p>
                      )}
                      {course ? (
                        <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                          {course.description}
                        </p>
                      ) : null}
                      {course ? (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {formatCoursePrice(course)}
                          {courseOutcomeLabel(course) ? ` · ${courseOutcomeLabel(course)}` : ''}
                        </p>
                      ) : null}
                      {block?.roleInPath ? (
                        <p className="mt-2 border-t border-slate-100 pt-2 text-[12px] font-medium text-slate-800">
                          Роль в траектории: {block.roleInPath}
                        </p>
                      ) : null}
                      {block?.narrative ? (
                        <p className="mt-1 text-[12px] leading-relaxed text-slate-700">
                          {block.narrative}
                        </p>
                      ) : null}
                      {block?.keyUnits?.length ? (
                        <div className="mt-2">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Ключевые модули
                          </p>
                          <ul className="list-inside list-disc space-y-0.5 text-[12px] text-slate-700">
                            {block.keyUnits.map((u) => (
                              <li key={u}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {course?.curriculum?.length && !block?.keyUnits?.length ? (
                        <div className="mt-2">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Темы курса
                          </p>
                          <ul className="list-inside list-disc space-y-0.5 text-[12px] text-slate-700">
                            {course.curriculum.map((u) => (
                              <li key={u}>{u}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {block?.labOrProject ? (
                        <div className="mt-2 rounded-md border border-indigo-100 bg-indigo-50/60 px-2.5 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-800">
                            Практика / проект
                          </p>
                          <p className="mt-0.5 text-[12px] leading-snug text-indigo-950">
                            {block.labOrProject}
                          </p>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </section>

            {d?.workload ? (
              <section className="space-y-2">
                <SectionTitle icon={Clock}>Нагрузка и ритм</SectionTitle>
                <p className="text-[13px] leading-relaxed text-slate-700">{d.workload}</p>
              </section>
            ) : null}

            {d?.assessmentAndCert ? (
              <section className="space-y-2">
                <SectionTitle icon={Shield}>Аттестация</SectionTitle>
                <p className="text-[13px] leading-relaxed text-slate-700">{d.assessmentAndCert}</p>
              </section>
            ) : null}

            <section className="space-y-2">
              <SectionTitle icon={Award}>Сертификация и итог</SectionTitle>
              <p className="text-[13px] font-semibold leading-snug text-emerald-800">
                {path.outcome}
              </p>
              {d?.certificationDetail ? (
                <p className="text-[13px] leading-relaxed text-slate-700">
                  {d.certificationDetail}
                </p>
              ) : null}
            </section>

            {d?.tools?.length ? (
              <section className="space-y-2">
                <SectionTitle icon={Wrench}>Инструменты и материалы</SectionTitle>
                <BulletList items={d.tools} />
              </section>
            ) : null}

            {d?.readings?.length ? (
              <section className="space-y-2">
                <SectionTitle icon={BookOpen}>Рекомендованные материалы</SectionTitle>
                <BulletList items={d.readings} />
              </section>
            ) : null}

            {d?.faq?.length ? (
              <section className="space-y-3">
                <SectionTitle icon={HelpCircle}>Частые вопросы</SectionTitle>
                <div className="space-y-3">
                  {d.faq.map((item) => (
                    <div
                      key={item.question}
                      className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                    >
                      <p className="text-[12px] font-semibold text-slate-900">{item.question}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {d?.finePrint ? (
              <p className="text-[11px] leading-relaxed text-slate-500">{d.finePrint}</p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t border-slate-100 bg-slate-50/90 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full rounded-lg border-slate-200 text-[12px] font-semibold sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Закрыть
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-full rounded-lg text-[12px] font-semibold sm:w-auto"
            asChild
          >
            <Link href={pathHref}>Страница программы</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
