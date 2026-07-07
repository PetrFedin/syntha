'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACADEMY_ENROLLMENT_EVENT,
  academyCohortChatId,
  academyStaffChatId,
  getEnrolledCourseIds,
} from '@/lib/academy/academy-course-chats';
import { getCourseByIdForClient } from '@/lib/academy-catalog';
import { getCourseById } from '@/lib/education-data';
import { ROUTES } from '@/lib/routes';
import { ACADEMY_CTA_SECONDARY } from '@/lib/ui/academy-cta';

function courseTitle(id: string): string {
  return getCourseByIdForClient(id)?.title ?? getCourseById(id)?.title ?? id;
}

function messagesHref(role: 'shop' | 'brand', chatId: string): string {
  return role === 'shop' ? ROUTES.shop.messagesChat(chatId) : ROUTES.brand.messagesChat(chatId);
}

type AcademyClientLearningBarProps = {
  /** Куда вести встроенные сообщения: ЛК ритейла или кабинет бренда */
  messagesRole: 'shop' | 'brand';
  /** Показать только эти курсы (например модули текущей программы) */
  limitToCourseIds?: string[];
  className?: string;
};

/**
 * Компактная полоса «Моё обучение»: зачисленные курсы и быстрые ссылки на чаты куратора и группы.
 */
export function AcademyClientLearningBar({
  messagesRole,
  limitToCourseIds,
  className,
}: AcademyClientLearningBarProps) {
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(ACADEMY_ENROLLMENT_EVENT, bump);
    return () => window.removeEventListener(ACADEMY_ENROLLMENT_EVENT, bump);
  }, []);

  const ids = React.useMemo(() => {
    const enrolled = getEnrolledCourseIds();
    const base =
      limitToCourseIds && limitToCourseIds.length > 0
        ? enrolled.filter((id) => limitToCourseIds.includes(id))
        : enrolled;
    return [...base].sort((a, b) => courseTitle(a).localeCompare(courseTitle(b), 'ru'));
  }, [limitToCourseIds, version]);

  if (ids.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-sm border border-[#c5ccd6] bg-[#f7f8fa] px-3 py-2.5 sm:px-4',
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#6b7788]">
        <GraduationCap className="size-3.5 text-[#0b63ce]" aria-hidden />
        Моё обучение
      </div>
      <ul className="flex flex-col gap-2">
        {ids.map((courseId) => {
          const title = courseTitle(courseId);
          const short = title.length > 56 ? `${title.slice(0, 54)}…` : title;
          return (
            <li
              key={courseId}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6e9ef] pb-2 last:border-0 last:pb-0"
            >
              <Link
                href={
                  messagesRole === 'shop'
                    ? ROUTES.clientAcademyCourse(courseId)
                    : ROUTES.brand.academyPlatformCourse(courseId)
                }
                className="min-w-0 flex-1 text-[12px] font-semibold text-[#0b63ce] hover:underline"
              >
                {short}
              </Link>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={messagesHref(messagesRole, academyStaffChatId(courseId))}
                  className={cn(ACADEMY_CTA_SECONDARY, 'px-2')}
                  title="Чат с куратором"
                >
                  <MessageCircle className="size-3.5 text-[#0b63ce]" aria-hidden />
                  Куратор
                </Link>
                <Link
                  href={messagesHref(messagesRole, academyCohortChatId(courseId))}
                  className={cn(ACADEMY_CTA_SECONDARY, 'px-2')}
                  title="Группа участников"
                >
                  <Users className="size-3.5 text-[#0b63ce]" aria-hidden />
                  Группа
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
